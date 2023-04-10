import { Apartment } from '@prisma/client';
import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Query,
  Response,
  Route,
  Tags,
} from 'tsoa';
import prisma from '../db';
import { ErrorJSON } from '../routes';

@Route('apartments')
@Tags('Apartments Controller')
export class ApartmentsController extends Controller {
  @Get('/')
  public async getAllApartments(
    @Query() city?: string,
    @Query() country?: string,
    @Query() minRooms?: number,
    @Query() maxRooms?: number,
    @Query() minPrice?: number,
    @Query() maxPrice?: number
  ): Promise<Apartment[]> {
    return await prisma.apartment.findMany({
      where: {
        city: {
          mode: 'insensitive',
          equals: city,
        },
        country: {
          mode: 'insensitive',
          equals: country,
        },
        rooms: {
          gte: minRooms,
          lte: maxRooms,
        },
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
      },
    });
  }

  @Get('/{apartmentId}')
  @Response<ErrorJSON>(400, 'Missing apartmentId')
  @Response<ErrorJSON>(404, 'Apartment not found')
  public async getApartment(
    @Path() apartmentId: number
  ): Promise<Apartment | ErrorJSON> {
    const apartment = await prisma.apartment.findUnique({
      where: {
        id: apartmentId,
      },
    });
    if (apartment === null) {
      this.setStatus(404);
      return { message: `Apartment with id ${apartmentId} not found` };
    }
    return apartment;
  }

  @Post('/')
  @Response<ErrorJSON>(
    400,
    'Rooms must be greater than 0 || Price must be greater than 0'
  )
  public async addApartment(
    @Body() apartment: Omit<Apartment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Apartment | ErrorJSON> {
    if (apartment.rooms <= 0) {
      this.setStatus(400);
      return { message: 'Rooms must be greater than 0' };
    }
    if (apartment.price <= 0) {
      this.setStatus(400);
      return { message: 'Price must be greater than 0' };
    }
    return await prisma.apartment.create({
      data: apartment,
    });
  }

  @Delete('/{apartmentId}')
  @Response<ErrorJSON>(400, 'Missing apartmentId')
  @Response<ErrorJSON>(404, 'Apartment not found')
  public async removeApartment(
    @Path() apartmentId: number
  ): Promise<{ message: string } | ErrorJSON> {
    if (
      (await prisma.apartment.findUnique({
        where: { id: apartmentId },
      })) === null
    ) {
      this.setStatus(404);
      return { message: 'Apartment not found' };
    }
    await prisma.apartment.delete({
      where: {
        id: apartmentId,
      },
    });
    return { message: 'Apartment deleted' };
  }
}
