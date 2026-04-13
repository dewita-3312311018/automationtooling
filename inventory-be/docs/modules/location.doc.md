# Location Module

## 1. Module Overview
The Location module maps out explicit physical boundaries in the real world (e.g., Warehouse Aisles, Shelves, Floors) allowing administrators to strictly partition and organize heavy inventory mathematically across different zones. 

## 2. Database Schema
Defined in `location.schema.ts`, locations provide spatial grouping for items.

- **`locationTable`**
  - **`id`** (UUID, Primary Key): Standard generated UUID.
  - **`name`** (VARCHAR 255): A physical label like "Aisles B, Shelf 3".
  - **`description`** (VARCHAR 500): Extra context (e.g., "Contains heavy mechanical parts only").
  - **`floor`** (VARCHAR 100): The physical floor grouping identifier.
  - **`createdAt`** / **`updatedAt`** (TIMESTAMP)

## 3. Relations to Other Modules
- **Stock Module**: The strongest bond. Every materialized `Stock` entry mandates a `locationId` pinning the asset to the physical realm defined in this module.
- **RBAC Module**: Each operation requires a specific permission grant — `locations:read`, `locations:create`, `locations:update`, or `locations:delete`.

## 4. API List with Request and Response Examples

### `GET /locations`
Retrieves a paginated list of all established locations in the warehouse.
*(Requires valid Authentication token + `locations:read` Permission)*

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string, optional): Filters results by partial match across `name` and `floor` fields.

**Response Example (200 OK):**
```json
{
  "data": [
    {
      "id": "e44d34a4-11b2-12c8-b8a5-d06efce2123d",
      "name": "Aisle A, Shelf 1",
      "description": "Electronics zone",
      "floor": "Ground Floor",
      "createdAt": "2026-02-21T15:00:00.000Z",
      "updatedAt": "2026-02-21T15:00:00.000Z"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 }
}
```

### `GET /locations/:id`
Retrieves details of a specific location.
*(Requires valid Authentication token + `locations:read` Permission)*

**Response Example (200 OK):**
```json
{
  "id": "e44d34a4-11b2-12c8-b8a5-d06efce2123d",
  "name": "Aisle A, Shelf 1",
  "description": "Electronics zone",
  "floor": "Ground Floor",
  "createdAt": "2026-02-21T15:00:00.000Z",
  "updatedAt": "2026-02-21T15:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` — Location ID does not exist (`"Location not found"`).

### `POST /locations`
Creates a brand new physical location representation.
*(Requires valid Authentication token + `locations:create` Permission)*

**Request Example:**
```json
{
  "name": "Storage Room Z",
  "description": "Cold storage for lithium parts.",
  "floor": "Basement 2"
}
```

**Response Example (201 Created):**
```json
{
  "id": "9bc8ef31-ffde-abcd-15ea-fede9a8a72ec",
  "name": "Storage Room Z",
  "description": "Cold storage for lithium parts.",
  "floor": "Basement 2",
  "createdAt": "2026-02-21T15:02:00.000Z",
  "updatedAt": "2026-02-21T15:02:00.000Z"
}
```

### `PATCH /locations/:id`
Partially updates an existing location. All fields are optional.
*(Requires valid Authentication token + `locations:update` Permission)*

**Request Example:**
```json
{
  "name": "Storage Room Z - Restricted",
  "floor": "Basement 3"
}
```

**Response Example (200 OK):**
```json
{
  "id": "9bc8ef31-ffde-abcd-15ea-fede9a8a72ec",
  "name": "Storage Room Z - Restricted",
  "description": "Cold storage for lithium parts.",
  "floor": "Basement 3",
  "createdAt": "2026-02-21T15:02:00.000Z",
  "updatedAt": "2026-02-21T15:05:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` — Location ID does not exist (`"Location not found"`).

### `DELETE /locations/:id`
Removes a physical location representation from the database. If there are still stocks linked, their `locationId` will be set to `null` (set null on delete).
*(Requires valid Authentication token + `locations:delete` Permission)*

**Response Example (200 OK):**
```json
{
  "id": "9bc8ef31-ffde-abcd-15ea-fede9a8a72ec",
  "name": "Storage Room Z",
  "description": "Cold storage for lithium parts.",
  "floor": "Basement 2",
  "createdAt": "2026-02-21T15:02:00.000Z",
  "updatedAt": "2026-02-21T15:02:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` — Location ID does not exist (`"Location not found"`).

### `GET /locations/:id/stocks`
Retrieves the location details and all stocks currently assigned to it.
*(Requires valid Authentication token + `locations:read` Permission)*

**Response Example (200 OK):**
```json
{
  "location": {
    "id": "e44d34a4-11b2-12c8-b8a5-d06efce2123d",
    "name": "Aisle A, Shelf 1",
    "description": "Electronics zone",
    "floor": "Ground Floor"
  },
  "stocks": [
    {
      "id": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
      "modelNumber": "SENS-01X",
      "type": "electrical",
      "quantity": 50,
      "locationId": "e44d34a4-11b2-12c8-b8a5-d06efce2123d"
    }
  ]
}
```

**Error Responses:**
- `404 Not Found` — Location ID does not exist (`"Location not found"`).

### `GET /public/locations/:id/stocks`
**[PUBLIC - NO AUTH REQUIRED]**
Intentionally exposed unauthenticated public endpoint allowing external devices (QR scanners) to hit physical URLs to fetch a live manifest of which materials are currently located inside the interrogated location bin. Returns the same shape as `GET /locations/:id/stocks`.

**Error Responses:**
- `404 Not Found` — Location ID does not exist (`"Location not found"`).

## 5. Lecturer Q&A (Showcase Preparation)

**Q1: Why is there a "public" API for locations that doesn't need a login?**
**Answer:** This was a cool feature we thought of for barcode scanners. If an employee is walking around the warehouse with a scanner, they can scan a QR code on a shelf. The scanner can just hit this public URL and instantly show what parts are supposed to be on that shelf without making them type in a password on a clunky scanner screen.

**Q2: What happens to the items if we delete a location?**
**Answer:** Our database is set up so that if you delete a shelf (location), any stock that was on that shelf doesn't get deleted. Instead, its `locationId` just gets blanked out. So we don't lose the inventory data, we just know it needs a new home.

**Q3: Can one stock item be in two places at once?**
**Answer:** No, the way we built the database, each stock item (like a specific batch of sensors) has only one `locationId`. If we split them into two boxes, we would probably need to make two separate stock entries.

**Q4: How do we know who added a new location?**
**Answer:** The locations API is protected by our authentication system. You have to send your login token, and it checks if you have the `locations:write` permission before it lets you add a new shelf to the database.
