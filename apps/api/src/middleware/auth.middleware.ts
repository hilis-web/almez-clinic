import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "ADMIN" | "RECEPTIONIST";
  };
}

interface JwtPayload {
  sub: string;
  role: "ADMIN" | "RECEPTIONIST";
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authReq = req as AuthenticatedRequest;
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required.",
    });
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      error: "Invalid authentication token.",
    });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      (payload.role !== "ADMIN" && payload.role !== "RECEPTIONIST")
    ) {
      return res.status(401).json({
        error: "Invalid authentication token.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive || user.role !== payload.role) {
      return res.status(401).json({
        error: "User is not authorized to access this resource.",
      });
    }

    authReq.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired authentication token.",
    });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.user) {
    return res.status(401).json({
      error: "Authentication required.",
    });
  }

  if (authReq.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "Administrator access required.",
    });
  }

  return next();
}
