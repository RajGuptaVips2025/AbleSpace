import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly db: DatabaseService) { }

  async create(dto: CreateProjectDto, userId: string) {
    try {
      const query = `
        INSERT INTO projects (
          user_id,
          name,
          description,
          status,
          priority,
          due_date,
          team_name,
          labels,
          resources
        )
        VALUES (
          $1, 
          $2, 
          $3, 
          $4, 
          $5, 
          $6, 
          $7, 
          $8::text[], 
          $9::text[]
        )
        RETURNING *;
      `;

      const values = [
        userId,
        dto.name,
        dto.description || null,
        dto.status,
        dto.priority,
        dto.due_date,
        dto.team_name,
        dto.labels && dto.labels.length > 0 ? dto.labels : '{}',       
        dto.resources && dto.resources.length > 0 ? dto.resources : '{}', 
      ];

      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Database Error in create project:', error);
      throw error;
    }
  }

  async findByUser(userId: string) {
    const query = `
      SELECT *
      FROM projects
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await this.db.query(query, [userId]);
    return result.rows;
  }

  async findAll() {
    const query = `
      SELECT p.*, u.name AS creator_name, u.email AS creator_email
      FROM projects p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC;
    `;
    const result = await this.db.query(query);
    return result.rows;
  }

  async findOne(id: string) {
    const query = `
      SELECT p.*, u.name AS creator_name, u.email AS creator_email
      FROM projects p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = $1;
    `;
    const result = await this.db.query(query, [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return result.rows[0];
  }

  async update(id: string, dto: UpdateProjectDto) {
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
      return this.findOne(id);
    }

    values.push(id);
    const query = `
      UPDATE projects 
      SET ${fields.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const result = await this.db.query(query, values);
    if (result.rows.length === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return result.rows[0];
  }

  async remove(id: string) {
    const result = await this.db.query(
      'DELETE FROM projects WHERE id = $1 RETURNING id;',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return { message: 'Project deleted successfully', id };
  }

  async addComment(id: string, comment: string) {
    const query = `
      UPDATE projects 
      SET comments = array_append(COALESCE(comments, '{}'::text[]), $2)
      WHERE id = $1
      RETURNING *;
    `;
    const result = await this.db.query(query, [id, comment]);
    if (result.rows.length === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return result.rows[0];
  }
}