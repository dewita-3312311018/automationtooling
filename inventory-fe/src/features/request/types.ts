import type { ApiPaginatedResponse } from "@/types/common";

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "ORDERED" | "ARRIVED";

type RequestUrgency = "low" | "normal" | "high";

type RequestInfo = {
  id: string;
  userId: string;
  stockId: string;
  modelNumber: string | null;
  requestedModelNumber?: string | null;
  requestedBrand?: string | null;
  requestedDescription?: string | null;
  quantity: number;
  urgency: RequestUrgency | string;
  note: string | null;
  status: RequestStatus;
  adminNote: string | null;
  poNumber: string | null;
  eta: string | null;
  requester?: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
};

type RequestListResponse = ApiPaginatedResponse<RequestInfo>;

type CreateRequestPayload = {
  stockId?: string;
  requestedModelNumber?: string;
  requestedBrand?: string;
  requestedDescription?: string;
  quantity: number;
  urgency?: string;
  note?: string;
};

type ReviewRequestPayload = {
  status: "APPROVED" | "REJECTED" | "ORDERED" | "ARRIVED";
  adminNote?: string;
  poNumber?: string;
  eta?: string;
  locationId?: string;
  existingStockId?: string;
  newStockDetails?: {
    uom: string;
    type: "mechanical" | "electrical";
    minStockLevel?: number;
    description?: string;
    projectType?: string;
  };
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

const statusVariantMap: Record<RequestStatus, BadgeVariant> = {
  PENDING: "warning",
  APPROVED: "default",
  REJECTED: "destructive",
  ORDERED: "outline",
  ARRIVED: "success",
};

const urgencyVariantMap: Record<string, BadgeVariant> = {
  low: "outline",
  normal: "secondary",
  high: "destructive",
};

export { statusVariantMap, urgencyVariantMap };

export type {
  BadgeVariant,
  RequestStatus,
  RequestUrgency,
  RequestInfo,
  RequestListResponse,
  CreateRequestPayload,
  ReviewRequestPayload,
};
