import express from "express";
import User from "../models/User";
import Role from "../models/Role";

const authorize = (...requiredRoles: string[]) => {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      const user = (await User.findByPk(userId, {
        include: [{ model: Role, as: "roles" }],
      })) as any;

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const userRoles: string[] = user.roles.map((role: any) => role.name);

      const hasRequiredRole: boolean = requiredRoles.some((role: string) =>
        userRoles.includes(role),
      );

      if (!hasRequiredRole) {
        res.status(403).json({
          message: "Forbidden: You do not have the required permissions",
        });
        return;
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  };
};

export default authorize;
