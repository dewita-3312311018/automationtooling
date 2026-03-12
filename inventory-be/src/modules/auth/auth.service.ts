import { sign } from "hono/jwt";
import bcrypt from "bcryptjs";
import { AppError } from "../../lib/error";
import { env } from "../../env";
import { getUserByUsername, createUser } from "../user/user.service";
import type { LoginInput, RegisterInput } from "./auth.types";

async function loginUser(input: LoginInput) {
  const user = await getUserByUsername(input.username);
  if (!user) {
    throw new AppError("Invalid username or password", 401);
  }

  const isMatch = await bcrypt.compare(input.password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid username or password", 401);
  }

  const payload = {
    sub: user.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };

  const token = await sign(payload, env.JWT_SECRET);

  const { password: _password, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

async function registerUser(input: RegisterInput) {
  const existingUser = await getUserByUsername(input.username);
  if (existingUser) {
    throw new AppError("Username already registered", 400);
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await createUser({
    ...input,
    password: hashedPassword,
  });

  if (!user) {
    throw new AppError("Failed to create user", 500);
  }

  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export { loginUser, registerUser };
