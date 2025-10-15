import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ message: "Authentication required" });
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
