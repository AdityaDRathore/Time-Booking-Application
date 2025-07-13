import api from '../../services/apiClient';
import { Waitlist } from '../../types/waitlist';

/**
 * Fetch waitlist entries for a specific lab
 */
export async function getWaitlistByLabId(labId: string): Promise<Waitlist[]> {
  const response = await api.get(`/admin/labs/${labId}/waitlist`);
  return response.data.data;
}

/**
 * Remove a waitlist entry by its ID
 */
export async function removeWaitlistEntry(waitlistId: string): Promise<void> {
  await api.delete(`/admin/waitlists/${waitlistId}`);
}

/**
 * Promote the first user in the waitlist for a given slot ID
 */
export async function promoteWaitlistEntry(slotId: string): Promise<void> {
  await api.post(`/admin/waitlists/${slotId}/promote`);
}
