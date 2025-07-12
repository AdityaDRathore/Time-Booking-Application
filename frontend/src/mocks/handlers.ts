import { http } from 'msw';
import { Lab } from '../types/lab';
import { TimeSlot } from '../types/timeSlot';

// Sample mock data
const labs: Lab[] = [
  {
    id: '1',
    name: 'Physics Lab',
    capacity: 30,
    description: 'Experiments related to classical mechanics and optics.',
    status: 'OPEN',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-06-10T00:00:00Z',
  },
  {
    id: '2',
    name: 'Computer Lab',
    capacity: 50,
    description: 'Software development and data structure experiments.',
    status: 'OPEN',
    createdAt: '2025-06-02T00:00:00Z',
    updatedAt: '2025-06-11T00:00:00Z',
  },
];

const timeSlotsByLab: Record<string, TimeSlot[]> = {
  '1': [
    {
      id: 't1',
      labId: '1',
      startTime: '10:00',
      endTime: '11:00',
      date: '2025-06-16',
      isBooked: false,
      createdAt: '2025-06-01T00:00:00Z',
      updatedAt: '2025-06-10T00:00:00Z',
    },
    {
      id: 't2',
      labId: '1',
      startTime: '11:00',
      endTime: '12:00',
      date: '2025-06-16',
      isBooked: true,
      createdAt: '2025-06-01T00:00:00Z',
      updatedAt: '2025-06-10T00:00:00Z',
    },
  ],
  '2': [
    {
      id: 't3',
      labId: '2',
      startTime: '14:00',
      endTime: '15:00',
      date: '2025-06-16',
      isBooked: false,
      createdAt: '2025-06-02T00:00:00Z',
      updatedAt: '2025-06-11T00:00:00Z',
    },
  ],
};

export const handlers = [
  // 🔹 GET /labs - All labs
  http.get('/labs', () => {
    return Response.json({ data: labs });
  }),

  // 🔹 GET /labs/:id - Lab by ID
  http.get('/labs/:labId', ({ params }) => {
    const lab = labs.find((l) => l.id === params.labId);
    if (lab) {
      return Response.json({ data: lab });
    } else {
      return new Response('Lab not found', { status: 404 });
    }
  }),

  // 🔹 GET /labs/:labId/time-slots - All time slots for a lab
  http.get('/labs/:labId/time-slots', ({ params }) => {
    const slots = timeSlotsByLab[params.labId as string] || [];
    return Response.json({ data: slots });
  }),

  // 🔹 GET /labs/:labId/time-slots/available?date=...
  http.get('/labs/:labId/time-slots/available', ({ params, request }) => {
    const labId = params.labId as string;
    const url = new URL(request.url);
    const date = url.searchParams.get('date');

    const slots = (timeSlotsByLab[labId] || []).filter(
      (slot) => !slot.isBooked && (!date || slot.date === date)
    );

    return Response.json({ data: slots });
  }),

  // 🔹 GET /time-slots/:slotId - Slot by ID
  http.get('/time-slots/:slotId', ({ params }) => {
    const allSlots = Object.values(timeSlotsByLab).flat();
    const slot = allSlots.find((s) => s.id === params.slotId);
    if (slot) {
      return Response.json({ data: slot });
    } else {
      return new Response('Time slot not found', { status: 404 });
    }
  }),
  // 🔹 POST /bookings - Simulate booking a slot
  http.post('/bookings', async ({ request }) => {
    const body = await request.json() as { slotId: string };
    const { slotId } = body;

    const allSlots = Object.values(timeSlotsByLab).flat();
    const slot = allSlots.find((s) => s.id === slotId);

    if (!slot) {
      return new Response('Slot not found', { status: 404 });
    }

    if (slot.isBooked) {
      return new Response('Slot already booked', { status: 400 });
    }

    // Simulate booking by setting isBooked to true
    slot.isBooked = true;
    return Response.json({ message: 'Booking successful', data: slot });
  }),

];
