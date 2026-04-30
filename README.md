# EasyEats — NestJS + React

A restaurant listing and review app, it also can show and filter nutrition facts for added restaurants. NestJS backend + React/Vite frontend in a single unified project.

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | NestJS, TypeORM, MySQL, Passport JWT|
| Frontend | React 18, React Router v6, Vite     |
| Auth     | JWT Bearer tokens (1-hour expiry)   |
| Uploads  | Multer disk storage → `/uploads`    |

---

## Project Structure

```
easyeats/
├── src/                    ← NestJS API (port 3000)
│   ├── entities.ts         ← all TypeORM entities
│   ├── guards.ts           ← JwtAuthGuard, AdminGuard
│   ├── auth.ts             ← login/register + JWT strategy
│   ├── users.ts            ← admin user management
│   ├── restaurants.ts      ← CRUD, search, image uploads
│   ├── comments.ts         ← comments with CAPTCHA
│   ├── captcha.ts          ← SVG CAPTCHA + token store
│   ├── nutrition.ts        ← nutrition search + CSV import
│   ├── app.module.ts
│   └── main.ts
├── client/                 ← React + Vite frontend
│   └── src/
│       ├── api.ts          ← typed fetch wrappers
│       ├── auth.tsx        ← AuthContext + Navbar
│       ├── components/     ← RestaurantCard
│       ├── pages/          ← Home, Login, Register, Restaurant,
│       │                     Search, Categories, Category,
│       │                     RestaurantForm (create + edit),
│       │                     ManageUsers, NutritionSearch
│       ├── App.tsx
│       └── index.css
├── uploads/                ← restaurant images (git-ignored)
├── .env.example
└── package.json
```

---

## Prerequisites

- **Node.js** 18+
- **MySQL** running with the `serverside` database

---

## Setup
Note: This only needs to be ran one time before starting up the project for the first time
```bash
# Install deps for backend + frontend, copy .env.example → .env
npm run setup
```

Edit `.env` with your database credentials and a JWT secret:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=serveruser
DB_PASSWORD=your_password
DB_DATABASE=serverside

JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRATION=1h

PORT=3000
```

---

## Development

Run both servers at once (Vite proxies `/api` and `/uploads` to NestJS):

```bash
npm run dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173

Or run them separately:

```bash
npm run start:dev      # backend, terminal 1
cd client && npm run dev   # frontend, terminal 2
```

---

## Production

```bash
npm run build       # builds client, then backend
npm start           # serves both from port 3000
```

Then open **http://localhost:3000**.

---

## API Endpoints

| Method | Path                                  | Auth     | Description                  |
|--------|---------------------------------------|----------|------------------------------|
| POST   | /api/auth/login                       | —        | Login, returns JWT           |
| POST   | /api/auth/register                    | —        | Register, returns JWT        |
| GET    | /api/restaurants                      | —        | List all restaurants         |
| GET    | /api/restaurants/categories           | —        | List categories              |
| GET    | /api/restaurants/search               | —        | Search by keyword/category   |
| GET    | /api/restaurants/:id                  | —        | Restaurant + menu + comments |
| POST   | /api/restaurants                      | JWT      | Create (with image)          |
| PATCH  | /api/restaurants/:id                  | JWT      | Update (with image)          |
| DELETE | /api/restaurants/:id                  | JWT      | Delete                       |
| POST   | /api/restaurants/:id/comments         | —        | Post comment (CAPTCHA)       |
| GET    | /api/captcha                          | —        | Get CAPTCHA SVG + token      |
| GET    | /api/nutrition/search                 | —        | Search nutrition items       |
| GET    | /api/nutrition/restaurant/:id         | —        | Nutrition for one restaurant |
| POST   | /api/nutrition/restaurant/:id/upload  | JWT      | Upload CSV                   |
| DELETE | /api/nutrition/restaurant/:id         | JWT      | Clear nutrition data         |
| GET    | /api/users                            | Admin    | List all users               |
| PATCH  | /api/users/:id                        | Admin    | Update user                  |
| DELETE | /api/users/:id                        | Admin    | Delete user                  |

---

## Database Schema

The app connects to the **existing MySQL schema** unchanged. `synchronize: false` in TypeORM ensures no tables are modified. Entities map to:

- `users` — user_id, email, password_hash, name, role
- `restaurants` — restaurant_id, name, address, image_filename
- `menu` — menu_id, restaurant_id, name, price
- `comments` — comment_id, restaurant_id, name, comment, created_at
- `nutrition` — nutrition_id, restaurant_id, item_name, calories, protein, sodium