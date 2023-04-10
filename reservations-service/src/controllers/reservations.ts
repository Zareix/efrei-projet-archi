import { Reservation } from '@prisma/client';
import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Response,
  Route,
  Tags,
} from 'tsoa';
import prisma from '../db';
import { ErrorJSON } from '../routes';

const apartmentAvailable = async (
  apartmentId: number,
  startDate: Date,
  endDate: Date
) => {
  const reservations = await prisma.reservation.findMany({
    where: {
      apartmentId,
      startDate: {
        lte: endDate,
      },
      endDate: {
        gte: startDate,
      },
    },
  });
  return reservations.length === 0;
};

const userExists = async (userId: number) => {
  const res = await fetch(`http://localhost:8000/users/${userId}/exists`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) return true;
  return false;
};

@Route('reservations')
@Tags('Reservations Controller')
export class ReservationsController extends Controller {
  @Get('/')
  public async getAllReservations(): Promise<Reservation[]> {
    return await prisma.reservation.findMany();
  }

  @Get('/users/{userId}')
  public async getAllReservationsOfUser(
    @Path() userId: number
  ): Promise<Reservation[]> {
    if (!(await userExists(userId))) return [];
    return await prisma.reservation.findMany({
      where: {
        userId,
      },
    });
  }

  @Get('/{reservationId}')
  @Response<ErrorJSON>(400, 'Missing reservationId')
  @Response<ErrorJSON>(404, 'Reservation not found')
  public async getReservation(
    @Path() reservationId: number
  ): Promise<Reservation | ErrorJSON> {
    const reservation = await prisma.reservation.findUnique({
      where: {
        id: reservationId,
      },
    });
    if (reservation === null) {
      this.setStatus(404);
      return { message: `Reservation with id ${reservationId} not found` };
    }
    return reservation;
  }

  @Post('/')
  @Response<ErrorJSON>(
    400,
    'Missing userId || End date must be after start date || Start date must be in the future || Apartment with id {apartmentId} is not available'
  )
  @Response<ErrorJSON>(
    404,
    'Reservation not found || User not found|| Apartment with id {apartmentId} not found'
  )
  public async addReservation(
    @Body() reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Reservation | ErrorJSON> {
    if (reservation.userId === undefined) {
      this.setStatus(400);
      return { message: 'Missing userId' };
    }
    if (reservation.endDate < reservation.startDate) {
      this.setStatus(400);
      return { message: 'End date must be after start date' };
    }
    if (reservation.startDate < new Date()) {
      this.setStatus(400);
      return { message: 'Start date must be in the future' };
    }
    if (
      (await prisma.apartment.findUnique({
        where: { id: reservation.apartmentId },
      })) === null
    ) {
      this.setStatus(404);
      return {
        message: `Apartment with id ${reservation.apartmentId} not found`,
      };
    }
    if (
      !(await apartmentAvailable(
        reservation.apartmentId,
        reservation.startDate,
        reservation.endDate
      ))
    ) {
      this.setStatus(400);
      return {
        message: `Apartment with id ${reservation.apartmentId} is not available`,
      };
    }
    if (!(await userExists(reservation.userId))) {
      this.setStatus(404);
      return {
        message: `User with id ${reservation.userId} not found`,
      };
    }
    return await prisma.reservation.create({
      data: reservation,
    });
  }

  @Delete('/{reservationId}')
  @Response<ErrorJSON>(400, 'Missing reservationId')
  @Response<ErrorJSON>(404, 'Reservation not found')
  public async removeReservation(
    @Path() reservationId: number
  ): Promise<{ message: string } | ErrorJSON> {
    if (
      (await prisma.reservation.findUnique({
        where: { id: reservationId },
      })) === null
    ) {
      this.setStatus(404);
      return { message: 'Reservation not found' };
    }
    await prisma.reservation.delete({
      where: {
        id: reservationId,
      },
    });
    return { message: 'Reservation deleted' };
  }

  public async removeAllReservationsOfUser(
    @Path() userId: number
  ): Promise<{ message: string } | ErrorJSON> {
    if (!userId) {
      this.setStatus(400);
      return { message: 'Missing userId' };
    }
    const res = await prisma.reservation.deleteMany({
      where: {
        userId,
        createdAt: {
          lte: new Date(),
        },
      },
    });
    return { message: `Deleted ${res.count} reservations` };
  }
}
