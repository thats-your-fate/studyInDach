# Plesk / Passenger Deployment

Use the project root as the Node application root and `public` as the document root.

Recommended Plesk settings:

- Application root: repository/project root
- Document root: `public`
- Application startup file: `app.js`
- Application mode: `production`
- Node command: your server's supported Node.js version, preferably Node 20+

Build command:

```bash
npm run plesk:build
```

Start command:

```bash
npm run start:passenger
```

The app uses Prisma SQLite by default. Keep `DATABASE_URL="file:./dev.db"` relative to the `prisma` directory behavior used by Prisma, or switch to a production database when needed.
