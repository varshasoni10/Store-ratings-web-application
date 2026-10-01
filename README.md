# Store Ratings Platform

A full-stack web app for submitting 1–5 star ratings for stores. It has one login for three roles: **System Administrator**, **Normal User** and **Store Owner**.

**Stack:** Express.js · PostgreSQL (Sequelize ORM) · React 18 (Vite, React Router) · JWT auth · bcrypt

## Setup

Prerequisites: Node 18+ and PostgreSQL 13+.

```bash
# 1. Create the database
createdb store_ratings

# 2. Backend
cd backend
cp .env.example .env      # then edit DB credentials and JWT_SECRET
npm install
npm run seed              # optional: demo users, stores and ratings
npm run dev               # http://localhost:5000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev               # http://localhost:5173 (proxies /api to :5000)
```

Tables are created on startup with `sequelize.sync()`. A default admin is created from the `ADMIN_*` values in `.env`.

### Demo accounts (after `npm run seed`)

| Role        | Email                    | Password       |
|-------------|--------------------------|----------------|
| Admin       | admin@storeratings.com   | `Admin@12345`  |
| Store owner | owner1@example.com       | `Password@123` |
| Store owner | owner2@example.com       | `Password@123` |
| Normal user | user1@example.com        | `Password@123` |
| Normal user | user2@example.com        | `Password@123` |

## Deploying (Render)

`render.yaml` describes a web service and a PostgreSQL database. In production the backend serves the built frontend, so the site and API share one URL.

1. On [render.com](https://render.com), choose **New → Blueprint** and connect this repository.
2. When prompted, enter an `ADMIN_PASSWORD` (8–16 characters, one uppercase letter and one special character).
3. Click **Apply**. Render builds the app, creates the database and gives you a `https://<name>.onrender.com` link.

The app reads the database location from `DATABASE_URL` when it is set, and from the `DB_*` variables otherwise. Set `DB_SSL=true` for hosts that require SSL.

## Database schema

```
users    id PK, name VARCHAR(60), email UNIQUE, password (bcrypt hash),
         address VARCHAR(400), role ENUM('ADMIN','USER','STORE_OWNER'), timestamps
stores   id PK, name VARCHAR(60), email UNIQUE, address VARCHAR(400),
         owner_id FK -> users.id (nullable, one store per owner), timestamps
ratings  id PK, user_id FK -> users.id, store_id FK -> stores.id,
         value INT CHECK 1..5, timestamps, UNIQUE(user_id, store_id)
```

- The `UNIQUE(user_id, store_id)` constraint allows one rating per user per store. Submitting again updates the existing rating.
- Average ratings are calculated from `ratings` when requested, not stored, so they are always current.

## API

All routes are under `/api`. Protected routes need `Authorization: Bearer <token>`.

| Method | Route                       | Role        | Purpose |
|--------|-----------------------------|-------------|---------|
| POST   | `/auth/signup`              | public      | Register a normal user |
| POST   | `/auth/login`               | public      | Log in (all roles) |
| GET    | `/auth/me`                  | any         | Current user |
| PUT    | `/auth/password`            | any         | Change password |
| GET    | `/admin/dashboard`          | admin       | Total users / stores / ratings |
| GET    | `/admin/users`              | admin       | List users (filters: `name,email,address,role`) |
| POST   | `/admin/users`              | admin       | Create user of any role |
| GET    | `/admin/users/:id`          | admin       | User details (+ rating for store owners) |
| GET    | `/admin/stores`             | admin       | List stores with rating (filters: `name,email,address`) |
| POST   | `/admin/stores`             | admin       | Create store, optionally with an owner |
| GET    | `/stores`                   | user        | Browse stores with overall rating and your rating (`name,address`) |
| PUT    | `/stores/:storeId/rating`   | user        | Submit or change a rating (1–5) |
| GET    | `/owner/dashboard`          | store owner | Your store's average rating and list of raters |

List endpoints accept `sortBy` and `sortOrder=ASC|DESC`. In the UI, click a column header to sort.

## Validation (enforced on both client and server)

- **Name:** 10–60 characters
- **Address:** required, max 400 characters
- **Password:** 8–16 characters, at least one uppercase letter and one special character
- **Email:** standard email format
- **Rating:** whole number from 1 to 5
