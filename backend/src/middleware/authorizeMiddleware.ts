import express from 'express';
import User from '../models/User';
import Role from '../models/Role';

export const authorize = (...requiredRoles: string[]) => {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const user = await User.findByPk(userId, {
        include: [{ model: Role, as: 'role' }],
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      if (!user.role) {
        res.status(403).json({ message: 'User has no assigned role' });
        return;
      }

      const userRole = user.role.identifier || user.role.name;

      const hasAccess = requiredRoles.some((role) => role.toLowerCase() === userRole.toLowerCase());

      if (!hasAccess) {
        res.status(403).json({
          message: 'Forbidden: You do not have the required permissions',
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

export default authorize;
