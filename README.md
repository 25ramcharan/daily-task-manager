# Daily Task Manager

A Spring Boot task-management REST API with a modern web dashboard, connected directly to MySQL and deployable to Render.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/25ramcharan/daily-task-manager)

## GitHub Repository
[https://github.com/25ramcharan/daily-task-manager](https://github.com/25ramcharan/daily-task-manager)

---

## MySQL Workbench Connection

The backend connects directly to your local MySQL 8.0 server.

### Connection Parameters:
- **Hostname / Host**: `127.0.0.1` (or `localhost`)
- **Port**: `3306`
- **Username**: `root` (or `admin`)
- **Password**: `root`
- **Database / Schema**: `daily_task_manager`

### Inspecting Data in MySQL Workbench:
Open MySQL Workbench, connect with the credentials above, and run:
```sql
USE daily_task_manager;
SHOW TABLES;
SELECT * FROM tasks;
```

---

## Local Backend & Dashboard Links

Once the application is running:

- **Web Dashboard**: [http://localhost:8080/](http://localhost:8080/)
- **Backend Task API**: [http://localhost:8080/api/tasks](http://localhost:8080/api/tasks)

### Task REST API Endpoints:
- `GET /api/tasks` — List all tasks
- `GET /api/tasks/{id}` — Get single task by ID
- `POST /api/tasks` — Create a new task (JSON body: `{"title": "...", "description": "...", "completed": false}`)
- `PUT /api/tasks/{id}` — Update task
- `DELETE /api/tasks/{id}` — Delete task

---

## Run Locally

```powershell
.\mvnw.cmd package -DskipTests
java -jar target/daily-task-manager-0.0.1-SNAPSHOT.jar
```

Or run via Maven:
```powershell
.\mvnw.cmd spring-boot:run
```

---

## Deploy to Render

### Option 1: 1-Click Blueprint Deploy (Recommended)
Click the badge below or visit:
[https://render.com/deploy?repo=https://github.com/25ramcharan/daily-task-manager](https://render.com/deploy?repo=https://github.com/25ramcharan/daily-task-manager)

Render will automatically parse `render.yaml` and deploy your Web Service.

### Option 2: Render Dashboard Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** -> **Web Service**
3. Select your repository: `25ramcharan/daily-task-manager`
4. Choose **Docker** environment (or **Java**)
5. Set Health Check path to `/`
6. Click **Create Web Service**
7. Once deployment finishes, Render provides your live project URL (e.g. `https://daily-task-manager.onrender.com`).
