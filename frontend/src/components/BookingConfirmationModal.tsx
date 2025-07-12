import React from 'react';
import { TimeSlot } from '../types/timeSlot';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: TimeSlot | null;
  onConfirm: () => void;
}

const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  onClose,
  slot,
  onConfirm,
}) => {
  if (!isOpen || !slot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Confirm Booking</h2>
        <div className="mb-4">
          <p><strong>Date:</strong> {slot.date}</p>
          <p><strong>Time:</strong> {slot.startTime} – {slot.endTime}</p>
          <p><strong>Status:</strong> {slot.isBooked ? 'Already Booked' : 'Available'}</p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationModal;
