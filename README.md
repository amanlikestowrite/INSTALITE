# INSTALITE

A RESTful backend for a photo-sharing application built with Express and Prisma ORM.

## Features

- **Users & Profiles**: Complete user management with pagination, search, and privacy filters.
- **Posts & Relations**: One-to-many relationship linking posts to their authors.
- **Likes & Social Interaction**: Many-to-many explicit join table handling likes and unlikes with atomic duplicate prevention.
- **Cascading Deletes**: Automatic cleanup of dependent posts and likes when accounts are removed.
- **Feed Queries**: Filter posts by likes, locations, and authors with cursor/offset pagination.

## Tech Stack

- Node.js & Express
- Prisma ORM v7
- SQLite (via `@prisma/adapter-better-sqlite3`)

## Getting Started

### Installation
```bash
npm install
```

### Database Migration & Seed
```bash
npx prisma migrate dev
npm run seed
```

### Running the Server
```bash
npm run dev
```
