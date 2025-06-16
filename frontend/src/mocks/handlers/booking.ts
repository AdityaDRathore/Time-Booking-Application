import { http, HttpResponse } from 'msw';

export const bookingsHandlers = [
  http.post('/api/bookings', async ({ request }) => {
    const { slotId } = await request.json() as { slotId: string };
    return HttpResponse.json({
      id: 'booking-' + Math.random().toString(36).substring(2, 8),
      slotId,
      userId: 'mock-user-id',
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  http.delete('/api/bookings/:bookingId', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.put('/api/bookings/:bookingId', async ({ params, request }) => {
    const { status } = await request.json() as { status: string };
    const { bookingId } = params;
    return HttpResponse.json({
      id: bookingId,
      slotId: 'mock-slot-id',
      userId: 'mock-user-id',
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),
];
