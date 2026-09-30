# CBTR (Online CBT Revision System)

A Progressive Web App for taking and managing timed Computer Based Tests, complete with gamification and full offline capabilities.

## Features

- **PWA Ready:** Installable on mobile and desktop, powered by Workbox and Vite.
- **True Offline Mode:** Download courses using IndexedDB. Take timed tests with no internet connection, and automatically sync your results and points when you reconnect.
- **Gamification:** Earn points for every correct answer.
- **Server-Side Enforcement:** Timers and grades are authoritative on the server to prevent cheating.
- **Admin Tools:** Bulk upload questions via CSV and monitor system-wide analytics.

## Tech Stack

- **Frontend:** React, Vite, React Router, IndexedDB (`idb`)
- **Backend:** Node.js, Express, MySQL 8
- **Authentication:** JWT (JSON Web Tokens) + bcrypt
- **Infrastructure:** Docker Compose (MySQL Database, Node API, Nginx Static File Server)

## Setup & Run

### Prerequisites
- Docker and Docker Compose installed.

### 1. Environment Setup
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

### 2. Start Services
Run the following command in the root directory:
```bash
docker-compose up --build
```
This will start:
- MySQL Database (`cbtr_mysql`) on port `3306`
- Backend API (`cbtr_api`) on port `5000`
- Frontend PWA (`cbtr_client`) on port `80`

### 3. Access the Application
Open your browser and navigate to: [http://localhost](http://localhost)

The database will be automatically seeded on first launch.

### Default Accounts
*   **Admin:** `admin@cbtr.local` | `password123`
*   **Student:** `student@student.local` | `password123`

## Testing Offline Mode

1. Login as the student.
2. Go to **Browse Courses**.
3. Click **"Download for Offline"** on any course. Wait for the "Available Offline" badge.
4. Open your browser's Developer Tools (F12) -> Network tab -> Select **"Offline"**.
5. Click **"Practice"** on one of the topics of the downloaded course.
6. Select **"Offline"** mode in the test setup and begin.
7. Complete the test. It will save locally to IndexedDB.
8. Go back to the Network tab and switch back to **"Online"** (No throttling).
9. Navigate to the **Dashboard**; the background sync logic will detect the connection, sync your results to the server, and update your total points.
