# Backend API Structure

This backend has been restructured using a clean API/route organization pattern.

## Directory Structure

```
backend/
├── config/
│   └── database.js          # Database configuration and connection
├── middleware/
│   ├── cors.js             # CORS middleware configuration
│   └── errorHandler.js     # Error handling middleware
├── routes/
│   ├── index.js            # Main routes index (mounts all route modules)
│   ├── plans.js            # Plan-related endpoints
│   ├── steps.js            # Plan step-related endpoints
│   └── health.js           # Health check endpoint
├── server-new.js           # Clean main server file
└── server.js               # Original messy server file (backup)
```

## API Endpoints

### Plans
- `GET /api/plans` - Get all plans
- `GET /api/plans/:id` - Get a single plan by ID
- `POST /api/plans` - Create a new plan
- `PUT /api/plans/:id` - Update a plan
- `DELETE /api/plans/:id` - Delete a plan

### Plan Steps
- `PATCH /api/plans/:planId/steps/:stepId` - Update plan step completion status

### Health
- `GET /api/health` - Health check endpoint

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables in `.env`:
   ```
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database
   DB_PORT=5432
   PORT=3001
   ```

3. Run the new server:
   ```bash
   node server-new.js
   ```

## Benefits of This Structure

- **Separation of Concerns**: Each file has a single responsibility
- **Modularity**: Easy to add new routes and features
- **Maintainability**: Code is organized and easy to navigate
- **Scalability**: Structure supports growth as the application expands
- **Testability**: Individual modules can be tested in isolation

## Migration

The original `server.js` file has been preserved as a backup. To use the new structure:

1. Test the new server with `node server-new.js`
2. If everything works correctly, you can replace `server.js` with `server-new.js`
3. Update your package.json scripts if needed 

## Social Login & JWT Environment Variables

Add these to your backend `.env` file:

```
GOOGLE_CLIENT_ID=840259996197-opie3rs5mhd0jqm1ovqpeqa9a2m8k926.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
FB_CLIENT_ID=your_facebook_client_id
FB_CLIENT_SECRET=your_facebook_client_secret
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
``` 