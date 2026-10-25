# Daily Task Manager

A Spring Boot task-management REST API.

## Web interface

Open `http://localhost:8080` for the task dashboard. It supports creating,
editing, completing, deleting, searching, and filtering tasks. The dashboard
uses the same `/api/tasks` endpoints as the REST API.

## Run locally

The application listens on `http://localhost:8080` and uses a local file-based
H2 database by default. The database file is saved under `data/`, with username
`admin` and password `root`, so you can start the app without installing or
configuring MySQL.

To use MySQL instead, set up the database and user with an administrator
account:

```sql
CREATE DATABASE IF NOT EXISTS daily_task_manager;
CREATE USER IF NOT EXISTS 'admin'@'localhost' IDENTIFIED BY 'root';
ALTER USER 'admin'@'localhost' IDENTIFIED BY 'root';
GRANT ALL PRIVILEGES ON daily_task_manager.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
```

Set `DB_USERNAME` and `DB_PASSWORD` to the MySQL credentials if they differ
from `admin` and `root`, then activate the MySQL profile:

```powershell
$env:SPRING_PROFILES_ACTIVE = "mysql"
.\mvnw.cmd spring-boot:run
```

For the default local H2 database, run:

```powershell
.\mvnw.cmd spring-boot:run
```

Run the command in a terminal. The app stays attached to that terminal; press
`Ctrl+C` there to stop it.

## Task API

- `GET /api/tasks` — list tasks
- `GET /api/tasks/{id}` — get one task
- `POST /api/tasks` — create a task
- `PUT /api/tasks/{id}` — update a task
- `DELETE /api/tasks/{id}` — delete a task

Task JSON fields are `title` (required), `description`, and `completed`.
