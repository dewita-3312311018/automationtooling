import type { ApiPaginatedResponse, ApiResponse } from "@/types/common";

type StockType = "mechanical" | "electrical";

type StockInfo = {
  id: string;
  modelNumber: string;
  description?: string;
  brand: string;
  quantity: number;
  uom: string;
  projectType?: string;
  type: StockType;
  minStockLevel: number;
  locationId?: string;
  createdAt: string;
  updatedAt: string;
};

type StockListResponse = ApiPaginatedResponse<StockInfo>;
type StockDetailResponse = ApiResponse<StockInfo>;

type StockLocation = {
  locationId: string;
  locationName: string;
  floor: string | null;
  quantity: number;
};

type StockLocationResponse = ApiResponse<StockLocation[]>;

export type {
  StockType,
  StockInfo,
  StockListResponse,
  StockDetailResponse,
  StockLocation,
  StockLocationResponse,
};
