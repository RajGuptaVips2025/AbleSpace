CREATE DATABASE taskboard_db;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    fallback_initials VARCHAR(10) DEFAULT 'DX',
    is_guest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    -- Status & Priority Enums from Design
    status VARCHAR(50) DEFAULT 'To Do' CHECK (
        status IN (
            'Backlog',
            'To Do',
            'In Progress',
            'Completed',
            'On Hold'
        )
    ),
    priority VARCHAR(50) DEFAULT 'No Priority' CHECK (
        priority IN ('No Priority', 'Urgent', 'High', 'Medium', 'Low')
    ),
    -- Dates & Assignments
    due_date DATE,
    lead_id UUID REFERENCES users(id) ON DELETE
    SET
        NULL,
        -- Main Project Lead
        reporter_id UUID REFERENCES users(id) ON DELETE
    SET
        NULL,
        -- Project Creator / Reporter
        -- Categorization & Metadata (From Fields Menu)
        team_name VARCHAR(100),
        -- e.g., 'Frontend', 'Design'
        labels TEXT [] DEFAULT '{}',
        -- e.g., ['V1 Launch', 'Q3']
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    -- Status & Priority matching UI
    status VARCHAR(50) DEFAULT 'To Do' CHECK (
        status IN (
            'Backlog',
            'To Do',
            'Doing',
            'Completed',
            'On Hold'
        )
    ),
    priority VARCHAR(50) DEFAULT 'No Priority' CHECK (
        priority IN ('No Priority', 'Urgent', 'High', 'Medium', 'Low')
    ),
    -- Relationships & Foreign Keys
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES users(id) ON DELETE
    SET
        NULL,
        -- "Members"
        reporter_id UUID REFERENCES users(id) ON DELETE
    SET
        NULL,
        -- "Reporter"
        parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
        -- Enables Subtasks
        -- Metadata & Dates
        team_name VARCHAR(100),
        labels TEXT [] DEFAULT '{}',
        due_date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE
OR REPLACE FUNCTION check_task_due_date() RETURNS TRIGGER AS $ $ DECLARE project_due DATE;

BEGIN
SELECT
    due_date INTO project_due
FROM
    projects
WHERE
    id = NEW.project_id;

IF project_due IS NOT NULL
AND NEW.due_date IS NOT NULL
AND NEW.due_date > project_due THEN RAISE EXCEPTION 'Task due date (%) cannot exceed project due date (%)',
NEW.due_date,
project_due;

END IF;

RETURN NEW;

END;

$ $ LANGUAGE plpgsql;

CREATE TRIGGER validate_task_due_date_trigger BEFORE
INSERT
    OR
UPDATE
    ON tasks FOR EACH ROW EXECUTE FUNCTION check_task_due_date();