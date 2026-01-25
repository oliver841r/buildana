# Buildana Full-Stack Application

This repository contains the Buildana marketing frontend and a production-ready Node.js/Express backend that connects to MySQL.

## Repository Structure

```
/
  ├── backend/           # Node.js/Express API
  ├── *.html             # Frontend pages
  ├── styles.css         # Frontend styles
  └── main.js            # Frontend behavior
```

## Frontend Setup

The frontend is a static site. You can open `index.html` directly or run the lightweight server included in `main.js`:

```bash
node main.js
```

The backend serves the frontend automatically in production (see `FRONTEND_DIR` in the backend `.env`).

## Backend Setup

### 1) Install dependencies

```bash
cd backend
npm install
```

### 2) Configure environment variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

### 3) Create the database

```sql
CREATE DATABASE buildana;
```

### 4) Run schema migrations

```bash
mysql -u root -p buildana < db/schema.sql
```

### 5) Start the server

```bash
npm run dev
```

The API will run at `http://localhost:4000` by default, and the Swagger docs are available at `http://localhost:4000/api/docs`.

## Connecting Frontend + Backend

- The contact form posts to `/api/contact`.
- Basic analytics page views are sent to `/api/analytics/pageview`.
- When the backend serves the frontend, these routes resolve automatically.
- If you host the frontend separately, configure a reverse proxy or update the form `data-api-endpoint` to the backend base URL.

## Deployment Instructions

### Heroku

1. Create a Heroku app and add the ClearDB or JawsDB MySQL add-on.
2. Configure environment variables in Heroku (DB credentials, email settings, `FRONTEND_DIR`).
3. Deploy the backend:
   ```bash
   git subtree push --prefix backend heroku main
   ```
4. Run the schema on the provisioned database.
5. Set the web process to `npm start`.

### AWS (EC2 + RDS)

1. Create an RDS MySQL instance and allow inbound traffic from the EC2 security group.
2. Provision an EC2 instance, install Node.js, and clone this repo.
3. Copy `.env.example` to `.env` and set DB credentials to match RDS.
4. Run the schema SQL against RDS.
5. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start backend/src/server.js --name buildana
   ```
6. Use Nginx as a reverse proxy and terminate SSL with ACM or Let’s Encrypt.

## Security Best Practices

- Helmet for secure headers.
- Rate limiting to mitigate abusive traffic.
- Input validation with `express-validator`.
- Prepared statements via `mysql2` to prevent SQL injection.
- Use HTTPS in production and store secrets in environment variables.

## Testing

From the `backend` directory:

```bash
npm test
```

## API Endpoints (Quick Reference)

- `POST /api/posts`
- `GET /api/posts`
- `GET /api/posts/:id`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`
- `POST /api/comments`
- `GET /api/comments/:postId`
- `POST /api/contact`
- `POST /api/analytics/pageview`

Refer to `/api/docs` for full Swagger documentation.
