import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard, type AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { AddCommentDto } from './dto/add-comment.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Post('create-project')
  create(
    @Body() createProjectDto: CreateProjectDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!req.user?.id) {
      throw new UnauthorizedException('User session expired or invalid');
    }
    const userId = req.user.id;
    return this.projectsService.create(createProjectDto, userId);
  }

  @Get('user/:userId')
  getUserProjects(@Param('userId') userId: string) {
    return this.projectsService.findByUser(userId);
  }

  @Get('get-project')
  findAll() {
    return this.projectsService.findAll();
  }

  @Get('get-project/:id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch('update-project/:id')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete('delete-project/:id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Post('add-comment/:id')
  addComment(
    @Param('id') id: string,
    @Body() addCommentDto: AddCommentDto,
  ) {
    return this.projectsService.addComment(id, addCommentDto.comment);
  }
}




