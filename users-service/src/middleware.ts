import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';

import prisma from './db';

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization) {
    return res.status(401).send('Unauthorized : Missing authorization header');
  }
  const [type, credentials] = req.headers.authorization.split(' ');
  if (type !== 'Basic') {
    return res.status(401).send('Unauthorized : Invalid type');
  }
  const [username, password] = Buffer.from(credentials, 'base64')
    .toString()
    .split(':');
  const user = await prisma.user.findUnique({
    where: {
      email: username,
    },
  });
  if (!user) {
    return res.status(401).send('Unauthorized : User not found');
  }
  if (!(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).send('Unauthorized : Invalid password');
  }
  return next();
};

const hashPassword = async (plaintextPassword: string) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plaintextPassword, salt);
  return [hash, salt] as const;
};

const verifyPassword = async (
  plaintextPassword: string,
  realHash: string,
  salt: string
) => {
  const hash = await bcrypt.hash(plaintextPassword, salt);
  return await bcrypt.compare(hash, realHash);
};

export { authMiddleware, hashPassword, verifyPassword };
