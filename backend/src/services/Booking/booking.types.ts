import { Booking } from '@prisma/client';

/**
 * Data required to create a booking.
 */
export type CreateBookingDTO = {
  user_id: string;
  slot_id: string;
  purpose: string;
};

/**
 * Returned when the user is waitlisted instead of booked.
 */
export type WaitlistResponse = {
  waitlisted: true;
  position: number;
  message: string;
};

/**
 * Union type: either a successful Booking or a waitlist response.
 */
export type BookingOrWaitlist = Booking | WaitlistResponse;
