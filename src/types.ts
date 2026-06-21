import { Timestamp } from 'firebase/firestore'

export interface Member {
  id: string
  name: string
  initials: string
  color: string
  familyId?: string
  createdAt?: Timestamp
}

export interface FamilyEvent {
  id: string
  name: string
  type: 'holiday' | 'vacation' | 'birthday' | 'other'
  emoji: string
  date: string        // YYYY-MM-DD
  endDate?: string
  time?: string
  location: string
  description: string
  attendees: string[] // member IDs
  createdBy: string
  familyId?: string
  createdAt?: Timestamp
}

export interface TodoItem {
  id: string
  text: string
  done: boolean
  createdBy: string
  createdAt?: Timestamp
}

export interface ItineraryItem {
  id: string
  date: string
  time: string
  endTime?: string
  title: string
  createdBy: string
  createdAt?: Timestamp
}

export interface ChatMessage {
  id: string
  authorId: string
  text: string
  familyId?: string
  timestamp: Timestamp | null
}

// Just a memberId stored in localStorage — no family, no share codes
export interface Identity {
  memberId: string
}

export type Screen = 'home' | 'calendar' | 'chat' | 'event' | 'create'
export type EventTab = 'details' | 'plan' | 'todo'
