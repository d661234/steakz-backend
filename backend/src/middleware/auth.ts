import { Request, Response, NextFunction } from 'express'; // Import Express types for typing middleware parameters
import jwt from 'jsonwebtoken'; // Import jsonwebtoken to verify JWT tokens sent by clients
import { UserRole } from '@prisma/client'; // Import the UserRole enum to type the role field on the decoded token

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_me'; // Read JWT secret from environment; fallback is insecure and only for local dev

export interface AuthRequest extends Request { // Extend the standard Express Request with an optional user payload attached after JWT verification
  user?: { // Optional because unauthenticated requests don't have a user
    id: number; // Database ID of the authenticated user
    role: UserRole; // Role of the user, used downstream by RBAC middleware
    branch_id?: number | null; // Branch the user belongs to, if any (null for admins/customers)
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => { // Middleware that reads and verifies the JWT from the Authorization header
  const authHeader = req.headers.authorization; // Extract the Authorization header value (expected format: "Bearer <token>")

  if (authHeader) { // Only attempt verification if the header is present
    const token = authHeader.split(' ')[1]; // Split "Bearer <token>" and take the token part at index 1

    jwt.verify(token, JWT_SECRET, (err, user) => { // Verify the token's signature and expiry against the secret
      if (err) { // Token is invalid, expired, or tampered with
        return res.sendStatus(403); // 403 Forbidden — token was provided but is not valid
      }

      req.user = user as AuthRequest['user']; // Attach the decoded payload (id, role, branch_id) to the request object
      next(); // Token is valid; continue to the next middleware or route handler
    });
  } else {
    res.sendStatus(401); // 401 Unauthorized — no Authorization header was provided at all
  }
};
