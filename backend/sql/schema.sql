-- =========================================================
-- 1. Enable UUID Extension
-- =========================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- =========================================================
-- 2. Drop existing triggers, functions, and tables
-- =========================================================
DROP TRIGGER IF EXISTS validate_task_due_date_trigger ON tasks;
DROP FUNCTION IF EXISTS check_task_due_date();
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =========================================================
-- 3. Users Table
-- =========================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    fallback_initials VARCHAR(10) DEFAULT 'DX',
    is_guest BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- 4. Projects Table
-- =========================================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'To Do',
    priority VARCHAR(50) DEFAULT 'No Priority',
    due_date DATE,
    team_name VARCHAR(100),
    labels TEXT[] DEFAULT '{}',
    resources TEXT[] DEFAULT '{}',
    comments TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Check Constraints
    CONSTRAINT projects_status_check CHECK (
        status IN ('Backlog', 'To Do', 'In Progress', 'Completed', 'On Hold')
    ),
    CONSTRAINT projects_priority_check CHECK (
        priority IN ('No Priority', 'Urgent', 'High', 'Medium', 'Low')
    )
);

-- =========================================================
-- 5. Tasks Table (with Parent-Child Subtask Hierarchy)
-- =========================================================
CREATE TABLE tasks (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES tasks(task_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'To Do',
    priority VARCHAR(50) DEFAULT 'No Priority',
    due_date DATE,
    labels TEXT[] DEFAULT '{}',
    resources TEXT[] DEFAULT '{}',
    comments TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Check Constraints
    CONSTRAINT tasks_status_check CHECK (
        status IN ('Backlog', 'To Do', 'Doing', 'Completed', 'On Hold')
    ),
    CONSTRAINT tasks_priority_check CHECK (
        priority IN ('No Priority', 'Urgent', 'High', 'Medium', 'Low')
    )
);

-- =========================================================
-- 6. Due Date Validation Trigger Function
-- =========================================================
CREATE OR REPLACE FUNCTION check_task_due_date() 
RETURNS TRIGGER AS $$
DECLARE 
    project_due DATE;
BEGIN
    SELECT due_date INTO project_due 
    FROM projects 
    WHERE id = NEW.project_id;

    IF project_due IS NOT NULL 
       AND NEW.due_date IS NOT NULL 
       AND NEW.due_date > project_due THEN
        RAISE EXCEPTION 'Task due date (%) cannot exceed project due date (%)', 
            NEW.due_date, project_due;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- 7. Attach Trigger to Tasks Table
-- =========================================================
CREATE TRIGGER validate_task_due_date_trigger 
BEFORE INSERT OR UPDATE ON tasks 
FOR EACH ROW 
EXECUTE FUNCTION check_task_due_date();

-- =========================================================
-- 8. Performance Indexes
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON tasks(parent_id);