# Moss & Meadow — SampleDB Dashboard

A small Express + Tailwind employee dashboard backed by the supplied MySQL database. Manage teammates from the browser, and enjoy a changing Studio Ghibli film pick from the linked films API.

## Requirements

- Node.js 18.17 or newer and npm
- MySQL or XAMPP with MySQL enabled

## Setup

1. Start MySQL in XAMPP (or start your local MySQL service).
2. Import `sampleDB.sql` in phpMyAdmin, or run the dump with your MySQL client. The script creates the `sampleDB` database and its `employees` table.
3. Copy `.env.example` to `.env`. Set `DB_USER` and `DB_PASSWORD` to match your local MySQL account. The defaults match a typical local XAMPP installation.
4. Install packages with `npm install`.
5. Start the development server with `npm run dev`, or use `npm start`. Tailwind CSS builds automatically before the server starts.
6. Visit `http://localhost:3000/` for the dashboard. The API health check is at `http://localhost:3000/health`; a healthy response reports `"database":"connected"`.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/employees` | List employees that have not been deleted |
| GET | `/api/employees/:id` | Get one employee |
| POST | `/api/employees` | Create an employee |
| PUT | `/api/employees/:id` | Update one or more employee fields |
| DELETE | `/api/employees/:id` | Soft-delete an employee |
| GET | `/api/films` | Proxy the public Studio Ghibli films API |

The dashboard supports employee search, status filtering, add/edit dialogs, and soft deletion. `/api/employees` and `/api/films` remain available for direct API access.

Create requests require `first_name`, `last_name`, `email`, `phone`, `organization`, and `designation`. `salary` defaults to `0` and `status` defaults to `1`. For example:

```json
{
  "first_name": "Alex",
  "last_name": "Morgan",
  "email": "alex@example.com",
  "phone": "555-0101",
  "organization": "Example Inc.",
  "designation": "Developer",
  "salary": 500,
  "status": 1
}
```

Run the validation tests with `npm test`. The API listens on port `3000` by default; set `PORT` in `.env` to change it.

## Postman backend checks

Import `postman/SampleDB-API.postman_collection.json` into Postman and run the collection in order. It checks database health, employee listing and CRUD, validation errors, deleted-record behavior, and the films proxy. It creates a uniquely named test employee and soft-deletes it at the end.

To run the same collection from a terminal with Postman's official CLI, install it with `npm install -g postman-cli`, then run `npm run test:api` while the API and MySQL are running. Running a local collection does not require a Postman API key.
