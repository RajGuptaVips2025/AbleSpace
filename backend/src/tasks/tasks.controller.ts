import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '../auth/jwt-auth.guard';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
  ) { }

  @Post('create-task')
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tasksService.create(
      createTaskDto,
      req.user!.id,
    );
  }

  @Get('getAll-tasks')
  findAll() {
    return this.tasksService.findAll();
  }

  @Get('get-tasks')
  findByUser(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tasksService.findByUser(
      req.user!.id,
    );
  }

  @Get('project/:projectId')
  findByProject(
    @Param('projectId') projectId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tasksService.findByProject(
      projectId,
      req.user!.id,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tasksService.findOne(
      id,
      req.user!.id,
    );
  }

  @Get(':id/subtasks')
  findSubtasks(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tasksService.findSubtasks(
      id,
      req.user!.id,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tasksService.update(
      id,
      updateTaskDto,
      req.user!.id,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tasksService.remove(
      id,
      req.user!.id,
    );
  }

  @Post(':id/add-comment')
  addComment(
    @Param('id') id: string,
    @Body('comment') comment: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tasksService.addComment(
      id,
      comment,
      req.user!.id,
    );
  }
}