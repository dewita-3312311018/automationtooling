type AuditAction = "CREATE" | "UPDATE" | "DELETE";
type AuditEntity = "STOCK" | "REQUEST" | "USER" | "ROLE" | "NOTIFICATION";

type AuditInfo = {
  id: string;
  userId: string | null;
  userName: string | null;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;

  details: string | null;
  createdAt: string;
};

export type { AuditAction, AuditEntity, AuditInfo };
