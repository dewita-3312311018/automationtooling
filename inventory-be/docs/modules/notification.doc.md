# Notification Module

## 1. Module Overview
The Notification module delivers targeted systemic alerts to individual users. It allows internal services (like `stock` tracking or `requests` approval flows) to securely push immediate insights reflecting critical states onto a user's dashboard.

## 2. Database Schema
Defined inside `notification.schema.ts`, the structure operates directly against the `userTable`.

- **`notificationTable`**
  - **`id`** (UUID, Primary Key)
  - **`userId`** (UUID): Foreign key denoting the exclusive receiver of the alert.
  - **`title`** (VARCHAR 255): Summary text denoting the event (e.g., "Low Stock Alert").
  - **`message`** (TEXT): Deeper context (e.g., "Item SENS-01X has dropped below the minimum threshold.").
  - **`isRead`** (BOOLEAN): State indicator separating acknowledged alerts from new ones. Default `false`.
  - **`createdAt`** (TIMESTAMP)

## 3. Relations to Other Modules
- **User Module**: Strict referential integrity; notifications map directly to `userId` with `cascade` capabilities pushing deletions natively.
- **Stock Module**: Emits internal events to generate broad "Low Stock" notifications broadcasting uniquely to every `admin` identity.
- **Request Module**: Emits internal events exactly when an Admin Approves or Rejects a request, securely targeting the exact `userId` of the requesting employee.

## 4. API List with Request and Response Examples

### `GET /notifications`
Retrieves all notifications assigned exclusively to the User tied to the authenticated JWT. Ordered by latest first.
*(Requires valid Authentication token)*

**Response Example (200 OK):**
```json
{
  "data": [
    {
      "id": "abc12345-0000-0000-0000-123456789abc",
      "userId": "e8d98d25-9b88-4447-b8a5-d06efce2123d",
      "title": "Part Request Approved",
      "message": "Your request for 15x SENS-01X was approved. PO-90022 ETA: 2026-03-01",
      "isRead": false,
      "createdAt": "2026-02-21T15:00:00.000Z"
    }
  ]
}
```

### `PUT /notifications/:id/read`
Mutates the atomic status of a specific notification flag `isRead` explicitly to `true`.
*(Requires valid Authentication token mapping explicitly to the matched `userId`)*

**Response Example (200 OK):**
```json
{
  "id": "abc12345-0000-0000-0000-123456789abc",
  "userId": "e8d98d25-9b88-4447-b8a5-d06efce2123d",
  "title": "Part Request Approved",
  "message": "Your request for 15x SENS-01X was approved. PO-90022 ETA: 2026-03-01",
  "isRead": true,
  "createdAt": "2026-02-21T15:00:00.000Z"
}
```

### `PUT /notifications/read-all`
Mutates all unseen notifications scoped strictly to the authenticated `user` directly into the `isRead = true` subset.
*(Requires valid Authentication token)*

**Response Example (200 OK):**
```json
{
  "success": true
}
```

## 5. Lecturer Q&A (Showcase Preparation)

**Q1: How do the notifications actually get sent?**
**Answer:** We didn't build a complex email server or anything. It's just a simple table in the database. When someone approves a request or a stock runs low, our code literally just inserts a new row into the `notificationTable` for that user. When the user loads their page, it just fetches those rows.

**Q2: Why do some notifications go to everyone and some only go to one person?**
**Answer:** It depends on what happened. If a specific employee asked for a part, only that employee needs to know it got approved. But if we completely run out of important sensors, every single admin needs to know about it so someone can order more. 

**Q3: Does the `isRead` button actually delete the notification?**
**Answer:** No! It just flips a true/false switch in the database from `false` to `true`. This way we can keep a history of old notifications just in case.

**Q4: Can a normal employee read an admin's notifications?**
**Answer:** Nope. The API only returns notifications where the `userId` perfectly matches the person who is currently logged in. So you can't spy on other people's alerts.
