import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../state/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useNotificationStore } from '../state/notificationStore';
import { Notification } from '../types/notification';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const useSocket = () => {
  const { token, isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && token && user) {
      const socket = io(SOCKET_URL, {
        auth: {
          token: `Bearer ${token}`,
        },
        transports: ['websocket'],
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('✅ WebSocket connected');
      });

      socket.on('disconnect', () => {
        console.log('❌ WebSocket disconnected');
      });

      socket.on('connect_error', (err) => {
        console.error('⚠️ Socket connection error:', err);
      });

      // ✅ Task 3.1: Key listeners
      socket.on('booking:created', () => {
        queryClient.invalidateQueries(['bookings', user.id]);
        toast.success('A booking was created!');
      });

      socket.on('booking:updated', () => {
        queryClient.invalidateQueries(['bookings', user.id]);
        toast.info('Your booking was updated.');
      });

      socket.on('booking:cancelled', () => {
        queryClient.invalidateQueries(['bookings', user.id]);
        toast.warn('A booking was cancelled.');
      });

      socket.on('time-slot:updated', () => {
        queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
      });

      socket.on('waitlist:spot-available', ({ slotId }: { slotId: string }) => {
        queryClient.invalidateQueries(['waitlists', 'me']);
        toast.info(`A spot opened in waitlist for slot ${slotId}`);
      });

      socket.on('notification:new', (notification: Notification) => {
        queryClient.invalidateQueries(['notifications', 'me']);
        useNotificationStore.getState().addNotification(notification);
        toast.info(notification.message);
      });


      socket.on('system:announcement', (msg: string) => {
        toast.info(`📢 ${msg}`);
      });

      return () => {
        socket.disconnect();
        console.log('🔌 Disconnected WebSocket on cleanup');
      };
    }
  }, [isAuthenticated, token, user, queryClient]);
};
