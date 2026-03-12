import type { ApiPaginatedResponse } from "@/types/common";

type Role = {
  id: string;
  name: string;
  description?: string;
};

type User = {
  id: string;
  name: string;
  username: string;
  role: string | Role;
  createdAt: string;
  updatedAt: string;
};

type UsersResponse = ApiPaginatedResponse<User>;

export type { UsersResponse, User as UserInfo, Role as RoleInfo };

