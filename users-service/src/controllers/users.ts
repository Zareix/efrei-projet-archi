import { User } from '@prisma/client';
import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Response,
  Route,
  Security,
  Tags,
} from 'tsoa';
import prisma from '../db';
import { ErrorJSON } from '../routes';
import { sendData } from '../rabbit';

@Route('users')
@Tags('Users Controller')
export class UsersController extends Controller {
  @Get('/')
  public async getAllUsers(): Promise<User[]> {
    return await prisma.user.findMany();
  }

  @Get('/{userId}')
  @Security('basic', ['user'])
  @Response<ErrorJSON>(400, 'Missing userId')
  @Response<ErrorJSON>(404, 'User not found')
  public async getUser(@Path() userId: number): Promise<User | ErrorJSON> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (user === null) {
      this.setStatus(404);
      return { message: `User with id ${userId} not found` };
    }
    return user;
  }

  @Get('/{userId}/exists')
  @Response<ErrorJSON>(400, 'Missing userId')
  @Response<ErrorJSON>(404, 'User not found')
  public async checkUserExists(
    @Path() userId: number
  ): Promise<{ message: string } | ErrorJSON> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (user === null) {
      this.setStatus(404);
      return { message: `User with id ${userId} not found` };
    }
    return {
      message: 'User Exists',
    };
  }

  public async addUser(user: Omit<User, 'id'>): Promise<User | ErrorJSON> {
    if (
      await prisma.user.findUnique({
        where: {
          email: user.email,
        },
      })
    ) {
      this.setStatus(400);
      return { message: 'Email already exists' };
    }
    return await prisma.user.create({
      data: user,
    });
  }

  @Delete('/{userId}')
  @Security('basic', ['user'])
  @Response<ErrorJSON>(400, 'Missing userId')
  @Response<ErrorJSON>(404, 'User not found')
  public async removeUser(
    @Path() userId: number
  ): Promise<{ message: string } | ErrorJSON> {
    if ((await prisma.user.findUnique({ where: { id: userId } })) === null) {
      this.setStatus(404);
      return { message: 'User not found' };
    }
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    await sendData('delete-user-reservations', { userId });
    return { message: 'User deleted' };
  }
}
