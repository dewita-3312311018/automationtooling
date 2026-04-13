# Request Module

## 1. Module Overview
The Request module handles two internal workflows:
1. **Procurement** — Employees submit formal requests for parts/items that need to be procured (new items or more quantity of existing items). Administrators review, approve, order, and mark items as arrived.
2. **Withdrawal** — Employees request to take existing items from inventory. Administrators approve or reject. On approval, the stock quantity is automatically decremented.

## 2. Database Schema
Defined inside `request.schema.ts`, the schema models the lifecycle of an inventory request.

- **`requestTable`**
  - **`id`** (UUID, Primary Key)
  - **`userId`** (UUID): Foreign key denoting the employee who authored the request. Cascades on user delete.
  - **`type`** (VARCHAR 50): Request type — `"procurement"` (default) or `"withdrawal"`.
  - **`stockId`** (UUID): Foreign key denoting exactly which catalog element is being requested from the inventory. Cascades on stock delete. Required for withdrawal requests.
  - **`requestedModelNumber`** (VARCHAR 100): For new procurement items not yet in the system.
  - **`requestedBrand`** (VARCHAR 100): For new procurement items not yet in the system.
  - **`requestedDescription`** (TEXT): For new procurement items not yet in the system.
  - **`quantity`** (INT): Requested amount.
  - **`urgency`** (VARCHAR 50): Arbitrary prioritization metric. Default `"normal"`.
  - **`note`** (TEXT): Context written by the requesting employee.
  - **`status`** (VARCHAR 50): The core state machine of the request. Defaults strictly to `"PENDING"`. 
    - Procurement: `PENDING` → `APPROVED` → `ORDERED` → `ARRIVED` or `PENDING` → `REJECTED`
    - Withdrawal: `PENDING` → `APPROVED` or `PENDING` → `REJECTED`
  - **`adminNote`** (TEXT): Explicit feedback written by an Admin when reviewing a request.
  - **`poNumber`** (VARCHAR 100): Purchase Order identifier if external ordering triggers (procurement only).
  - **`eta`** (DATE): Expected Time of Arrival (procurement only).
  - **`createdAt`** / **`updatedAt`** (TIMESTAMP)

## 3. Relations to Other Modules
- **User Module**: Binds requests to physical authors via `userId`.
- **Stock Module**: The anchor reference `stockId` mapping to the actual part catalog. For procurement requests, when a request transitions to `ARRIVED`, the stock's quantity is automatically incremented. For withdrawal requests, when `APPROVED`, stock quantity is decremented.
- **Audit Module**: Request creation and every status transition automatically writes an immutable log inside the system ledger.
- **Notification Module**: As statuses shift (e.g., `PENDING` → `APPROVED`), the Notification module triggers a precise application alert intended for the original `userId` broadcasting the Admin's decision. For withdrawals, low-stock alerts are sent to admins if quantity drops below minimum.

## 4. API List with Request and Response Examples

> **Auth Note:** All endpoints require a valid Authentication token. No additional RBAC permission is enforced at the route level — authorization is controlled by the auth middleware.

---

### `GET /requests`
Retrieves a global paginated list of all requests inside the system.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (string, optional): Filter strictly by status — `PENDING`, `APPROVED`, `REJECTED`, `ORDERED`, or `ARRIVED`.
- `type` (string, optional): Filter by request type — `procurement` or `withdrawal`.
- `search` (string, optional): Partial match across `adminNote`, `poNumber`, `stock.modelNumber`, and `user.name`.

**Response Example (200 OK):**
```json
{
  "data": [
    {
      "id": "abc12345-0000-0000-0000-123456789abc",
      "userId": "e8d98d25-9b88-4447-b8a5-d06efce2123d",
      "stockId": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
      "modelNumber": "SENS-01X",
      "quantity": 15,
      "urgency": "high",
      "note": "Line 3 conveyor belt snapped.",
      "status": "PENDING",
      "adminNote": null,
      "poNumber": null,
      "eta": null,
      "createdAt": "2026-02-21T15:00:00.000Z",
      "updatedAt": "2026-02-21T15:00:00.000Z",
      "requester": { "name": "Jane Doe" }
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 }
}
```

---

### `GET /requests/my-requests`
Retrieves a paginated list of requests exclusively authored by the authenticated user (derived from JWT token).

**Query Parameters:** Identical to `GET /requests` — supports `page`, `limit`, `status`, and `search`.

**Response Example (200 OK):**
```json
{
  "data": [
    {
      "id": "abc12345-0000-0000-0000-123456789abc",
      "userId": "e8d98d25-9b88-4447-b8a5-d06efce2123d",
      "stockId": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
      "modelNumber": "SENS-01X",
      "quantity": 15,
      "urgency": "normal",
      "note": "Routine restocking.",
      "status": "APPROVED",
      "adminNote": "Approved. PO sent.",
      "poNumber": "PO-90022",
      "eta": "2026-03-01",
      "createdAt": "2026-02-21T15:00:00.000Z",
      "updatedAt": "2026-02-21T16:00:00.000Z",
      "requester": { "name": "Jane Doe" }
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 }
}
```

**Error Responses:**
- `401 Unauthorized` — No valid JWT token present.

---

### `GET /requests/:id`
Retrieves granular details of a specific request.

**Response Example (200 OK):**
```json
{
  "id": "abc12345-0000-0000-0000-123456789abc",
  "userId": "e8d98d25-9b88-4447-b8a5-d06efce2123d",
  "stockId": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
  "modelNumber": "SENS-01X",
  "quantity": 15,
  "urgency": "high",
  "note": "Line 3 conveyor belt snapped.",
  "status": "APPROVED",
  "adminNote": "Approved. PO sent.",
  "poNumber": "PO-90022",
  "eta": "2026-03-01",
  "createdAt": "2026-02-21T15:00:00.000Z",
  "updatedAt": "2026-02-21T16:00:00.000Z",
  "requester": { "name": "Jane Doe" }
}
```

**Error Responses:**
- `404 Not Found` — Request ID does not exist (`"Request not found"`).

---

### `POST /requests`
Creates a brand new request. The system hardcodes `userId` from the JWT token — any user-supplied `userId` or `status` in the payload is ignored.

**Request Body:**
| Field | Type | Rules |
|---|---|---|
| `type` | string | Optional, default `"procurement"`. Either `"procurement"` or `"withdrawal"` |
| `stockId` | UUID string | Required for withdrawal. For procurement, either `stockId` or `requestedModelNumber` + `requestedBrand` |
| `requestedModelNumber` | string | For new procurement items only |
| `requestedBrand` | string | For new procurement items only |
| `requestedDescription` | string | Optional |
| `quantity` | integer | Required |
| `urgency` | string | Optional, default `"normal"` |
| `note` | string | Optional |
| `eta` | string (date) | Optional (procurement only) |

**Request Example (Procurement):**
```json
{
  "stockId": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
  "quantity": 5,
  "urgency": "high",
  "note": "Line 3 conveyor belt snapped, need these bearings ASAP."
}
```

**Request Example (Withdrawal):**
```json
{
  "type": "withdrawal",
  "stockId": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
  "quantity": 3,
  "note": "Need for maintenance task on Line 2."
}
```

**Response Example (201 Created):**
```json
{
  "id": "cfabc123-0000-0000-0000-123456789abc",
  "userId": "e8d98d25-9b88-4447-b8a5-d06efce2123d",
  "stockId": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
  "quantity": 5,
  "urgency": "high",
  "note": "Line 3 conveyor belt snapped, need these bearings ASAP.",
  "status": "PENDING",
  "adminNote": null,
  "poNumber": null,
  "eta": null,
  "createdAt": "2026-02-21T15:05:00.000Z",
  "updatedAt": "2026-02-21T15:05:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` — No valid JWT token present.

*Side effect: An `CREATE REQUEST` audit log entry is automatically written upon successful creation.*

---

### `PUT /requests/:id/review`
Explicitly invoked by Administrators to progress requests along the state cycle.

**Procurement requests:** When status transitions to `ARRIVED`, the linked stock's quantity is automatically incremented by the request's quantity, and the stock's location can be updated via `locationId`.

**Withdrawal requests:** When status transitions to `APPROVED`, the linked stock's quantity is automatically decremented by the request's quantity from the specified location. Statuses `ORDERED` and `ARRIVED` are not valid for withdrawal requests.

**Request Body:**
| Field | Type | Rules |
|---|---|---|
| `status` | string | Required — `APPROVED`, `REJECTED`, `ORDERED`, or `ARRIVED` |
| `adminNote` | string | Required when status is `REJECTED`, optional otherwise |
| `poNumber` | string | Optional (procurement only) |
| `eta` | string (date) | Optional (procurement only) |
| `locationId` | UUID string | Required when approving withdrawals. Optional for `ARRIVED` procurement to update stock location |

**Request Example (Approving Procurement):**
```json
{
  "status": "APPROVED",
  "adminNote": "Sourced from local supplier.",
  "poNumber": "PO-12345",
  "eta": "2026-02-25"
}
```

**Request Example (Approving Withdrawal):**
```json
{
  "status": "APPROVED",
  "adminNote": "Withdrawal approved for maintenance.",
  "locationId": "e44d34a4-11b2-12c8-b8a5-d06efce2123d"
}
```

**Request Example (Marking Arrived):**
```json
{
  "status": "ARRIVED",
  "locationId": "e44d34a4-11b2-12c8-b8a5-d06efce2123d"
}
```

**Response Example (200 OK):**
```json
{
  "id": "cfabc123-0000-0000-0000-123456789abc",
  "userId": "e8d98d25-9b88-4447-b8a5-d06efce2123d",
  "stockId": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
  "quantity": 5,
  "urgency": "high",
  "status": "APPROVED",
  "adminNote": "Sourced from local supplier.",
  "poNumber": "PO-12345",
  "eta": "2026-02-25",
  "createdAt": "2026-02-21T15:05:00.000Z",
  "updatedAt": "2026-02-21T16:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` — Request ID does not exist (`"Request not found"`).
- `400 Bad Request` — Status is `REJECTED` but no `adminNote` provided (`"Rejection requires an admin note/reason"`).
- `400 Bad Request` — Status is `ORDERED` or `ARRIVED` for a withdrawal request (`"Status 'X' is not valid for withdrawal requests"`).
- `400 Bad Request` — Approving a withdrawal without `locationId` (`"Must specify a location when approving a withdrawal"`).
- `400 Bad Request` — Insufficient stock for withdrawal approval (`"Insufficient stock. Available: X, Requested: Y"`).

*Side effects on status change:*
- An `UPDATE REQUEST` audit log entry is written.
- A notification is pushed to the requester's user account.
- If procurement status is `ARRIVED`: stock quantity is incremented and `locationId` updated if provided, plus an `UPDATE STOCK` audit log is written.
- If withdrawal status is `APPROVED`: stock quantity is decremented at the specified location, an `UPDATE STOCK` audit log is written, and low-stock alerts are sent to admins if quantity drops below minimum.

---

## 5. Lecturer Q&A (Showcase Preparation)

**Q1: What happens step-by-step when an employee asks for a part?**
**Answer:** First, the employee sends a request, and it gets saved in the database as "PENDING". Then, an Admin sees it on their screen and clicks "Approve". When they approve it, they usually type in a Purchase Order number. The system then changes the status to "APPROVED", saves a record in the Audit log, and pops a notification on the employee's screen so they know it's coming.

**Q2: How do you stop a hacker from requesting parts under someone else's name?**
**Answer:** When you send the JSON to create a request, we actually ignore the `userId` in the payload. Instead, our backend opens up your secret login token (JWT), finds out who you really are, and forces *that* ID into the database. So you can only make requests for yourself.

**Q3: Can an employee delete their request if they made a mistake?**
**Answer:** Right now, we want to keep a permanent record of everything. So instead of deleting, an admin would just hit "Reject" with a note saying "Cancelled by user mistake."

**Q4: Why does the request need a Stock ID instead of just typing the name of the tool?**
**Answer:** If people just typed "hammer", we'd end up with "hamer", "big hammer", "metal squeezer", etc. By forcing them to pick a strict `stockId` from the database, the records stay perfectly clean and we know exactly which item they need.
