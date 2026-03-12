# User Stories

## 1. Authentication & Security
### Story 1.1: Secure Login
**As an** Employee or Admin,  
**I want to** log in using my username and password,  
**So that** I can access the system features appropriate to my role.

**Acceptance Criteria:**
- [ ] User can enter username and password.
- [ ] System validates credentials against the database.
- [ ] Successful login redirects to the dashboard.
- [ ] Failed login shows an error message.
- [ ] Session persists until logout.

### Story 1.2: Role-Based Access Control
**As an** Admin,  
**I want to** have exclusive access to stock management and approval features,  
**So that** unauthorized users cannot modify critical data.

**Acceptance Criteria:**
- [ ] Employees cannot access "Manage Stock" or "Approve Requests" pages.
- [ ] Admins have access to all system features.
- [ ] Direct URL access to unauthorized pages redirects to a "403 Forbidden" or dashboard.

---

## 2. Inventory Management
### Story 2.1: View Inventory Dashboard
**As an** Employee or Admin,  
**I want to** view a list of all stock items with their details (Name, Part Number, Qty, Location),  
**So that** I know what is currently available.

**Acceptance Criteria:**
- [ ] Dashboard displays a table of items.
- [ ] Columns include: Name, Description, Part No, Brand, Quantity, Unit, Location.
- [ ] Users can search/filter by name or part number.
- [ ] Low stock items are visually highlighted (e.g., red row or icon).

### Story 2.2: Scan Barcode
**As an** Employee,  
**I want to** scan a QR/Barcode on a storage bin using my mobile camera,  
**So that** I can instantly see the list of items stored in that location.

**Acceptance Criteria:**
- [ ] Mobile view has a "Scan" button.
- [ ] Clicking "Scan" opens the camera.
- [ ] Scanning a valid location code redirects to the Location Detail page.
- [ ] Location Detail page lists all items in that bin.

### Story 2.3: Manage Stock (CRUD)
**As an** Admin,  
**I want to** add, edit, or delete stock items,  
**So that** the inventory records remain accurate.

**Acceptance Criteria:**
- [ ] Admin can add a new item with all required fields (including Min Stock Level).
- [ ] Admin can edit existing item details.
- [ ] Admin can delete an item (with confirmation).
- [ ] Changes are reflected immediately in the dashboard.

### Story 2.4: Low Stock Alerts
**As an** Admin,  
**I want** the system to alert me when an item's quantity drops below its minimum threshold,  
**So that** I can reorder before it runs out.

**Acceptance Criteria:**
- [ ] Items with `Quantity <= MinStock` are flagged in the dashboard.
- [ ] Admin dashboard has a "Low Stock" widget or filtered view.

---

## 3. Request & Procurement
### Story 3.1: Submit Request
**As an** Employee,  
**I want to** submit a request for an item,  
**So that** the admin knows I need it for my work.

**Acceptance Criteria:**
- [ ] Employee can select an item and click "Request".
- [ ] Form includes Quantity and optional Urgency/Note.
- [ ] Submitted request appears in the "Pending" status on the Admin's list.
- [ ] Request is logged in the system.

### Story 3.2: Approve/Reject Request
**As an** Admin,  
**I want to** review pending requests and approve or reject them,  
**So that** I can control inventory usage and purchases.

**Acceptance Criteria:**
- [ ] Admin sees a list of "Pending" requests.
- [ ] Inspecting a request allows "Approve" or "Reject" actions.
- [ ] "Reject" requires entering a reason.
- [ ] "Approve" changes status to "Approved" (or "Ordered" if PO is entered immediately).

### Story 3.3: PO Tracking
**As an** Admin,  
**I want to** input a PO Number and ETA for approved requests,  
**So that** employees know when to expect the item.

**Acceptance Criteria:**
- [ ] Admin can update a request with PO Number and Estimated Arrival Date.
- [ ] Status updates to "Ordered" or "Purchased".
- [ ] The request listing shows the PO info.

### Story 3.4: Notifications
**As an** Employee,  
**I want to** receive a notification when my request status changes,  
**So that** I know if I can pick up the item or if it was rejected.

**Acceptance Criteria:**
- [ ] Helper badge or list showing unread notifications.
- [ ] Notification created when status changes to Approved, Rejected, or Arrived.
- [ ] Clicking notification links to the request detail.

---

## 4. System & Audit
### Story 4.1: Audit Trails
**As an** Admin,  
**I want to** see a log of all stock changes,  
**So that** I can trace who added or removed items and when.

**Acceptance Criteria:**
- [ ] "Audit Log" page accessible only to Admins.
- [ ] Table shows: Timestamp, User, Action (Create/Update/Delete/Request), Item Name, Quantity Change.
- [ ] Logs are immutable (cannot be deleted/edited).
