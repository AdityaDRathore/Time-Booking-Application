// src/repository/booking/BookingRepository.ts

import { Booking, Prisma } from '@prisma/client';
import { prisma } from '../base/transaction';
import { BaseRepository } from '../base/BaseRepository';

export class BookingRepository extends BaseRepository<
  Booking,
  Prisma.BookingCreateInput,
  Prisma.BookingUpdateInput
> {
  constructor() {
    super(prisma.booking);
  }

  async getBookingById(id: string): Promise<Booking | null> {
    return await prisma.booking.findUnique({
      where: { id },
    });
  }

  async createBooking(data: Prisma.BookingCreateInput): Promise<Booking> {
    return await prisma.booking.create({
      data,
    });
  }

  async updateBooking(id: string, data: Prisma.BookingUpdateInput): Promise<Booking> {
    return await prisma.booking.update({
      where: { id },
      data,
    });
  }

  async deleteBooking(id: string): Promise<Booking> {
    return await prisma.booking.delete({
      where: { id },
    });
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return await prisma.booking.findMany({
      where: { user_id: userId },
    });
  }

  async getBookingsByLab(labId: string): Promise<Booking[]> {
    return await prisma.booking.findMany({
      where: { timeSlot: { lab_id: labId } },
      include: {
        timeSlot: true,
      },
    });
  }

  async getPendingBookings(): Promise<Booking[]> {
    return await prisma.booking.findMany({
      where: { booking_status: 'PENDING' },
    });
  }
}
