/**
 * Permission constants for the Time-Booking Application
 *
 * Format: [RESOURCE]:[ACTION]
 * This provides a granular and consistent permission structure
 */

// User permissions
export const USER_PERMISSIONS = {
  // Self management
  READ_SELF: 'users:read_self',
  UPDATE_SELF: 'users:update_self',
  DELETE_SELF: 'users:delete_self',

  // Organization access
  READ_ORGANIZATION: 'organizations:read',

  // Lab access
  READ_LABS: 'labs:read',

  // Time slot access
  READ_TIME_SLOTS: 'time_slots:read',

  // Booking permissions
  CREATE_BOOKING: 'bookings:create',
  READ_OWN_BOOKINGS: 'bookings:read_own',
  UPDATE_OWN_BOOKING: 'bookings:update_own',
  CANCEL_OWN_BOOKING: 'bookings:cancel_own',

  // Waitlist permissions
  JOIN_WAITLIST: 'waitlists:join',
  LEAVE_WAITLIST: 'waitlists:leave',
  READ_OWN_WAITLIST: 'waitlists:read_own',

  // Notification permissions
  READ_OWN_NOTIFICATIONS: 'notifications:read_own',
  UPDATE_OWN_NOTIFICATION: 'notifications:update_own',
};

// Admin permissions
export const ADMIN_PERMISSIONS = {
  // User management
  READ_USERS: 'users:read',
  UPDATE_USERS: 'users:update',
  DELETE_USERS: 'users:delete',
  RESET_USER_PASSWORD: 'users:reset_password',

  // Organization management
  READ_ORGANIZATION_DETAILS: 'organizations:read_details',

  // Lab management
  CREATE_LAB: 'labs:create',
  UPDATE_LAB: 'labs:update',
  DELETE_LAB: 'labs:delete',

  // Time slot management
  CREATE_TIME_SLOT: 'time_slots:create',
  UPDATE_TIME_SLOT: 'time_slots:update',
  DELETE_TIME_SLOT: 'time_slots:delete',

  // Booking management
  READ_ALL_BOOKINGS: 'bookings:read_all',
  UPDATE_ANY_BOOKING: 'bookings:update_any',
  CANCEL_ANY_BOOKING: 'bookings:cancel_any',

  // Waitlist management
  READ_WAITLISTS: 'waitlists:read_all',
  MANAGE_WAITLISTS: 'waitlists:manage',

  // Reporting
  VIEW_LAB_REPORTS: 'reports:view_lab',

  // Notification management
  SEND_NOTIFICATIONS: 'notifications:send',
};

// Super Admin permissions
export const SUPER_ADMIN_PERMISSIONS = {
  // Organization management
  CREATE_ORGANIZATION: 'organizations:create',
  UPDATE_ORGANIZATION: 'organizations:update',
  DELETE_ORGANIZATION: 'organizations:delete',

  // Admin management
  CREATE_ADMIN: 'admins:create',
  READ_ADMINS: 'admins:read',
  UPDATE_ADMIN: 'admins:update',
  DELETE_ADMIN: 'admins:delete',

  // System-wide permissions
  SYSTEM_CONFIGURATION: 'system:configure',
  VIEW_SYSTEM_REPORTS: 'reports:view_system',
  SEND_SYSTEM_ANNOUNCEMENTS: 'announcements:send',
};

// Combine all permissions for easier reference
export const ALL_PERMISSIONS = {
  ...USER_PERMISSIONS,
  ...ADMIN_PERMISSIONS,
  ...SUPER_ADMIN_PERMISSIONS,
};

// Export types for TypeScript
export type Permission = (typeof ALL_PERMISSIONS)[keyof typeof ALL_PERMISSIONS];
export type UserPermission = (typeof USER_PERMISSIONS)[keyof typeof USER_PERMISSIONS];
export type AdminPermission = (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];
export type SuperAdminPermission =
  (typeof SUPER_ADMIN_PERMISSIONS)[keyof typeof SUPER_ADMIN_PERMISSIONS];
