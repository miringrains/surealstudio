export interface Premiere {
  id: string
  title: string
  description: string | null
  mux_playback_id: string
  mux_asset_id: string | null
  thumbnail_url: string | null
  scheduled_at: string
  is_live: boolean
  created_at: string
}

export interface Attendee {
  id: string
  email: string
  premiere_id: string
  joined_at: string
}

export interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  isLive: boolean
}
