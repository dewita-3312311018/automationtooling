# Stock Module

## 1. Module Overview
The Stock module forms the core of the inventory system. It strictly tracks physical materials, tools, and assets utilizing descriptive identifiers and relational links mapping precisely to physical warehouse locations.

## 2. Database Schema
Defined inside `stock.schema.ts`, the Stock schema yields deep attributes designed to trace material identities.

- **`stockTable`**
  - **`id`** (UUID, Primary Key)
  - **`modelNumber`** (VARCHAR 100): Unique machine or catalog identifier representing the part. Indexed for fast lookup.
  - **`description`** (TEXT): Lengthy text defining use-cases.
  - **`brand`** (VARCHAR 100): Manufacturer identifier.
  - **`quantity`** (INT): The current absolute count of the material natively in-stock. Default `0`.
  - **`uom`** (VARCHAR 50): Unit Of Measurement (e.g., `PCS`, `KG`, `Liters`). Required.
  - **`projectType`** (VARCHAR 100): Categorization metric natively tracking which project the part fulfills.
  - **`type`** (ENUM): Strictly locked to `"mechanical" | "electrical"`.
  - **`minStockLevel`** (INT): Mathematical threshold triggering restocking alerts if `quantity <= minStockLevel`. Default `0`.
  - **`locationId`** (UUID): Foreign Key referencing `locationTable`. Set to `null` if the referenced location is deleted (`set null`).
  - **`createdAt`** / **`updatedAt`** (TIMESTAMP)

## 3. Relations to Other Modules
- **Location Module**: Explicitly relies on this module to know where instances physically sit. `locationId` cascades via `set null` if a physical location is destroyed.
- **Audit Module**: Automatically intercepts `createStock`, `createStocksBulk`, `updateStock`, `updateStockQuantity`, and `deleteStock` service commands recording exactly who modified the values.
- **Notification Module**: When `updateStockQuantity` causes `quantity` to fall at or below `minStockLevel`, a "Low Stock Alert" notification is broadcast to all users with the `admin` role.
- **RBAC Module**: Each operation requires a specific permission — `stocks:read`, `stocks:create`, `stocks:update`, or `stocks:delete`.

## 4. API List with Request and Response Examples

---

### `GET /stocks`
Retrieves a paginated catalog of materials with filtering support.
*(Requires valid Authentication token + `stocks:read` Permission)*

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string, optional): Partial match on `modelNumber` and `brand`.
- `type` (string, optional): Scope by `"mechanical"` or `"electrical"`.

**Response Example (200 OK):**
```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
      "modelNumber": "SENS-01X",
      "description": "Industrial pressure sensor.",
      "brand": "Siemens",
      "quantity": 50,
      "uom": "PCS",
      "projectType": "Automation AI",
      "type": "electrical",
      "minStockLevel": 10,
      "locationId": "e44d34a4-11b2-12c8-b8a5-d06efce2123d",
      "createdAt": "2026-02-21T15:00:00.000Z",
      "updatedAt": "2026-02-21T15:00:00.000Z"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 }
}
```

---

### `GET /stocks/summary`
Returns aggregated dashboard summary counters.
*(Requires valid Authentication token + `stocks:read` Permission)*

**Response Example (200 OK):**
```json
{
  "totalStocks": 142,
  "lowStockAlerts": 5,
  "technicalItems": 142,
  "pendingRequests": 3
}
```

| Field | Description |
|---|---|
| `totalStocks` | Total count of all stock entries |
| `lowStockAlerts` | Count of stocks where `quantity <= minStockLevel` |
| `technicalItems` | Count of stocks typed as `mechanical` or `electrical` |
| `pendingRequests` | Count of requests with status `PENDING` |

---

### `GET /stocks/low-stock`
Retrieves all stock items where `quantity <= minStockLevel`. Not paginated — intended for dashboard views.
*(Requires valid Authentication token + `stocks:read` Permission)*

**Response Example (200 OK):**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
    "modelNumber": "SENS-01X",
    "brand": "Siemens",
    "quantity": 3,
    "minStockLevel": 10,
    "uom": "PCS",
    "type": "electrical",
    "locationId": "e44d34a4-11b2-12c8-b8a5-d06efce2123d",
    "createdAt": "2026-02-21T15:00:00.000Z",
    "updatedAt": "2026-02-21T15:00:00.000Z"
  }
]
```

---

### `GET /stocks/:id`
Retrieves granular properties of an exact stock item.
*(Requires valid Authentication token + `stocks:read` Permission)*

**Response Example (200 OK):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
  "modelNumber": "SENS-01X",
  "description": "Industrial pressure sensor.",
  "brand": "Siemens",
  "quantity": 50,
  "uom": "PCS",
  "projectType": "Automation AI",
  "type": "electrical",
  "minStockLevel": 10,
  "locationId": "e44d34a4-11b2-12c8-b8a5-d06efce2123d",
  "createdAt": "2026-02-21T15:00:00.000Z",
  "updatedAt": "2026-02-21T15:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` — Stock ID does not exist (`"Stock not found"`).

---

### `GET /stocks/:id/locations`
Retrieves location distribution for all stocks sharing the same `modelNumber` as the requested item.
*(Requires valid Authentication token + `stocks:read` Permission)*

**Response Example (200 OK):**
```json
[
  {
    "locationId": "e44d34a4-11b2-12c8-b8a5-d06efce2123d",
    "locationName": "Aisle A, Shelf 1",
    "floor": "Ground Floor",
    "quantity": 50
  }
]
```

**Error Responses:**
- `404 Not Found` — Stock ID does not exist (`"Stock not found"`).

---

### `POST /stocks`
Creates an individual unique stock entry.
*(Requires valid Authentication token + `stocks:create` Permission)*

**Request Example:**
```json
{
  "modelNumber": "BRNG-02Y",
  "description": "Heavy-duty ball bearing.",
  "brand": "SKF",
  "quantity": 100,
  "uom": "PCS",
  "type": "mechanical",
  "minStockLevel": 20,
  "locationId": "e44d34a4-11b2-12c8-b8a5-d06efce2123d"
}
```

**Response Example (201 Created):**
```json
{
  "id": "b2c3d4e5-f6a7-8901-b2c3-d4e5f6a78901",
  "modelNumber": "BRNG-02Y",
  "description": "Heavy-duty ball bearing.",
  "brand": "SKF",
  "quantity": 100,
  "uom": "PCS",
  "projectType": null,
  "type": "mechanical",
  "minStockLevel": 20,
  "locationId": "e44d34a4-11b2-12c8-b8a5-d06efce2123d",
  "createdAt": "2026-02-21T15:05:00.000Z",
  "updatedAt": "2026-02-21T15:05:00.000Z"
}
```

*Side effect: A `CREATE STOCK` audit log entry is automatically written.*

---

### `POST /stocks/bulk`
Massively instantiates array structures of stocks in a single DB transaction. Intended for Excel ingestion workflows.
*(Requires valid Authentication token + `stocks:create` Permission)*

**Request Example:**
```json
{
  "stocks": [
    {
      "modelNumber": "SENS-01X",
      "quantity": 50,
      "uom": "PCS",
      "type": "electrical",
      "locationId": "e44d34a4-11b2-12c8-b8a5-d06efce2123d"
    },
    {
      "modelNumber": "BRNG-02Y",
      "quantity": 200,
      "uom": "PCS",
      "type": "mechanical",
      "locationId": "e44d34a4-11b2-12c8-b8a5-d06efce2123d"
    }
  ]
}
```

**Response Example (201 Created):**
```json
{
  "importedCount": 2
}
```

**Error Responses:**
- `400 Bad Request` — `stocks` array is empty (`"No stock data provided for bulk import"`).

*Side effect: A single `CREATE STOCK` bulk audit log entry is written.*

---

### `PUT /stocks/:id`
Partially updates any fields of an existing stock entry.
*(Requires valid Authentication token + `stocks:update` Permission)*

**Request Example:**
```json
{
  "description": "Updated sensor description.",
  "minStockLevel": 15,
  "locationId": "9bc8ef31-ffde-abcd-15ea-fede9a8a72ec"
}
```

**Response Example (200 OK):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
  "modelNumber": "SENS-01X",
  "description": "Updated sensor description.",
  "brand": "Siemens",
  "quantity": 50,
  "uom": "PCS",
  "type": "electrical",
  "minStockLevel": 15,
  "locationId": "9bc8ef31-ffde-abcd-15ea-fede9a8a72ec",
  "createdAt": "2026-02-21T15:00:00.000Z",
  "updatedAt": "2026-02-21T16:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` — Stock ID does not exist (`"Stock not found"`).

*Side effect: An `UPDATE STOCK` audit log entry is written listing the changed field names.*

---

### `PUT /stocks/:id/quantity`
Intentionally mutates the absolute `quantity` value. Safely executes internal hooks mapping to the `auditTable` to preserve supply chain accountability.
*(Requires valid Authentication token + `stocks:update` Permission)*

**Request Example:**
```json
{
  "quantity": 40
}
```

**Response Example (200 OK):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
  "modelNumber": "SENS-01X",
  "quantity": 40,
  "minStockLevel": 10,
  "updatedAt": "2026-02-21T16:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` — Stock ID does not exist (`"Stock not found"`).

*Side effects:*
- An `UPDATE STOCK` audit log entry is written with old and new quantity values.
- If the new `quantity` falls at or below `minStockLevel` (and was previously above it), a "Low Stock Alert" notification is pushed to all users with the `admin` role.

---

### `DELETE /stocks/:id`
Irreversibly deletes a material entry.
*(Requires valid Authentication token + `stocks:delete` Permission)*

**Response Example (200 OK):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
  "modelNumber": "SENS-01X",
  "brand": "Siemens",
  "quantity": 50,
  "uom": "PCS",
  "type": "electrical",
  "locationId": "e44d34a4-11b2-12c8-b8a5-d06efce2123d",
  "createdAt": "2026-02-21T15:00:00.000Z",
  "updatedAt": "2026-02-21T15:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` — Stock ID does not exist (`"Stock not found"`).

*Side effect: A `DELETE STOCK` audit log entry is written.*

---

## 5. Lecturer Q&A (Showcase Preparation)

**Q1: If a company has 10,000 items in an Excel sheet, how do they put it in the system?**
**Answer:** We made a special `/stocks/bulk` API. Instead of sending 10,000 separate requests to the server (which would probably crash it or take forever), the frontend bundles them all up into one big array. Then the database saves them all in one single "transaction". It's super fast.

**Q2: How does the system know when to warn the admin about low stock?**
**Answer:** Every single time an admin edits the quantity of a stock, there's a simple `if` statement. It checks if `newQuantity <= minStockLevel`. If that's true, the code literally just calls the `createNotification` function right then and there to warn the admins.

**Q3: Why is there an "Audit Module" relation? Does stock update itself?**
**Answer:** No, the stock doesn't update itself. But whenever a human edits the quantity, our code forces it to also write a log in the Audit table saying "User X changed Item Y from 50 to 40". This way nobody can steal stuff and erase the numbers secretly.

**Q4: Can a stock be both 'mechanical' and 'electrical'?**
**Answer:** No, we used a strict "Enum" in the database. When you create a part, you literally have to pick either "mechanical" or "electrical" from a dropdown. This makes filtering on the frontend much cleaner.
