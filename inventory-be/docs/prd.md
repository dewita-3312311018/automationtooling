# PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Project Title:** Website-Based Information System for Inventory & Goods Ordering  
**Department:** Automation and Tooling  
**Date:** February 19, 2026  
**Version:** 1.0 (Draft)

---

## 1. Executive Summary
The Automation and Tooling Department currently manages machine components and spare parts using manual Microsoft Excel spreadsheets. This process is prone to human error, lacks real-time stock visibility, and often leads to inefficient budget usage due to redundant purchases.

> [!IMPORTANT]
> **Objective:**
> To develop a centralized, web-based inventory and ordering system that digitalizes asset management, integrates barcode scanning for instant stock identification, and streamlines the procurement request process.

---

## 2. User Roles & Responsibilities

| Role | Responsibility |
| :--- | :--- |
| **Admin** | Manages master data (Stock, Locations, Staff), validates/approves employee requests, inputs Purchase Order (PO) details, and oversees the procurement lifecycle. |
| **Employee** | Browses the inventory, scans barcodes to check bin contents, and submits digital requests for materials or spare parts. |

---

## 3. Functional Requirements

### 3.1 Authentication & Security
- **FR-01:** Users must log in securely using a unique Badge Number and Password.
- **FR-02:** The system must restrict access to features based on roles (Admin vs. Employee).

### 3.2 Inventory Management
- **FR-03 (Dashboard):** Display a real-time list of items including Name, Description, Part Number, Brand, Quantity, Unit, and Minimum Threshold.
- **FR-04 (Barcode Integration):** Users can scan a storage bin barcode/QR code using their mobile device camera, which opens the item's detail page to view contents.
- **FR-05 (Stock Control):** Admins can Add, Edit, or Delete stock items. Updates must reflect immediately for all users.
- **FR-10 (Low Stock Alerts):** The system must highlight items that fall below the defined minimum threshold.
- **FR-11 (Audit Logs):** The system must properly record all stock movements, updates, and deletions, tracking the user, action type, amount, and timestamp.

### 3.3 Request & Procurement System
- **FR-06 (Request Submission):** Employees can search for items and submit a request (specifying quantity and urgency).
- **FR-07 (Approval Workflow):** Admins can Approve requests (generating a "Purchased" status) or Reject them (requiring a "Reason for Rejection").
- **FR-08 (PO Tracking):** For approved items, Admins must input the PO Number and Estimated Arrival Date.
- **FR-12 (In-App Notifications):** Users receive in-app notifications for status updates (e.g., Request Approved, New Request Received).

### 3.4 Staff Management
- **FR-09:** Admins can register new employees into the system to grant them access.

---

## 4. User Stories & Workflows

### Story A: The "Quick Check" (Admin/Employee)
> **User Story:** "As a user, I want to scan a barcode on a storage box so that I can immediately see exactly which parts are stored inside without opening it."

*(Please insert the Barcode Scanning Diagram here)*

### Story B: The "Stock Update" (Admin)
> **User Story:** "As an Admin, I want to update stock quantities in real-time so that employees don't request items that are actually out of stock."

*(Please insert the Stock Update Diagram here)*

### Story C: The "Digital Request" (Employee)
> **User Story:** "As an Employee, I want to submit a digital request for a spare part so that I don't have to send manual messages or emails."

*(Please insert the Request Flow Diagram here)*

### Story D: The "Procurement Approval" (Admin)
> **User Story:** "As an Admin, I want to approve a request by entering a PO Number so the employee knows the part is on the way."

*(Please insert the Approval Workflow Diagram here)*

---

## 5. Technical Specifications

- **Frontend:** React.js (for a responsive user interface)
- **Backend:** Node.js (for API logic and server handling)
- **Database:** MySQL (relational database for complex data integrity)
- **Language:** English (Interface and Documentation)

---

## 6. Data Model Overview
The system relies on five core database entities:

| Entity | Description |
| :--- | :--- |
| **USER** | Stores login credentials and roles. |
| **STOCK** | Stores item details (Part Number, Brand, Qty, Min Stock Level). |
| **LOCATION** | Stores physical bin/shelf locations (linked to barcodes). |
| **STOCK_REQUEST** | Records items requested by employees. |
| **APPROVAL_REQUEST** | Records the Admin's decision (PO Number or Rejection). |
| **AUDIT_LOG** | Records all system actions (User, Action, Timestamp, Details). |
| **NOTIFICATION** | Stores user alerts and status updates. |

*(Please insert the Entity Relationship Diagram (ERD) here)*

---

## 7. Test Plan (Waterfall Model)
The project will use **Black Box Testing** to validate features without inspecting code.

### Key Test Cases:
- **Login:** Verify Admin and Employee act as separate roles.
- **Scan:** Verify scanning a barcode returns the correct list of items.
- **Update:** Verify that changing stock quantity updates the Employee view instantly.
- **Request:** Verify that an employee request appears in the Admin dashboard.
- **Approval:** Verify that entering a PO Number updates the status to "Purchased".