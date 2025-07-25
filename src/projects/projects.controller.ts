import {
  Body,
  Req,
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './entity/projects.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser } from 'src/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ProjectTimelineDto } from './dto/project-timeline.dto';

@Controller('api/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createProject(
    @Body() dto: CreateProjectDto,
    @Req() req,
  ): Promise<Project> {
    const user = req.user;
    return this.projectsService.createProject(dto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllProjects(@AuthUser('id') userId): Promise<Project[]> {
    return this.projectsService.getAllProjects(userId);
  }

  @Get('progress-rate')
  @UseGuards(JwtAuthGuard)
  async getProgressRate(@AuthUser('id') userId) {
    return this.projectsService.getProgressRate(userId);
  }

  @Get('timeline')
  @UseGuards(JwtAuthGuard)
  async getTimeline(@AuthUser('id') userId): Promise<ProjectTimelineDto[]> {
    return this.projectsService.getTimeline(userId);
  }

  @Get('counts')
  @UseGuards(JwtAuthGuard)
  async getCounts(@AuthUser('id') userId) {
    return this.projectsService.getCounts(userId);
  }

  @Get('titles')
  @UseGuards(JwtAuthGuard)
  async getTitles(@AuthUser('id') userId) {
    return this.projectsService.getTitles(userId);
  }

  @Get('shared')
  @UseGuards(JwtAuthGuard)
  async getShared(@AuthUser('id') userId) {
    return this.projectsService.getShared(userId);
  }

  @Get(':project_id')
  @UseGuards(JwtAuthGuard)
  async getProject(
    @Param('project_id') project_id,
    @AuthUser('id') userId,
  ): Promise<Project> {
    return this.projectsService.getProject(+project_id, userId);
  }

  @Patch(':project_id')
  @UseGuards(JwtAuthGuard)
  async updateProject(
    @Param('project_id') project_id,
    @AuthUser('id') userId,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    return this.projectsService.updateProject(
      +project_id,
      userId,
      updateProjectDto,
    );
  }

  @Delete(':project_id')
  @UseGuards(JwtAuthGuard)
  async deleteProject(@Param('project_id') project_id, @AuthUser('id') userId) {
    return this.projectsService.deleteProject(+project_id, userId);
  }

  @Patch(':project_id/status')
  async update(
    @AuthUser('id') id: number,
    @Param('project_id') landmark_id: number,
  ) {
    return this.projectsService.updateShared(id, landmark_id);
  }
}
