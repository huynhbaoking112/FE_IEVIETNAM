export const API_ENDPOINTS = {
  AUTH: {
    OWNER: {
      GENERATE_CODE: '/auth/owner/generate-code',
      VALIDATE_CODE: '/auth/owner/validate-code',
      LOGOUT: '/auth/owner/logout',
    },
    EMPLOYEE: {
      GENERATE_CODE: '/auth/employee/generate-code',
      VALIDATE_CODE: '/auth/employee/validate-code', 
      LOGOUT: '/auth/employee/logout',
    },
  },

  EMPLOYEES: {
    BASE: '/employees',
    BY_ID: (id: string) => `/employees/${id}`,
    OWNER_INFO: '/employees/owner-info',
  },

  TASKS: {
    BASE: '/tasks',
    BY_ID: (id: string) => `/tasks/${id}`,
    STATS: '/tasks/stats',
  },

  CHAT: {
    HISTORY: (userId: string) => `/chat/history/${userId}`,
    CONVERSATIONS: '/chat/conversations',
    MARK_READ: (userId: string) => `/chat/mark-read/${userId}`,
    UNREAD_COUNT: '/chat/unread-count',
  },

  PROFILE: {
    ME: '/profile/me',
  },
} as const;

export const SOCKET_EVENTS = {
  CONNECTION_CONFIRMED: 'connection_confirmed',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',

  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  JOINED_ROOM: 'joined_room',
  LEFT_ROOM: 'left_room',

  PRIVATE_MESSAGE: 'private_message',
  NEW_MESSAGE: 'new_message',
  MESSAGE_SENT: 'message_sent',
  MESSAGE_ERROR: 'message_error',
  MESSAGE_READ: 'message_read',
  MESSAGE_READ_CONFIRMATION: 'message_read_confirmation',

  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  USER_TYPING: 'user_typing',
  USER_STOPPED_TYPING: 'user_stopped_typing',

  PING: 'ping',
  PONG: 'pong',
} as const; 