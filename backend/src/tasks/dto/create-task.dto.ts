import {
    IsArray,
    IsDateString,
    IsIn,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
} from "class-validator";

export class CreateTaskDto {
    @IsUUID()
    project_id!: string;

    @IsOptional()
    @IsUUID()
    parent_id?: string | null;

    @IsString()
    @MaxLength(255)
    title!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsIn([
        "Backlog",
        "To Do",
        "Doing",
        "Completed",
        "On Hold",
    ])
    status?: string;

    @IsOptional()
    @IsIn([
        "No Priority",
        "Urgent",
        "High",
        "Medium",
        "Low",
    ])
    priority?: string;

    @IsOptional()
    @IsDateString()
    due_date?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    labels?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    resources?: string[];
}









