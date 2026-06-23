export interface School {
  id: string
  name: string
  slug: string
  logo_url: string | null
  address: string | null
  phone: string | null
  email: string | null
  stamp_url: string | null
  is_active: boolean
  subscription_tier: 'starter' | 'growth'
  subscription_expires_at: string
  created_at: string
}