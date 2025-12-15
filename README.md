# Image Upload Service Exercise

## Context

You've joined a team that inherited this image upload application. The product team has collected user feedback and identified several pain points:

- *"I uploaded way too many images yesterday and now my storage is full"*
- *"Some users are abusing the system and uploading hundreds of images"*
- *"I can't tell how many more images I can upload today"*
- *"There's no way to know if I'm close to hitting any limits"*

The previous developer built a functional MVP, but it lacks the guardrails needed for a production environment.

## Your Task (~1 hour)

### Primary Exercise: Implement Upload Quotas

Address the user feedback by implementing a quota system:

1. **Per-user daily limit:** Each user can upload a maximum of 5 images per day
2. **Global daily limit:** No more than 100 image uploads per day across all users
3. **Quota enforcement:** The upload endpoint should reject requests that exceed either quota
4. **User feedback:** Display clear quota information in the UI (current usage, remaining uploads)
5. **Error handling:** Return appropriate error messages when limits are reached

### Bonus: User Authentication & Ownership

If time permits, add a more complete user management system:

1. Add user registration and login endpoints
2. Associate images with their owners
3. Restrict image deletion to owners only
4. Update the frontend to support authenticated sessions

## What We're Evaluating

- **Problem prioritization:** How you break down and tackle the requirements
- **API design:** Clean, RESTful endpoints with proper status codes
- **User experience:** Clear feedback and intuitive error messages
- **Code quality:** Organization, readability, and maintainability
- **Edge case handling:** What happens at boundaries and failure points

We're more interested in your thought process and trade-off decisions than seeing everything completed. Feel free to leave TODOs or notes about what you would do with more time.

---

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/get-started)
- [Docker Compose v2.17+](https://docs.docker.com/compose/compose-v2/) (for `docker compose watch`)

---

## Running the Project

From the project root, run:

```bash
docker compose up --build
```

Or, for live reload on file changes (recommended for development):

```bash
docker compose watch
```

---

## Project Structure

```
backend/    # FastAPI app (Python)
frontend/   # Vite + React app (JS/TS)
docker-compose.yml
```

---

## Accessing the Apps

- **Backend (FastAPI):** [http://localhost:8000](http://localhost:8000)
- **Frontend (Vite React):** [http://localhost:5173](http://localhost:5173)

---

## Development Notes

- **Backend:**
  - Hot reload enabled via `uvicorn --reload` and Docker volume mount.
  - Edit code in `backend/` and changes will reflect automatically.
- **Frontend:**
  - Hot reload enabled via Vite dev server and Docker volume mount.
  - Edit code in `frontend/` and changes will reflect automatically.

---
