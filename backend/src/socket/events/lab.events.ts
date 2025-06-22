import { Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from './event.types';
import { getLabRoom } from '../utils/roomNames';
import { LabService } from '@src/services/lab/lab.service'; // ✅ Service import

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

const labService = new LabService();

export function registerLabEvents(socket: TypedSocket) {
  socket.on('lab:status', async (data) => {
    try {
      const { labId, occupied } = data;

      // ✅ Update lab status in DB
      await labService.updateLabStatus(labId, occupied);

      // ✅ Notify everyone in the lab room
      socket.to(getLabRoom(labId)).emit('lab:status', data);
    } catch (error: any) {
      socket.emit('error', { message: 'Failed to update lab status' });
    }
  });
}
