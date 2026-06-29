# Database Seeding

## Overview

The database seeding is handled via a bash script (`scripts/seed-db.sh`) that uses `psql` to insert dummy data into the database tables if they are empty.

## How It Works

1. The script checks if tables have any records using `psql` queries
2. For each empty table, it inserts a single dummy entry
3. If a table already has data, it skips insertion (idempotent)

## Dummy Data

### User
- **Username**: demo
- **Email**: demo@example.com
- **ID**: 550e8400-e29b-41d4-a716-446655440000
- **Password hash**: sha256('password') for testing

### Active Game
- **Name**: Demo Hearts Game
- **Type**: hearts
- **ID**: 650e8400-e29b-41d4-a716-446655440000

### Hearts Record
- **Game ID**: Links to the demo active game
- **Player ID**: Links to the demo user
- **Hand Number**: 1
- **Trick**: 0
- **Points Taken**: 0

## Running Manually

You can run the seed script manually with:

```bash
bash apps/async-games-backend/scripts/seed-db.sh
```

Or with custom database settings:

```bash
DB_HOST=placeholder \
DB_PORT=placeholder \
DB_USERNAME=placeholder \
DB_PASSWORD=placeholder \
DB_NAME=placeholder \
bash apps/async-games-backend/scripts/seed-db.sh
```

## Environment Variables

The script respects the following environment variables (uses defaults if not set):

- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_USERNAME` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name

These match the NestJS `database.config.ts` settings.

## Modifying Seed Data

To change the dummy data, edit `scripts/seed-db.sh` and modify the SQL `INSERT` statements in the corresponding table checks.
