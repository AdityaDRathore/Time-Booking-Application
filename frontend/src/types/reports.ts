export interface LabUsageReport {
  labId: string;
  labName: string;
  totalBookings: number;
  totalHours: number;
}

export interface UserActivityReport {
  userId: string;
  userName: string;
  bookingsCount: number;
  lastActive: string; // ISO date
}
