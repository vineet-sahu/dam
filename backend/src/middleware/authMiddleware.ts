import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as {
      id: string;
    };
    req.user = { id: decoded.id };

    next();
  } catch (error: any) {
    res.status(401).json({ message: "Invalid or expired token", error: error });
    return;
  }
};

export default authenticate;
