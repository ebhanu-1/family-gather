// Flat data model — no families, no share codes
// /members/{memberId}
// /events/{eventId}
// /events/{eventId}/todos/{todoId}
// /events/{eventId}/itinerary/{itemId}
// /events/{eventId}/messages/{messageId}

import { useEffect, useState } from 'react'
import {
  collection, doc, onSnapshot, query, orderBy,
  addDoc, updateDoc, deleteDoc, setDoc, serverTimestamp, getDocs,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Member, FamilyEvent, TodoItem, ItineraryItem, ChatMessage } from '../types'

// Backward compat: docs without familyId belong to 'default'
function matchesFamily<T extends { familyId?: string }>(item: T, familyId: string) {
  return item.familyId === familyId || (familyId === 'default' && !item.familyId)
}

// ── Members ───────────────────────────────────────────────────────────────────

export function useMembers(familyId: string) {
  const [members, setMembers] = useState<Member[]>([])
  useEffect(() => {
    return onSnapshot(
      query(collection(db, 'members'), orderBy('createdAt')),
      snap => setMembers(
        snap.docs.map(d => ({ id: d.id, ...d.data() } as Member))
          .filter(m => matchesFamily(m, familyId))
      )
    )
  }, [familyId])
  return members
}

export async function fetchMembers(familyId: string): Promise<Member[]> {
  const snap = await getDocs(query(collection(db, 'members'), orderBy('createdAt')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Member))
    .filter(m => matchesFamily(m, familyId))
}

export async function createMember(id: string, data: Omit<Member, 'id'>, familyId: string): Promise<void> {
  await setDoc(doc(db, 'members', id), { ...data, familyId, createdAt: serverTimestamp() })
}

// ── Events ────────────────────────────────────────────────────────────────────

export function useEvents(familyId: string) {
  const [events, setEvents] = useState<FamilyEvent[]>([])
  useEffect(() => {
    return onSnapshot(
      query(collection(db, 'events'), orderBy('date')),
      snap => setEvents(
        snap.docs.map(d => ({ ...d.data(), id: d.id } as FamilyEvent))
          .filter(e => matchesFamily(e, familyId))
      )
    )
  }, [familyId])
  return events
}

export async function createEvent(data: Omit<FamilyEvent, 'id'>, familyId: string): Promise<string> {
  const ref = await addDoc(collection(db, 'events'), { ...data, familyId, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateEvent(eventId: string, data: Partial<Omit<FamilyEvent, 'id'>>): Promise<void> {
  const clean: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) clean[k] = v
  }
  await setDoc(doc(db, 'events', eventId), clean, { merge: true })
}

export async function deleteEvent(eventId: string): Promise<void> {
  await deleteDoc(doc(db, 'events', eventId))
}

// ── Todos ─────────────────────────────────────────────────────────────────────

export function useTodos(eventId: string | null) {
  const [todos, setTodos] = useState<TodoItem[]>([])
  useEffect(() => {
    if (!eventId) return
    return onSnapshot(
      query(collection(db, 'events', eventId, 'todos'), orderBy('createdAt')),
      snap => setTodos(snap.docs.map(d => ({ id: d.id, ...d.data() } as TodoItem)))
    )
  }, [eventId])
  return todos
}

export async function addTodo(eventId: string, text: string, memberId: string): Promise<void> {
  await addDoc(collection(db, 'events', eventId, 'todos'), {
    text, done: false, createdBy: memberId, createdAt: serverTimestamp(),
  })
}

export async function toggleTodo(eventId: string, todoId: string, done: boolean): Promise<void> {
  await updateDoc(doc(db, 'events', eventId, 'todos', todoId), { done })
}

export async function updateTodo(eventId: string, todoId: string, text: string): Promise<void> {
  await updateDoc(doc(db, 'events', eventId, 'todos', todoId), { text })
}

export async function deleteTodo(eventId: string, todoId: string): Promise<void> {
  await deleteDoc(doc(db, 'events', eventId, 'todos', todoId))
}

// ── Itinerary ─────────────────────────────────────────────────────────────────

export function useItinerary(eventId: string | null) {
  const [items, setItems] = useState<ItineraryItem[]>([])
  useEffect(() => {
    if (!eventId) return
    return onSnapshot(
      query(collection(db, 'events', eventId, 'itinerary'), orderBy('date')),
      snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as ItineraryItem)))
    )
  }, [eventId])
  return items
}

export async function addItineraryItem(eventId: string, item: Omit<ItineraryItem, 'id'>): Promise<void> {
  await addDoc(collection(db, 'events', eventId, 'itinerary'), { ...item, createdAt: serverTimestamp() })
}

export async function updateItineraryItem(
  eventId: string,
  itemId: string,
  data: Partial<Omit<ItineraryItem, 'id'>>
): Promise<void> {
  const clean: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) clean[k] = v
  }
  await setDoc(doc(db, 'events', eventId, 'itinerary', itemId), clean, { merge: true })
}

export async function deleteItineraryItem(eventId: string, itemId: string): Promise<void> {
  await deleteDoc(doc(db, 'events', eventId, 'itinerary', itemId))
}

export function useAllItinerary(eventIds: string[]): Record<string, ItineraryItem[]> {
  const [allItems, setAllItems] = useState<Record<string, ItineraryItem[]>>({})

  useEffect(() => {
    if (eventIds.length === 0) return
    const unsubs = eventIds.map(eventId =>
      onSnapshot(
        query(collection(db, 'events', eventId, 'itinerary'), orderBy('date')),
        snap => {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as ItineraryItem))
          setAllItems(prev => ({ ...prev, [eventId]: items }))
        }
      )
    )
    return () => unsubs.forEach(u => u())
  }, [eventIds.join(',')])

  return allItems
}

// ── Messages ──────────────────────────────────────────────────────────────────

export function useMessages(eventId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  useEffect(() => {
    if (!eventId) return
    return onSnapshot(
      query(collection(db, 'events', eventId, 'messages'), orderBy('timestamp')),
      snap => setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)))
    )
  }, [eventId])
  return messages
}

export async function sendMessage(eventId: string, authorId: string, text: string): Promise<void> {
  await addDoc(collection(db, 'events', eventId, 'messages'), {
    authorId, text: text.trim(), timestamp: serverTimestamp(),
  })
}

// ── Group Chat (top-level /messages collection) ───────────────────────────────

export function useGroupMessages(familyId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  useEffect(() => {
    return onSnapshot(
      query(collection(db, 'messages'), orderBy('timestamp')),
      snap => setMessages(
        snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage))
          .filter(m => matchesFamily(m, familyId))
      )
    )
  }, [familyId])
  return messages
}

export async function sendGroupMessage(authorId: string, text: string, familyId: string): Promise<void> {
  await addDoc(collection(db, 'messages'), {
    authorId, text: text.trim(), timestamp: serverTimestamp(), familyId,
  })
}

// ── Last messages for chat list ───────────────────────────────────────────────

export function useLastMessages(eventIds: string[]) {
  const [lastMsgs, setLastMsgs] = useState<Record<string, ChatMessage>>({})
  useEffect(() => {
    if (eventIds.length === 0) return
    const unsubs = eventIds.map(eventId =>
      onSnapshot(
        query(collection(db, 'events', eventId, 'messages'), orderBy('timestamp')),
        snap => {
          const docs = snap.docs
          if (docs.length > 0) {
            const last = docs[docs.length - 1]
            setLastMsgs(prev => ({ ...prev, [eventId]: { id: last.id, ...last.data() } as ChatMessage }))
          }
        }
      )
    )
    return () => unsubs.forEach(u => u())
  }, [eventIds.join(',')])
  return lastMsgs
}
