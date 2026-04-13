import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { inArray, eq } from "drizzle-orm";

import { db } from "./index";
import { registerUser } from "../modules/auth/auth.service";
import { userTable } from "../modules/user/user.schema";
import { createLocation } from "../modules/location/location.service";
import { locationTable } from "../modules/location/location.schema";
import { createStock } from "../modules/stock/stock.service";
import { stockTable } from "../modules/stock/stock.schema";
import {
  createRole,
  createPermission,
  assignPermissionToRole,
  assignRoleToUser
} from "../modules/rbac/rbac.service";
import {
  roleTable,
  permissionTable,
  userRoleTable,
  rolePermissionTable
} from "../modules/rbac/rbac.schema";
import { createRequest, reviewRequest } from "../modules/request/request.service";
import { requestTable } from "../modules/request/request.schema";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const STATE_FILE = resolve(__dirname, ".seed-state.json");

interface SeedState {
  users: string[];
  locations: string[];
  stocks: string[];
  roles: string[];
  permissions: string[];
  requests: string[];
}

async function loadState(): Promise<SeedState | null> {
  try {
    const data = await readFile(STATE_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function saveState(state: SeedState) {
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}

async function clearOldData(state: SeedState) {
  console.log("Cleaning up old seeded data...");

  if (state.requests && state.requests.length > 0) {
    await db.delete(requestTable).where(inArray(requestTable.id, state.requests));
  }

  if (state.stocks.length > 0) {
    await db.delete(stockTable).where(inArray(stockTable.id, state.stocks));
  }

  if (state.locations.length > 0) {
    await db.delete(locationTable).where(inArray(locationTable.id, state.locations));
  }

  if (state.users.length > 0) {
    await db.delete(userTable).where(inArray(userTable.id, state.users));
  }

  if (state.roles.length > 0 || state.permissions.length > 0) {
    await db.delete(userRoleTable);
    await db.delete(rolePermissionTable);
  }

  if (state.roles.length > 0) {
    await db.delete(roleTable).where(inArray(roleTable.id, state.roles));
  }

  if (state.permissions.length > 0) {
    await db.delete(permissionTable).where(inArray(permissionTable.id, state.permissions));
  }
}

const isConflict = (err: unknown) => {
  const e = err as { statusCode?: number; code?: string; cause?: { code?: string }; message?: string };
  if (e.statusCode === 409) return true;
  if (e.statusCode === 400 && e.message === "Username already registered") return true;
  if (e.code === "ER_DUP_ENTRY") return true;
  if (e.cause && e.cause.code === "ER_DUP_ENTRY") return true;
  if (e.message && e.message.includes("already exists")) return true;
  return false;
};

async function runSeed() {
  console.log("Starting database seed...");

  const oldState = await loadState();
  if (oldState) {
    await clearOldData(oldState);
  }

  const newState: SeedState = {
    users: [],
    locations: [],
    stocks: [],
    roles: [],
    permissions: [],
    requests: []
  };

  try {
    // Create Roles
    console.log("Creating Roles...");
    let adminRole;
    try {
      adminRole = await createRole({ name: "admin", description: "Administrator" });
    } catch (err: any) {
      if (isConflict(err)) {
        const rows = await db.select().from(roleTable).where(eq(roleTable.name, "admin"));
        adminRole = rows[0];
      } else throw err;
    }

    let employeeRole;
    try {
      employeeRole = await createRole({ name: "employee", description: "Standard Employee" });
    } catch (err: any) {
      if (isConflict(err)) {
        const rows = await db.select().from(roleTable).where(eq(roleTable.name, "employee"));
        employeeRole = rows[0];
      } else throw err;
    }

    if (!adminRole || !employeeRole) throw new Error("Failed to create roles");
    newState.roles.push(adminRole.id, employeeRole.id);

    console.log("Creating Permissions...");
    const perms = [
      "locations:read", "locations:update", "locations:create", "locations:delete",
      "stocks:read", "stocks:update", "stocks:create", "stocks:delete",
      "requests:read", "requests:update", "requests:create", "requests:delete", "requests:change-status", "requests:my-requests",
      "users:read", "users:update", "users:create", "users:delete",
      "audit:read",
      "rbac:read", "rbac:update", "rbac:create", "rbac:delete",
    ];

    for (const name of perms) {
      let p;
      try {
        p = await createPermission({ name, description: `Permission for ${name}` });
      } catch (err: any) {
        if (isConflict(err)) {
          const rows = await db.select().from(permissionTable).where(eq(permissionTable.name, name));
          p = rows[0];
        } else {
          throw err;
        }
      }
      if (!p) continue;

      newState.permissions.push(p.id);

      try {
        await assignPermissionToRole(adminRole.id, p.id);
      } catch (err: any) {
        if (!isConflict(err)) throw err;
      }

      if (["locations:read", "stocks:read", "requests:read", "requests:update", "requests:create", "requests:my-requests"].includes(name)) {
        try {
          await assignPermissionToRole(employeeRole.id, p.id);
        } catch (err: any) {
          if (!isConflict(err)) throw err;
        }
      }
    }

    console.log("Creating Users...");
    let adminUser;
    try {
      adminUser = await registerUser({
        name: "Super Admin",
        username: "admin",
        password: "password123",
      });
    } catch (err: any) {
      if (isConflict(err)) {
        const rows = await db.select().from(userTable).where(eq(userTable.username, "admin"));
        adminUser = rows[0];
      } else throw err;
    }
    if (!adminUser) throw new Error("Failed to create admin user");

    newState.users.push(adminUser.id);
    try {
      await assignRoleToUser(adminUser.id, adminRole.id);
    } catch (err: any) {
      if (!isConflict(err)) throw err;
    }

    let employeeUser;
    try {
      employeeUser = await registerUser({
        name: "Field Tech",
        username: "employee",
        password: "password123",
      });
    } catch (err: any) {
      if (isConflict(err)) {
        const rows = await db.select().from(userTable).where(eq(userTable.username, "employee"));
        employeeUser = rows[0];
      } else throw err;
    }
    if (!employeeUser) throw new Error("Failed to create employee user");

    newState.users.push(employeeUser.id);
    try {
      await assignRoleToUser(employeeUser.id, employeeRole.id);
    } catch (err: any) {
      if (!isConflict(err)) throw err;
    }

    // Create Locations
    console.log("Creating 20 Locations...");
    for (let i = 1; i <= 20; i++) {
      const loc = await createLocation({
        name: `Aisle ${Math.ceil(i / 5)} - Rack ${(i % 5) + 1}`,
        description: `Storage bin for various parts`,
        floor: `Floor ${Math.floor(Math.random() * 3) + 1}`,
      });
      if (loc) newState.locations.push(loc.id);
    }

    if (newState.locations.length === 0) {
      throw new Error("Failed to create locations for seed data");
    }

    // Create Stocks
    console.log("Creating 15 Stocks...");
    const sampleBrands = ["Siemens", "OMRON", "ABB", "Schneider", "Mitsubishi", "Mitsubishi", "Schneider", "ABB", "OMRON", "Siemens", "Keyence", "Festo", "SMC", "WIKA", "ifm"];
    const typeEnum = ["mechanical", "electrical"] as const;

    for (let i = 0; i < 15; i++) {
      const brand = sampleBrands[i % sampleBrands.length]!;
      const type = typeEnum[i % typeEnum.length]!;
      const locationId = newState.locations[i % newState.locations.length]!;

      const stock = await createStock({
        modelNumber: `MOD-${Math.floor(Math.random() * 10000)}-${i}`,
        description: `Industrial component piece ${i}`,
        brand,
        uom: "pcs",
        projectType: `Project ${String.fromCharCode(65 + (i % 5))}`,
        type,
        minStockLevel: 5 + Math.floor(Math.random() * 10),
        locations: [
          {
            locationId,
            quantity: Math.floor(Math.random() * 100) + 10,
          }
        ]
      }, adminUser.id);
      if (stock) newState.stocks.push(stock.id);
    }

    if (newState.stocks.length === 0) {
      throw new Error("Failed to create stocks for seed data");
    }

    // Create Requests
    console.log("Creating 10 Requests...");
    for (let i = 0; i < 10; i++) {
      const stockId = newState.stocks[i % newState.stocks.length]!;

      const isApproved = i % 2 === 0;
      const request = await createRequest({
        stockId: stockId,
        quantity: Math.floor(Math.random() * 5) + 1,
        urgency: i % 3 === 0 ? "high" : "normal",
        note: `Need this for Project ${String.fromCharCode(65 + i)}`,
      }, employeeUser.id);

      if (!request) continue;
      newState.requests.push(request.id);

      if (isApproved) {
        await reviewRequest(request.id, {
          status: "APPROVED",
          adminNote: "Looks good, approved.",
        });
      } else if (i === 5) {
        await reviewRequest(request.id, {
          status: "REJECTED",
          adminNote: "Not enough info.",
        });
      } else if (i === 7) {
        await reviewRequest(request.id, {
          status: "ARRIVED",
          adminNote: "Ordered from supplier.",
          poNumber: `PO-${1000 + i}`,
          eta: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], // 7 days from now
          locationId: newState.locations[0]!,
        });
      }
    }

    // Create Withdrawal Requests
    console.log("Creating 3 Withdrawal Requests...");
    for (let i = 0; i < 3; i++) {
      const stockId = newState.stocks[i % newState.stocks.length]!;
      // Use the same location where this stock was created
      const stockLocationId = newState.locations[i % newState.locations.length]!;
      const request = await createRequest({
        type: "withdrawal",
        stockId: stockId,
        quantity: Math.floor(Math.random() * 3) + 1,
        urgency: i === 0 ? "high" : "normal",
        note: `Withdrawal for maintenance task ${i + 1}`,
      }, employeeUser.id);

      if (!request) continue;
      newState.requests.push(request.id);

      if (i === 1) {
        await reviewRequest(request.id, {
          status: "APPROVED",
          adminNote: "Withdrawal approved.",
          locationId: stockLocationId,
        });
      } else if (i === 2) {
        await reviewRequest(request.id, {
          status: "REJECTED",
          adminNote: "Please use the items from the other batch first.",
        });
      }
    }

    await saveState(newState);
    console.log("Seeding completed successfully!");
    process.exit(0);

  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

runSeed();
