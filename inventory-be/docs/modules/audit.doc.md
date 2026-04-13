# Audit Module

## 1. Module Overview
The Audit module operates as an immutable system ledger. It records key systemic actions (creational, mutational, destructive) alongside the explicit identities of the actors responsible, providing accountability and tracing for warehouse operations.

## 2. Database Schema
Defined inside `audit.schema.ts`, the schema favors strict immutable insertions over updates.

- **`auditTable`**
  - **`id`** (UUID, Primary Key)
  - **`userId`** (UUID): Foreign key denoting the employee who performed the action. Relies on `set null` deletion logic to preserve the audit trail if a user is destroyed.
  - **`action`** (VARCHAR 50): Explicitly tracks the verb (e.g., `"CREATE"`, `"UPDATE"`, `"DELETE"`).
  - **`entity`** (VARCHAR 100): Identifies the systemic resource modified (e.g., `"STOCK"`, `"REQUEST"`).
  - **`entityId`** (UUID): The exact primary key of the modified structural entity.
  - **`details`** (TEXT): Optionally stringified JSON holding exact granular context indicating precisely what properties changed (e.g., `{ "oldQuantity": 50, "newQuantity": 40 }`).
  - **`createdAt`** (TIMESTAMP)

## 3. Relations to Other Modules
- **User Module**: Implicitly binds who triggered the request.
- **Stock Module**: Hooks into stock services to trace inventory mutations.
- **Request Module**: Hooks into request lifecycle transitions preserving approval trails securely.
- **RBAC Module**: Reading the audit log strictly mandates the `audit:read` systemic grant.

## 4. API List with Request and Response Examples

### `GET /audits`
Retrieves the paginated system audit ledger ordered chronologically descending (newest first).
*(Requires valid Authentication token + `audit:read` Permission)*

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string, optional): Filters results by partial match across `user name`, `action`, `entity`, and `details` fields.

**Response Example (200 OK):**
```json
{
  "data": [
    {
      "id": "e44d34a4-11b2-12c8-b8a5-d06efce2123d",
      "userId": "934cb6ea-e9db-482a-a82f-2d7c57b7f8c1",
      "userName": "John Doe",
      "action": "UPDATE",
      "entity": "STOCK",
      "entityId": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
      "details": "User mutated stock SENS-01X quantity from 50 to 45.",
      "createdAt": "2026-02-21T15:00:00.000Z"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 }
}
```

*Note: The Audit Module intentionally exposes zero mutational endpoints. Ledgers are written exclusively by internal systemic service hooks.*

## 5. Lecturer Q&A (Showcase Preparation)

**Q1: Why doesn't this Audit feature have standard Add/Edit/Delete APIs?**
**Answer:** Because we don't want anyone (even admins) to be able to fake or delete the history. The system creates these log entries automatically in the background whenever someone changes something important (like updating stock or approving a request). It's like an automatic receipt.

**Q2: Won't the database get really slow if there are millions of audit logs?**
**Answer:** We added pagination (page numbers and limits) to the API. So the frontend only asks for 10 or 20 logs at a time, instead of trying to load the whole history at once.

**Q3: How do we know who actually did the action in the log?**
**Answer:** Every time someone makes a request, they have to send their login token. Our system gets their User ID from that token and saves it right into the audit log. So we always know exactly who clicked the button.

**Q4: What happens to the audit log if we delete a user?**
**Answer:** The log stays there. We setup the database so that if a user is deleted, the `userId` in the audit log just becomes empty (null), but the record of the action itself is safe. That way we don't lose our history.
