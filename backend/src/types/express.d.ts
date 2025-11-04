import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      file: Express.Multer.File;
      files: Express.Multer.File[];
      id?: string;
      user?: {
        id: string;
        email?: string;
        role?: string;
      };
    }
  }
}

export default Request;
