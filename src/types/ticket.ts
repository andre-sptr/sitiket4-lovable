export type UserRole = 'admin' | 'guest' | 'hd';

export type TicketStatus = 
  | 'OPEN' 
  | 'ASSIGNED'
  | 'ONPROGRESS' 
  | 'TEMPORARY' 
  | 'WAITING_MATERIAL' 
  | 'WAITING_ACCESS' 
  | 'WAITING_COORDINATION' 
  | 'CLOSED';

export type TTRCompliance = 'COMPLY' | 'NOT COMPLY';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  area?: string;
  isActive: boolean;
}

export interface ProgressUpdate {
  id: string;
  ticketId: string;
  timestamp: Date;
  source: 'HD' | 'ADMIN' | 'SYSTEM';
  message: string;
  statusAfterUpdate?: TicketStatus;
  locationUpdate?: { lat: number; lon: number };
  attachments?: string[];
  createdBy: string;
}

export interface Ticket {
  id: string;
  provider: string;
  incNumbers: string[];
  siteCode: string;
  siteName: string;
  networkElement?: string;
  kategori: string;
  lokasiText: string;
  latitude?: number;
  longitude?: number;
  jarakKmRange?: string;
  ttrCompliance: TTRCompliance;
  jamOpen: Date;
  ttrTargetHours: number;
  maxJamClose: Date;
  ttrRealHours?: number;
  sisaTtrHours: number;
  status: TicketStatus;
  isPermanent: boolean;
  permanentNotes?: string;
  penyebab?: string;
  segmen?: string;
  incGamas?: string;
  kjd?: string;
  teknisiList?: string[];
  assignedTo?: string;
  assignedAt?: Date;
  assignedBy?: string;
  createdByAdmin: string;
  createdAt: Date;
  updatedAt: Date;
  rawTicketText?: string;
  progressUpdates: ProgressUpdate[];
  adminNotes?: string;
}

export interface DashboardStats {
  totalToday: number;
  openTickets: number;
  overdueTickets: number;
  closedToday: number;
  pendingTickets: number;
  complianceRate: number;
}

export interface Notification {
  id: string;
  type: 'assignment' | 'reminder' | 'overdue' | 'escalation';
  title: string;
  message: string;
  ticketId?: string;
  createdAt: Date;
  isRead: boolean;
  userId: string;
}
