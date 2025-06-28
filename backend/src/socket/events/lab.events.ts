import { Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from './event.types';
import { getLabRoom } from '../utils/roomNames';
import { LabService } from '@src/services/lab/lab.service';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

const labService = new LabService();

export function registerLabEvents(socket: TypedSocket) {
  // ✅ Join lab room manually when client emits 'join'
  socket.on('join', ({ room }, ack) => {
    socket.join(room);
    console.log(`🧪 Socket ${socket.id} joined room: ${room}`);
    if (ack) ack();
  });


  socket.on('lab:status', async (data) => {
    try {
      const { labId, isOccupied } = data;

      // ✅ Update lab status in DB
      await labService.updateLabStatus(labId, isOccupied);

      // ✅ Broadcast to others in the lab room
      socket.to(getLabRoom(labId)).emit('lab:status:update', data);
    } catch (error: any) {
      socket.emit('error', { message: 'Failed to update lab status' });
    }
  });
}
