import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

const formatDateStr = (val: Date | string | null | undefined): string | null => {
    if (!val) return null;
    if (typeof val === 'string') {
        const match = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) return `${match[1]}-${match[2]}-${match[3]}`;
        return val.split('T')[0].split(' ')[0];
    }
    const year = val.getFullYear();
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const day = String(val.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

@Injectable()
export class TasksService {
    constructor(private readonly db: DatabaseService) { }


    async create(dto: CreateTaskDto, userId: string) {
        try {
            const projectResult = await this.db.query(
                `
                SELECT id, due_date::text AS due_date
                FROM projects
                WHERE id = $1
                  AND user_id = $2
                `,
                [dto.project_id, userId],
            );

            if (projectResult.rows.length === 0) {
                throw new NotFoundException(
                    'Project not found or you do not have access to it',
                );
            }

            const project = projectResult.rows[0];

            if (dto.due_date && project.due_date) {
                const taskDateStr = formatDateStr(dto.due_date);
                const projectDateStr = formatDateStr(project.due_date);

                if (taskDateStr && projectDateStr && taskDateStr > projectDateStr) {
                    throw new BadRequestException(
                        `Task due date (${taskDateStr}) cannot be later than project due date (${projectDateStr})`,
                    );
                }
            }

            if (dto.parent_id) {
                const parentResult = await this.db.query(
                    `
                    SELECT task_id, project_id, parent_id
                    FROM tasks
                    WHERE task_id = $1
                      AND user_id = $2
                    `,
                    [dto.parent_id, userId],
                );

                if (parentResult.rows.length === 0) {
                    throw new NotFoundException(
                        'Parent task not found or you do not have access to it',
                    );
                }

                const parentTask = parentResult.rows[0];

                if (parentTask.project_id !== dto.project_id) {
                    throw new BadRequestException(
                        'Subtask must belong to the same project as its parent task',
                    );
                }

                if (parentTask.parent_id) {
                    throw new BadRequestException(
                        'A subtask cannot have another subtask',
                    );
                }
            }

            const query = `
                INSERT INTO tasks (
                  user_id,
                  project_id,
                  title,
                  description,
                  status,
                  priority,
                  due_date,
                  labels,
                  resources,
                  parent_id
                )
                VALUES (
                  $1,
                  $2,
                  $3,
                  $4,
                  $5,
                  $6,
                  $7,
                  COALESCE($8::text[], '{}'::text[]),
                  COALESCE($9::text[], '{}'::text[]),
                  $10
                )
                RETURNING *;
            `;

            const values = [
                userId,
                dto.project_id,
                dto.title,
                dto.description || null,
                dto.status || 'To Do',
                dto.priority || 'No Priority',
                dto.due_date || null,
                dto.labels && dto.labels.length > 0 ? dto.labels : null,
                dto.resources && dto.resources.length > 0 ? dto.resources : null,
                dto.parent_id || null,
            ];

            const result = await this.db.query(query, values);

            return result.rows[0];
        } catch (error) {
            console.error('Database Error in create task:', error);
            throw error;
        }
    }

    async findByUser(userId: string) {
        const query = `
      SELECT
        t.*,
        p.name AS project_name
      FROM tasks t
      LEFT JOIN projects p
        ON t.project_id = p.id
      WHERE t.user_id = $1
        AND t.parent_id IS NULL
      ORDER BY t.created_at DESC;
    `;

        const result = await this.db.query(query, [userId]);

        return result.rows;
    }

    async findByProject(projectId: string, userId: string) {
        const projectResult = await this.db.query(
            `
      SELECT id
      FROM projects
      WHERE id = $1
        AND user_id = $2
      `,
            [projectId, userId],
        );

        if (projectResult.rows.length === 0) {
            throw new NotFoundException(
                'Project not found or you do not have access to it',
            );
        }

        const query = `
      SELECT *
      FROM tasks
      WHERE project_id = $1
        AND user_id = $2
        AND parent_id IS NULL
      ORDER BY created_at DESC;
    `;

        const result = await this.db.query(query, [
            projectId,
            userId,
        ]);

        return result.rows;
    }

    async findAll() {
        const query = `
      SELECT
        t.*,
        u.name AS creator_name,
        u.email AS creator_email,
        p.name AS project_name
      FROM tasks t
      LEFT JOIN users u
        ON t.user_id = u.id
      LEFT JOIN projects p
        ON t.project_id = p.id
      WHERE t.parent_id IS NULL
      ORDER BY t.created_at DESC;
    `;

        const result = await this.db.query(query);

        return result.rows;
    }

    async findOne(taskId: string, userId: string) {
        const query = `
      SELECT
        t.*,
        u.name AS creator_name,
        u.email AS creator_email,
        p.name AS project_name
      FROM tasks t
      LEFT JOIN users u
        ON t.user_id = u.id
      LEFT JOIN projects p
        ON t.project_id = p.id
      WHERE t.task_id = $1
        AND t.user_id = $2;
    `;

        const result = await this.db.query(query, [
            taskId,
            userId,
        ]);

        if (result.rows.length === 0) {
            throw new NotFoundException(
                `Task with ID ${taskId} not found`,
            );
        }

        return result.rows[0];
    }

    async createSubtask(
        parentId: string,
        dto: Partial<CreateTaskDto>,
        userId: string,
    ) {
        const parentResult = await this.db.query(
            `
            SELECT task_id, project_id, parent_id, due_date::text AS due_date
            FROM tasks
            WHERE task_id = $1
              AND user_id = $2
            `,
            [parentId, userId],
        );

        if (parentResult.rows.length === 0) {
            throw new NotFoundException(
                'Parent task not found or you do not have access to it',
            );
        }

        const parentTask = parentResult.rows[0];

        if (parentTask.parent_id) {
            throw new BadRequestException(
                'A subtask cannot have another subtask (max depth reached)',
            );
        }

        return this.create(
            {
                ...dto,
                title: dto.title!,
                project_id: parentTask.project_id,
                parent_id: parentId,
            },
            userId,
        );
    }

    async findSubtasks(taskId: string, userId: string) {
        await this.findOne(taskId, userId);

        const query = `
      SELECT *
      FROM tasks
      WHERE parent_id = $1
        AND user_id = $2
      ORDER BY created_at ASC;
    `;

        const result = await this.db.query(query, [
            taskId,
            userId,
        ]);

        return result.rows;
    }

    async update(
        taskId: string,
        dto: UpdateTaskDto,
        userId: string,
    ) {
        const existingResult = await this.db.query(
            `
      SELECT *
      FROM tasks
      WHERE task_id = $1
        AND user_id = $2
      `,
            [taskId, userId],
        );

        if (existingResult.rows.length === 0) {
            throw new NotFoundException(
                `Task with ID ${taskId} not found`,
            );
        }

        const existingTask = existingResult.rows[0];

        const projectId =
            dto.project_id ?? existingTask.project_id;

        const dueDate =
            dto.due_date !== undefined
                ? dto.due_date
                : existingTask.due_date;

        const projectResult = await this.db.query(
            `
      SELECT id, due_date::text AS due_date
      FROM projects
      WHERE id = $1
        AND user_id = $2
      `,
            [projectId, userId],
        );

        if (projectResult.rows.length === 0) {
            throw new NotFoundException(
                'Project not found or you do not have access to it',
            );
        }

        const project = projectResult.rows[0];

        if (dueDate && project.due_date) {
            const taskDateStr = formatDateStr(dueDate);
            const projectDateStr = formatDateStr(project.due_date);

            if (taskDateStr && projectDateStr && taskDateStr > projectDateStr) {
                throw new BadRequestException(
                    `Task due date (${taskDateStr}) cannot be later than project due date (${projectDateStr})`,
                );
            }
        }

        if (
            dto.parent_id !== undefined &&
            dto.parent_id !== null
        ) {
            if (dto.parent_id === taskId) {
                throw new BadRequestException(
                    'A task cannot be its own parent',
                );
            }

            const parentResult = await this.db.query(
                `
        SELECT task_id, project_id, parent_id
        FROM tasks
        WHERE task_id = $1
          AND user_id = $2
        `,
                [dto.parent_id, userId],
            );

            if (parentResult.rows.length === 0) {
                throw new NotFoundException(
                    'Parent task not found',
                );
            }

            const parentTask = parentResult.rows[0];

            if (parentTask.project_id !== projectId) {
                throw new BadRequestException(
                    'Subtask must belong to the same project as its parent task',
                );
            }

            if (parentTask.parent_id) {
                throw new BadRequestException(
                    'A subtask cannot have another subtask',
                );
            }
        }

        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        Object.entries(dto).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        });

        if (fields.length === 0) {
            return this.findOne(taskId, userId);
        }

        values.push(taskId);
        values.push(userId);

        const query = `
      UPDATE tasks
      SET ${fields.join(', ')}
      WHERE task_id = $${paramIndex}
        AND user_id = $${paramIndex + 1}
      RETURNING *;
    `;

        const result = await this.db.query(query, values);

        if (result.rows.length === 0) {
            throw new NotFoundException(
                `Task with ID ${taskId} not found`,
            );
        }

        return result.rows[0];
    }

    async remove(taskId: string, userId: string) {
        const result = await this.db.query(
            `
      DELETE FROM tasks
      WHERE task_id = $1
        AND user_id = $2
      RETURNING task_id;
      `,
            [taskId, userId],
        );

        if (result.rows.length === 0) {
            throw new NotFoundException(
                `Task with ID ${taskId} not found`,
            );
        }

        return {
            message: 'Task deleted successfully',
            task_id: taskId,
        };
    }

    async addComment(
        taskId: string,
        comment: string,
        userId: string,
    ) {

        const query = `
      UPDATE tasks
      SET comments = array_append(
        COALESCE(comments, '{}'::text[]),
        $2
      )
      WHERE task_id = $1
        AND user_id = $3
      RETURNING *;
    `;

        const result = await this.db.query(query, [
            taskId,
            comment,
            userId,
        ]);

        if (result.rows.length === 0) {
            throw new NotFoundException(
                `Task with ID ${taskId} not found`,
            );
        }

        return result.rows[0];
    }
}