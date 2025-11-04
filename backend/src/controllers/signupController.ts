import express from 'express';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import Role from '../models/Role';
import User from '../models/User';
import { IUser } from '../types/User';
import { IRole } from '../types/Role';
import { signupSchema } from '../validation/userValidation';
import { ZodIssue } from 'zod';

config();

export const signup = async (
  req: express.Request,
  res: express.Response,
): Promise<express.Response> => {
  try {
    const parseResult = signupSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue: ZodIssue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const { email, password, name }: { email: string; password: string; name: string } =
      parseResult.data;

    const existingUser: IUser | null = (await User.findOne({
      where: { email },
    })) as unknown as IUser | null;
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const passwordHash: string = await bcrypt.hash(password, 12);

    const newUser: IUser = (await User.create({
      email,
      password_hash: passwordHash,
      name,
    })) as unknown as IUser;

    const defaultRole: IRole | null = (await Role.findOne({
      where: { name: 'viewer' },
    })) as unknown as IRole | null;

    if (defaultRole) {
      await newUser.addRole(defaultRole as any);
    }

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// export const createUserWithRoles = async (
//   req: express.Request,
//   res: express.Response,
// ): Promise<express.Response> => {
//   try {
//     const {
//       email,
//       password,
//       name,
//       roles,
//     }: {
//       email: string;
//       password: string;
//       name: string;
//       roles?: string[];
//     } = req.body;

//     const existingUser: IUser | null = (await User.findOne({
//       where: { email },
//     })) as unknown as IUser | null;
//     if (existingUser) {
//       return res.status(400).json({ message: 'Email already in use' });
//     }

//     const passwordHash: string = await bcrypt.hash(password, 12);

//     const newUser: IUser = (await User.create({
//       email,
//       password_hash: passwordHash,
//       name,
//     })) as unknown as IUser;

//     if (roles && roles.length > 0) {
//       const roleRecords: IRole[] = (await Role.findAll({
//         where: { name: roles },
//       })) as unknown as IRole[];

//       for (const role of roleRecords) {
//         await newUser.addRole(role as any);
//       }

//       if (roleRecords.length !== roles.length) {
//         const foundRoleNames: string[] = roleRecords.map((r: IRole) => r.name);
//         const missingRoles: string[] = roles.filter((r: string) => !foundRoleNames.includes(r));
//         console.warn(`Some roles not found: ${missingRoles.join(', ')}`);
//       }
//     } else {
//       const defaultRole: IRole | null = (await Role.findOne({
//         where: { name: 'viewer' },
//       })) as unknown as IRole | null;

//       if (defaultRole) {
//         await newUser.addRole(defaultRole as any);
//       }
//     }

//     return res.status(201).json({
//       message: 'User created successfully',
//       user: {
//         id: newUser.id,
//         email: newUser.email,
//         name: newUser.name,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

// export const updateUserRoles = async (
//   req: express.Request,
//   res: express.Response,
// ): Promise<express.Response> => {
//   try {
//     const { userId } = req.params;
//     const { roles }: { roles: string[] } = req.body;

//     const user: IUser | null = (await User.findByPk(userId)) as unknown as IUser | null;
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const roleRecords: IRole[] = (await Role.findAll({
//       where: { name: roles },
//     })) as unknown as IRole[];

//     await user.setRoles(roleRecords as any);

//     return res.status(200).json({
//       message: 'User roles updated successfully',
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };
