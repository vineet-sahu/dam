import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { IUser } from "../types/User";
import { signinSchema } from "../validation/authValidation";
import { ZodIssue } from "zod";

export const signin = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const parseResult = signinSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue: ZodIssue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const { email, password, rememberMe } = parseResult.data;

    const user: IUser | null = (await User.findOne({
      where: { email },
    })) as unknown as IUser | null;
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch: boolean = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token: string = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "",
      { expiresIn: rememberMe ? "30d" : "1d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Signin successful",
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const me = async (req: Request, res: Response): Promise<Response> => {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "");
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user: IUser | null = (await User.findByPk(
      decoded.id,
    )) as unknown as IUser | null;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
