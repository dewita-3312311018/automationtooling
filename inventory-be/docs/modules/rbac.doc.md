# RBAC Module

## 1. Module Overview
The Role-Based Access Control (RBAC) module handles hierarchical identities across the platform, mapping abstract roles to explicit granular permissions. It controls endpoints and enforces systemic authorization utilizing mapping identifiers securely attached to the User.

## 2. Database Schema
Defined inside `rbac.schema.ts`, the model is strictly relational yielding flexible authorization matrices.

- **`roleTable`**: Represents an abstract group (e.g., `admin`, `user`, `warehouse-staff`).
  - `id` (UUID): Primary key.
  - `name` (VARCHAR 100): Unique, human-readable identifier.
  - `description` (VARCHAR 255): Optional text detailing the role scope.
  - `createdAt` / `updatedAt` (TIMESTAMP)

- **`permissionTable`**: Represents an atomic granular systemic grant (e.g., `stocks:write`, `requests:read`).
  - `id` (UUID): Primary key.
  - `name` (VARCHAR 100): Unique, machine-readable string.
  - `description` (VARCHAR 255): Context surrounding the permission utility.
  - `createdAt` / `updatedAt` (TIMESTAMP)

- **`rolePermissionTable`**: Many-to-Many relational join table strictly tying a `Role` with countless `Permissions`.
  - `roleId` & `permissionId`: Foreign keys with `cascade` on delete.

- **`userRoleTable`**: Many-to-Many relational join table strictly yielding multiple `Roles` onto a single `User`.
  - `userId` & `roleId`: Foreign keys with `cascade` on delete.

## 3. Relations to Other Modules
- **User Module**: Relies explicitly on the `userTable` to establish ownership and join users to designated roles.
- **Middleware**: Most protected routes leverage this module's logic seamlessly by wrapping `requirePermission("domain:action")`.

## 4. API List with Request and Response Examples

> **Auth Note:** All endpoints below (except `GET /rbac/me/permissions`) require a valid Authentication token AND at least one of the following permissions: `rbac:read`, `rbac:create`, `rbac:update`, or `rbac:delete`.

---

### `GET /rbac/me/permissions`
Returns the authenticated user's current role and all resolved permissions.
*(Requires valid Authentication token only — no RBAC permission check)*

**Response Example (200 OK):**
```json
{
  "role": "admin",
  "permissions": [
    "stocks:read",
    "stocks:write",
    "audit:read",
    "locations:read",
    "locations:create"
  ]
}
```

---

### `GET /rbac/roles`
Retrieves a paginated list of all defined roles in the system.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string, optional): Filters by partial match on `name` or `description`.

**Response Example (200 OK):**
```json
{
  "data": [
    {
      "id": "e44d34a4-11b2-12c8-b8a5-d06efce2123d",
      "name": "admin",
      "description": "Administrator master role",
      "createdAt": "2026-02-21T15:00:00.000Z",
      "updatedAt": "2026-02-21T15:00:00.000Z"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 }
}
```

---

### `GET /rbac/roles/:id`
Retrieves a specific role along with its full list of assigned permissions.

**Response Example (200 OK):**
```json
{
  "id": "e44d34a4-11b2-12c8-b8a5-d06efce2123d",
  "name": "admin",
  "description": "Administrator master role",
  "createdAt": "2026-02-21T15:00:00.000Z",
  "updatedAt": "2026-02-21T15:00:00.000Z",
  "permissions": [
    {
      "id": "2da1ef82-aee8-bcde-ff71-12cfa234a919",
      "name": "stocks:write",
      "description": "Can mutate hardware inventory values."
    }
  ]
}
```

**Error Responses:**
- `404 Not Found` — Role ID does not exist (`"Role not found"`).

---

### `POST /rbac/roles`
Instantiates a new dynamic role.

**Request Example:**
```json
{
  "name": "staff",
  "description": "General workforce restrictions."
}
```

**Response Example (201 Created):**
```json
{
  "id": "7ee0cd2a-4420-a7d2-7e21-5a3d7b22ab1c",
  "name": "staff",
  "description": "General workforce restrictions.",
  "createdAt": "2026-02-21T15:05:00.000Z",
  "updatedAt": "2026-02-21T15:05:00.000Z"
}
```

**Error Responses:**
- `409 Conflict` — Role name is already taken (`"Role name already exists"`).

---

### `PATCH /rbac/roles/:id`
Partially updates an existing role. All fields are optional.

**Request Example:**
```json
{
  "description": "Updated workforce restrictions."
}
```

**Response Example (200 OK):**
```json
{
  "id": "7ee0cd2a-4420-a7d2-7e21-5a3d7b22ab1c",
  "name": "staff",
  "description": "Updated workforce restrictions.",
  "createdAt": "2026-02-21T15:05:00.000Z",
  "updatedAt": "2026-02-21T15:10:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` — Role ID does not exist (`"Role not found"`).
- `409 Conflict` — New name conflicts with an existing role (`"Role name already exists"`).

---

### `DELETE /rbac/roles/:id`
Removes a role from the system. All associated `rolePermission` and `userRole` mappings are cascade-deleted.

**Response Example (200 OK):**
```json
{
  "id": "7ee0cd2a-4420-a7d2-7e21-5a3d7b22ab1c",
  "name": "staff",
  "description": "General workforce restrictions.",
  "createdAt": "2026-02-21T15:05:00.000Z",
  "updatedAt": "2026-02-21T15:05:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` — Role ID does not exist (`"Role not found"`).

---

### `GET /rbac/permissions`
Retrieves a paginated list of all defined permissions in the system.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string, optional): Filters by partial match on `name` or `description`.

**Response Example (200 OK):**
```json
{
  "data": [
    {
      "id": "2da1ef82-aee8-bcde-ff71-12cfa234a919",
      "name": "stocks:write",
      "description": "Can mutate hardware inventory values.",
      "createdAt": "2026-02-21T15:06:00.000Z",
      "updatedAt": "2026-02-21T15:06:00.000Z"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 }
}
```

---

### `POST /rbac/permissions`
Instantiates a new atomic permission grant block.

**Request Example:**
```json
{
  "name": "stocks:write",
  "description": "Can mutate hardware inventory values."
}
```

**Response Example (201 Created):**
```json
{
  "id": "2da1ef82-aee8-bcde-ff71-12cfa234a919",
  "name": "stocks:write",
  "description": "Can mutate hardware inventory values.",
  "createdAt": "2026-02-21T15:06:00.000Z",
  "updatedAt": "2026-02-21T15:06:00.000Z"
}
```

**Error Responses:**
- `409 Conflict` — Permission name is already taken (`"Permission name already exists"`).

---

### `PATCH /rbac/permissions/:id`
Partially updates an existing permission. All fields are optional.

**Request Example:**
```json
{
  "description": "Can view and mutate hardware inventory values."
}
```

**Response Example (200 OK):**
```json
{
  "id": "2da1ef82-aee8-bcde-ff71-12cfa234a919",
  "name": "stocks:write",
  "description": "Can view and mutate hardware inventory values.",
  "createdAt": "2026-02-21T15:06:00.000Z",
  "updatedAt": "2026-02-21T15:10:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` — Permission ID does not exist (`"Permission not found"`).
- `409 Conflict` — New name conflicts with an existing permission (`"Permission name already exists"`).

---

### `DELETE /rbac/permissions/:id`
Removes a permission from the system. All associated `rolePermission` mappings are cascade-deleted.

**Response Example (200 OK):**
```json
{
  "id": "2da1ef82-aee8-bcde-ff71-12cfa234a919",
  "name": "stocks:write",
  "description": "Can mutate hardware inventory values.",
  "createdAt": "2026-02-21T15:06:00.000Z",
  "updatedAt": "2026-02-21T15:06:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` — Permission ID does not exist (`"Permission not found"`).

---

### `POST /rbac/roles/assign-permission`
Glues an autonomous atomic permission to a broader role class.

**Request Example:**
```json
{
  "roleId": "e44d34a4-11b2-12c8-b8a5-d06efce2123d",
  "permissionId": "2da1ef82-aee8-bcde-ff71-12cfa234a919"
}
```

**Response Example (201 Created):**
```json
{
  "id": "9bc8ef31-ffde-abcd-15ea-fede9a8a72ec",
  "roleId": "e44d34a4-11b2-12c8-b8a5-d06efce2123d",
  "permissionId": "2da1ef82-aee8-bcde-ff71-12cfa234a919"
}
```

---

### `POST /rbac/roles/remove-permission`
Removes a previously assigned permission from a role.

**Request Example:**
```json
{
  "roleId": "e44d34a4-11b2-12c8-b8a5-d06efce2123d",
  "permissionId": "2da1ef82-aee8-bcde-ff71-12cfa234a919"
}
```

**Response Example (200 OK):**
```json
{
  "id": "9bc8ef31-ffde-abcd-15ea-fede9a8a72ec",
  "roleId": "e44d34a4-11b2-12c8-b8a5-d06efce2123d",
  "permissionId": "2da1ef82-aee8-bcde-ff71-12cfa234a919"
}
```

---

### `POST /rbac/users/assign-role`
Connects an abstract Role capability straight to an actual user utilizing their ID.

**Request Example:**
```json
{
  "userId": "934cb6ea-e9db-482a-a82f-2d7c57b7f8c1",
  "roleId": "e44d34a4-11b2-12c8-b8a5-d06efce2123d"
}
```

**Response Example (201 Created):**
```json
{
  "id": "cc28bf45-ee8c-ade1-00fb-aa228ef87abc",
  "userId": "934cb6ea-e9db-482a-a82f-2d7c57b7f8c1",
  "roleId": "e44d34a4-11b2-12c8-b8a5-d06efce2123d"
}
```

---

## 5. Lecturer Q&A (Showcase Preparation)

**Q1: Why is this RBAC stuff so complicated? Why not just add an "isAdmin: true" column to the User table?**
**Answer:** Making an `isAdmin` column works for super small projects, but what if the warehouse wants a "Manager" role later? Or a "Viewer" role? With this setup (Roles and Permissions tables), the school or warehouse can literally just click a button to create brand new roles without us having to reprogram the database.

**Q2: How does the server actually check if I'm an admin?**
**Answer:** There's a piece of code called a "middleware" that runs before the actual API. It opens your login token, finds your User ID, and basically does a quick database search: "Does this user have the 'stocks:write' permission?". If yes, the code continues. If no, it throws a 403 Forbidden error.

**Q3: What's the difference between a Role and a Permission?**
**Answer:** A "Permission" is exactly one thing you can do, like `stock:write` (meaning you can edit stock). A "Role" is just a nametag, like "Warehouse Supervisor", that comes packed with a bunch of those permissions.

**Q4: Can one user have multiple roles?**
**Answer:** Yes! Because we used a join table (`userRoleTable`), a single person could technically be both a "Mechanic" and a "Safety Inspector" at the same time, getting the permissions from both.
