import { User } from '@prisma/client';
import { Body, Controller, Post, Route, Tags } from 'tsoa';
import { ErrorJSON } from '../routes';
import { UsersController } from './users';
import prisma from '../db';
import { hashPassword } from '../middleware';

@Route('auth')
@Tags('Auth Controller')
export class AuthController extends Controller {
  @Post('/register')
  public async register(
    @Body()
    user: Omit<User, 'id' | 'passwordHash' | 'passwordSalt'> & {
      password: string;
    }
  ): Promise<User | ErrorJSON> {
    const userController = new UsersController();
    if (
      (await prisma.user.findUnique({ where: { email: user.email } })) !== null
    ) {
      this.setStatus(400);
      return { message: 'Email already taken' };
    }

    const [passwordHash, passwordSalt] = await hashPassword(user.password);

    return await userController.addUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      passwordHash,
      passwordSalt,
    });
  }
}
