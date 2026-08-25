export interface UserSessionsResponse{
  id: string
  status: string | null
  country: string | null
  ipAddress: string | null
  userAgent: string
  expiresAt: Date
  createdAt: Date
  isCurrent: Boolean | null
  browserIcon: string
}
