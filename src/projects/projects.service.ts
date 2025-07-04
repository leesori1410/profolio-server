import { Injectable, NotFoundException } from '@nestjs/common';
import { Project } from './entity/projects.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from 'src/users/entity/user.entity';
import { ProjectTimelineDto } from './dto/project-timeline.dto';
import { Task } from 'src/tasks/entity/task.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async createProject(
    createProjectDto: CreateProjectDto,
    user: User,
  ): Promise<Project> {
    const newProject = this.projectRepository.create({
      ...createProjectDto,
      team_members: user.name + "," + createProjectDto.team_members,
      member_profile: user.profile_image + "," + createProjectDto.member_profile,
      user_id: user.id,
      user: user,
    });

    console.log(newProject);

    return this.projectRepository.save(newProject);
  }

  async findProjectByProjectID(id): Promise<Project | null> {
    return await this.projectRepository.findOneBy({ id });
  }

  async getAllProjects(userId: number): Promise<Project[]> {
    return this.projectRepository.find({ where: { user_id: userId } });
  }

  async getProgressRate(
    userId: number,
  ): Promise<{ project_id: number; progress_rate: number }[]> {
    const result: { project_id: number; progress_rate: number }[] = [];

    const allProjects = await this.projectRepository.find({
      select: ['id'],
      where: { user_id: userId },
    });

    for (const prj of allProjects) {
      const allTasks = await this.taskRepository.count({
        where: { project_id: prj.id },
      });

      if (allTasks === 0) {
        result.push({ project_id: prj.id, progress_rate: 0 });
        continue;
      }

      const completedTasks = await this.taskRepository.count({
        where: { project_id: prj.id, is_done: true },
      });

      result.push({
        project_id: prj.id,
        progress_rate: Math.ceil((completedTasks / allTasks) * 100),
      });
    }

    return result;
  }

  async getTimeline(userId: number): Promise<ProjectTimelineDto[]> {
    return await this.projectRepository.find({
      select: ['id', 'title', 'start_date', 'end_date'],
      where: { user_id: userId },
    });
  }

  async getCounts(
    userId: number,
  ): Promise<{ in_progress: number; completed: number }> {
    const today = new Date();

    const inProgressCnt = await this.projectRepository.count({
      where: { user: { id: userId }, end_date: MoreThan(today) },
    });

    const completedCnt = await this.projectRepository.count({
      where: { user_id: userId, end_date: LessThanOrEqual(today) },
    });

    return {
      in_progress: inProgressCnt,
      completed: completedCnt,
    };
  }

  async getTitles(userId: number): Promise<{ id: number; title: string }[]> {
    return await this.projectRepository.find({
      select: ['id', 'title'],
      where: { user_id: userId },
    });
  }

  async getShared(userId: number): Promise<Project[]> {
    return await this.projectRepository.find({
      where: { user_id: userId, is_shared: true },
    });
  }

  async getProject(projectId: number, userId: number): Promise<Project> {
    console.log(projectId + ', ' + userId);
    return this.projectRepository.findOne({
      where: { id: projectId, user_id: userId },
    });
  }

  async updateProject(
    projectId: number,
    userId: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId, user_id: userId },
    });

    const newProject = {
      ...project,
      ...updateProjectDto,
    };

    newProject.id = project.id;

    return this.projectRepository.save(newProject);
  }

  async updateShared(user_id: number, id: number): Promise<Project> {
    const project = await this.getProject(id, user_id);
    if (!project) {
      throw new NotFoundException('Like not found');
    }

    project.is_shared = !project.is_shared;
    return await this.projectRepository.save(project);
  }

  async deleteProject(projectId: number, userId: number) {
    await this.projectRepository.delete({
      id: projectId,
      user_id: userId,
    });
  }
}
