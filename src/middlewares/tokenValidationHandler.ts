import expressAsyncHandler from "express-async-handler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request } from "express";

// Extend Express Request type to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        id: string;
      };
    }
  }
}

export const validateToken = expressAsyncHandler(async (req, res, next) => {
  let token;
  let authHeader = req.headers.Authorization || req.headers.authorization;
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("Error with jwt");
  }
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        res.status(401);
        console.error(err);
      }
      // Type assertion to tell TypeScript we've augmented the Request type
      const payload = decoded as { user: { email: string; id: string } };
      req.user = payload.user;

      next();
    });
  }
});
