# README

Bugs found. Fix later

1. Frontend datetime doesn't match the time and minutes when created. Issue with formatting & timezone
2. Create stock. Validation doesn't work when location hasn't been selected. Actually works, but need to press "add location" first to see the input error
3. Remove add permissions button
4. Table data fix ordering should display the most recent first (based on updated at). Or don't create asc and desc filters
5. Replace tanstack hooks usage (useMutation and useQuery) with plain JavaScript fetch & useState
6. In request, the data at the top should match status order: pending, approved. Same as number 4
7. Hide tanstack developer tools



TEACH DEWI TO:

Build a todo feature

1. Implement backend
  1a. Build new module
  1b. Build new route
  1c. Register new route
  1d. Create new schema. Register schema to database config and run db generate and migration
  1e. Create new service (CRUD)
  1f. Protect the route with auth middleware
  1g. Protect the route with require permission middleware
  1h. Create log for all CRUD operation

2. Implement frontend
  2a. Create new route
  2b. Create new page with title and description
  2c. Create new table
  2d. Create a new create page (create todo)
  2e. Create edit page
  2f. Create delete action
  2g. Craete view detail action
  2h. Integrate with API
  2i. Protect with PermissionGuard
