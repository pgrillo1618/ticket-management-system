export type UserRole = 'admin' | 'supervisor' | 'agent'

export type TicketStatus = 'open' | 'resolved' | 'closed'

export type TicketCategory = 'question' | 'technical question' | 'refund request'

export type TicketPriority = 'low' | 'medium' | 'high'

export type MessageDirection = 'inbound' | 'outbound'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  active: boolean
  createdAt: string
}

export interface Ticket {
  id: string
  subject: string
  senderEmail: string
  senderName: string
  status: TicketStatus
  category: TicketCategory | null
  priority: TicketPriority | null
  assigneeId: string | null
  assignee: User | null
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  ticketId: string
  body: string
  direction: MessageDirection
  senderEmail: string
  createdAt: string
}

export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  error: string
  message: string
}
