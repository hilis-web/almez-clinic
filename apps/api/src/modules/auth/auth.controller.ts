import type { Request, Response } from "express";
import { login } from "./auth.service";
import { loginSchema } from "./auth.validation";

export async function loginController(req: Request, res: Response) {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: "Invalid login data.",
      details: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  try {
    const result = await login(validation.data.email, validation.data.password);

    if (!result) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    return res.status(200).json({
      message: "Login successful.",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    console.error("Login failed:", error);

    return res.status(500).json({
      error: "Unable to process login.",
    });
  }
}
