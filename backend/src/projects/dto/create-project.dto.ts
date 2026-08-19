import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum ProjectStatus {
  BACKLOG = 'Backlog',
  TO_DO = 'To Do',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  ON_HOLD = 'On Hold',
}

export enum ProjectPriority {
  NO_PRIORITY = 'No Priority',
  URGENT = 'Urgent',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

export class CreateProjectDto {
  @IsNotEmpty({ message: 'Project name is required' })
  @IsString()
  name!: string;

  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(ProjectStatus, {
    message: 'Status must be one of: Backlog, To Do, In Progress, Completed, On Hold',
  })
  status!: ProjectStatus;

  @IsNotEmpty({ message: 'Priority is required' })
  @IsEnum(ProjectPriority, {
    message: 'Priority must be one of: No Priority, Urgent, High, Medium, Low',
  })
  priority!: ProjectPriority;

  @IsNotEmpty({ message: 'Due date is required' })
  @IsDateString({}, { message: 'Due date must be a valid ISO date string (YYYY-MM-DD)' })
  due_date!: string;

  @IsNotEmpty({ message: 'Team name is required' })
  @IsString()
  team_name!: string;

  @IsOptional() 
  @IsArray({ message: 'Labels must be an array of strings' })
  @IsString({ each: true, message: 'Each label must be a string' })
  @ArrayMaxSize(5, { message: 'A maximum of 5 labels is allowed' })
  labels?: string[]; 

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray({ message: 'Resources must be an array of strings' })
  @IsString({ each: true, message: 'Each resource must be a string' })
  resources?: string[];
}
