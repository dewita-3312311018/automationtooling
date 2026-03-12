# User Module

## 1. Module Overview
The User module is responsible for managing the end-users inside the system. It handles the core identity records needed for authentication, authorization (RBAC), and auditing.

## 2. Database Schema

The `userTable` is built with Drizzle ORM pushing to PostgreSQL.
- **`id`** (UUID, Primary Key): Auto-generated unique identifier.
- **`name`** (VARCHAR 100): The user's full display name.
- **`username`** (VARCHAR 255): Unique address utilized as the primary login identifier.
- **`password`** (VARCHAR 255): The strictly hashed (Argon2id) representation of the user's password. **Never returned in API responses.**
- **`createdAt`** / **`updatedAt`** (TIMESTAMP): Auto-managed timestamps marking record creation and modifications.

## 3. Relations to Other Modules
- **Auth Module**: Depends heavily on this schema to verify constraints (`getUserByUsername`) and mint JWTs mapping to `user.id` upon login.
- **RBAC Module**: Connects via `userRoleTable` allowing multiple Roles per user (`userId` mapping). The `role` field is resolved by joining `userRoleTable` → `roleTable`.
- **Audit Module**: Attaches `userId` properties mapping who exactly induced systemic events.
- **Request Module**: Holds relationship reference mapping to which `user` created a part substitution/purchase order.

## 4. API List with Request and Response Examples

---

### `GET /users/profile`
Retrieves the full profile of the currently authenticated user (derived from JWT token).
*(Requires valid Authentication token only)*

**Response Example (200 OK):**
```json
{
  "id": "e8d98d25-9b88-4447-b8a5-d06efce2123d",
  "name": "Jane Doe",
  "username": "jane",
  "role": "staff",
  "createdAt": "2026-02-21T14:48:00.000Z",
  "updatedAt": "2026-02-21T14:48:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` — JWT token is invalid or user no longer exists.

---

### `POST /users/profile/change-password`
Allows the authenticated user to update their **own** password.
*(Requires valid Authentication token only)*

**Request Body:**
| Field | Type | Rules |
|---|---|---|
| `password` | string | Required, min 6 characters |

**Request Example:**
```json
{
  "password": "newSecurePass456"
}
```

**Response Example (200 OK):**
```json
{
  "message": "Password updated successfully"
}
```

**Error Responses:**
- `404 Not Found` — Authenticated user no longer exists.

---

### `GET /users`
Retrieves a paginated list of all active users inside the system.
*(Requires valid Authentication token + `users:read` Permission)*

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string, optional): Partial match across `name` and `username`.

**Response Example (200 OK):**
```json
{
  "data": [
    {
      "id": "e8d98d25-9b88-4447-b8a5-d06efce2123d",
      "name": "Jane Doe",
      "username": "jane",
      "role": "staff",
      "createdAt": "2026-02-21T14:48:00.000Z",
      "updatedAt": "2026-02-21T14:48:00.000Z"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 }
}
```

*(Notice `password` is intentionally omitted from all user listing responses.)*

---

### `GET /users/:id`
Retrieves a specific user's details using their UUID.
*(Requires valid Authentication token + `users:read` Permission)*

**Response Example (200 OK):**
```json
{
  "id": "e8d98d25-9b88-4447-b8a5-d06efce2123d",
  "name": "Jane Doe",
  "username": "jane",
  "role": "staff",
  "createdAt": "2026-02-21T14:48:00.000Z",
  "updatedAt": "2026-02-21T14:48:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` — User ID does not exist (`"User not found"`).

---

### `POST /users`
Directly instantiates a user entity. Unlike `/auth/register`, this bypasses public registration and is used for internal/admin bootstrapping. The password is hashed before persistence.
*(Requires valid Authentication token + `users:create` Permission)*

**Request Example:**
```json
{
  "name": "John Smith",
  "username": "john.smith",
  "password": "SecurePassword123"
}
```

**Response Example (201 Created):**
```json
{
  "id": "934cb6ea-e9db-482a-a82f-2d7c57b7f8c1",
  "name": "John Smith",
  "username": "john.smith",
  "createdAt": "2026-02-21T15:00:00.000Z",
  "updatedAt": "2026-02-21T15:00:00.000Z"
}
```

*(Notice `password` is intentionally omitted from the response for security.)*

---

### `POST /users/change-password`
Admin-level endpoint to forcibly update any user's password identified by their `username`.
*(Requires valid Authentication token + `users:update` Permission)*

**Request Body:**
| Field | Type | Rules |
|---|---|---|
| `username` | string | Required |
| `password` | string | Required, min 6 characters |

**Request Example:**
```json
{
  "username": "jane",
  "password": "newAdminSetPass789"
}
```

**Response Example (200 OK):**
```json
{
  "message": "Password updated successfully",
  "user": {
    "id": "e8d98d25-9b88-4447-b8a5-d06efce2123d",
    "name": "Jane Doe",
    "username": "jane"
  }
}
```

**Error Responses:**
- `404 Not Found` — Username does not exist (`"User not found"`).

---

### `DELETE /users/:id`
Permanently destroys a user record identified by UUID. All associated requests and user-role mappings are cascade-deleted.
*(Requires valid Authentication token + `users:delete` Permission)*

**Response Example (200 OK):**
```json
{
  "id": "934cb6ea-e9db-482a-a82f-2d7c57b7f8c1",
  "name": "John Smith",
  "username": "john.smith",
  "createdAt": "2026-02-21T15:00:00.000Z",
  "updatedAt": "2026-02-21T15:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` — User ID does not exist (`"User not found"`).

---

## 5. Lecturer Q&A (Showcase Preparation)

**Q1: Why is there a `/auth/register` API and also a `/users` API for making accounts?**
**Answer:** The `/auth/register` one is for the public login page so normal employees can sign up easily. The `POST /users` one is hidden in the admin dashboard. It's so admins can manually create accounts for people without having to go to the public login screen.

**Q2: Can I see everyone's passwords in the database?**
**Answer:** No! We used a built-in thing called `Bun.password.hash`. Before the password ever touches the database, it gets scrambled into a long crazy string (like an Argon2id hash). Even we can't tell what the password was.

**Q3: What happens to an employee's requests if the employee gets deleted?**
**Answer:** In the database schema, we used something called `ON DELETE CASCADE`. That means if we fire an employee and delete their `User` account, all the database rows that rely on them (like their active requests) automatically get deleted or cleaned up so the database doesn't crash.

**Q4: Can I change someone's password inside the database manually?**
**Answer:** No, because you don't know the exact "hash" algorithm output. If you just typed "password123" into the database directly, the login code would completely break because it expects a scrambled hash, not a normal word.
