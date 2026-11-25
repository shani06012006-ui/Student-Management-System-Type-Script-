# EduTrack – Student Management System

Full-stack project: **Django REST Framework** backend (JWT auth) + **React 18 + TypeScript** frontend (Vite).

```
student-management-system/
├── backend/        Django project (config/, students/)
└── frontend/       React + TypeScript app (src/)
```

## 1. Backend (Django)

Requires Python 3.10+.

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

python manage.py makemigrations students
python manage.py migrate
python manage.py seed_students    # creates admin/admin123 + 8 demo students
python manage.py runserver        # http://127.0.0.1:8000
```

Useful endpoints (all except login/refresh need `Authorization: Bearer <access>`):

| Method | URL | Purpose |
| --- | --- | --- |
| POST | `/api/auth/login/` | Get access + refresh tokens |
| POST | `/api/auth/refresh/` | Refresh access token |
| GET | `/api/students/` | Paginated list (`?search=`, `?status=`, `?department=`, `?ordering=`, `?page=`) |
| POST | `/api/students/` | Create student |
| GET/PATCH/PUT/DELETE | `/api/students/{id}/` | Read / update / delete |
| GET | `/api/students/stats/` | Dashboard statistics |
| – | `/admin/` | Django admin |

## 2. Frontend (React + TypeScript)

Requires Node.js 18+.

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Optional: set `VITE_API_URL` in a `.env` file if the API is not at `http://127.0.0.1:8000/api`.

Other scripts:
- `npm run typecheck` – runs `tsc --noEmit`
- `npm run build` – type-checks and creates a production build in `dist/`

## Features

- JWT login with automatic access-token refresh
- Protected routes
- Dashboard with stat cards and department bar chart
- Student table with debounced search, status/department filters, sorting by API, and pagination
- Add / edit student modal with client-side validation and server error display
- Delete with confirmation
- Responsive layout (sidebar collapses on small screens)

## TypeScript highlights

- `Student`, `StudentPayload`, `PaginatedResponse<T>`, `DashboardStats` interfaces mirror the Django API
- Typed Axios service layer (`src/services/`)
- Discriminated union for modal state (`closed | create | edit`)
- `Record<Department, string>` label maps keep UI in sync with the backend choices
- Generic custom hook (`useDebouncedValue<T>`) and typed Context (`AuthContext`)
