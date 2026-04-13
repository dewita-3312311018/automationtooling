import type { ApiResponse } from "@/types/common";

type User = {
  id: string;
  name: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

type ProfileResponse = ApiResponse<User>;

export { type ProfileResponse };
export type { User };

