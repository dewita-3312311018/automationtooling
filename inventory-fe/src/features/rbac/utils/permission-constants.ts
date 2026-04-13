export const Permissions = {
  stocks: {
    read: "stocks:read",
    update: "stocks:update",
    create: "stocks:create",
    delete: "stocks:delete",
  },
  requests: {
    read: "requests:read",
    update: "requests:update",
    create: "requests:create",
    delete: "requests:delete",
    changeStatus: "requests:change-status",
    myRequests: "requests:my-requests",
  },
  locations: {
    read: "locations:read",
    update: "locations:update",
    create: "locations:create",
    delete: "locations:delete",
  },
  users: {
    read: "users:read",
    update: "users:update",
    create: "users:create",
    delete: "users:delete",
  },
  audit: {
    read: "audit:read",
  },
  rbac: {
    read: "rbac:read",
    update: "rbac:update",
    create: "rbac:create",
    delete: "rbac:delete",
  },
} as const;

export type Permission = typeof Permissions[keyof typeof Permissions][keyof typeof Permissions[keyof typeof Permissions]];
