import { useRef, useEffect, useState } from 'react'
import { C } from '../tokens'
import { Avatar } from '../components/Avatar'
import { IconSend } from '../components/Icons'
import type { ChatMessage, Member } from '../types'

interface Props {
  messages: ChatMessage[]
  members: Member[]
  memberId: string
  onSend: (text: string) => void
}

export function GroupChatScreen({ messages, members, memberId, onSend }: Props) {
  const [text, setText] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages.length])

  function handleSend() {
    if (!text.trim()) return
    onSend(text.trim()); setText('')
  }

  function dayLabel(msg: ChatMessage): string | null {
    if (!msg.timestamp) return null
    const d = msg.timestamp.toDate()
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1)
    const isYesterday = d.toDateString() === yesterday.toDateString()
    if (isToday) return 'Today'
    if (isYesterday) return 'Yesterday'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '16px 16px 12px',
        borderBottom: `1px solid ${C.border}`,
        background: C.card,
        flexShrink: 0,
      }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: C.text }}>
          Group Chat 💬
        </div>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {members.map(m => <Avatar key={m.id} member={m} size={22} />)}
          </div>
          <span style={{ fontSize: 12, color: C.textLight }}>{members.length} members</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', background: C.cream }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: C.textLight, fontSize: 13, paddingTop: 60 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>👋</div>
            <div>Start the conversation!</div>
            <div style={{ marginTop: 4, fontSize: 12 }}>This is the shared chat for your group.</div>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.authorId === memberId
          const author = members.find(m => m.id === msg.authorId)
          const day = dayLabel(msg)
          const prevDay = i > 0 ? dayLabel(messages[i - 1]) : null
          const showDay = day && day !== prevDay
          const showAvatar = !isMe && (i === messages.length - 1 || messages[i + 1]?.authorId !== msg.authorId)
          const isFirst = i === 0 || messages[i - 1].authorId !== msg.authorId
          return (
            <div key={msg.id}>
              {showDay && (
                <div style={{ textAlign: 'center', fontSize: 11, color: C.textLight, margin: '12px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                  {day}
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                </div>
              )}
              <div style={{
                display: 'flex',
                flexDirection: isMe ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: 8,
                marginBottom: 3,
                marginTop: isFirst ? 8 : 0,
              }}>
                {/* Avatar placeholder always takes space on the other side */}
                <div style={{ width: 28, flexShrink: 0 }}>
                  {!isMe && showAvatar && author && <Avatar member={author} size={28} />}
                </div>
                <div style={{ maxWidth: '74%' }}>
                  {isFirst && (
                    <div style={{
                      fontSize: 10, color: C.textLight, marginBottom: 3,
                      textAlign: isMe ? 'right' : 'left',
                      paddingLeft: isMe ? 0 : 2, paddingRight: isMe ? 2 : 0,
                    }}>
                      {isMe ? 'You' : author?.name}
                    </div>
                  )}
                  <div style={{
                    padding: '9px 13px',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isMe ? C.sage : C.card,
                    color: isMe ? 'white' : C.text,
                    fontSize: 14, lineHeight: 1.5,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
                  }}>
                    {msg.text}
                  </div>
                  {msg.timestamp && (
                    <div style={{
                      fontSize: 10, color: C.textLight, marginTop: 2,
                      textAlign: isMe ? 'right' : 'left',
                      paddingLeft: isMe ? 0 : 2,
                    }}>
                      {msg.timestamp.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 12px',
        borderTop: `1px solid ${C.border}`,
        background: C.card,
        display: 'flex', gap: 8, alignItems: 'center',
        flexShrink: 0,
      }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          onFocus={() => setTimeout(() => {
            if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
          }, 350)}
          placeholder="Message everyone…"
          style={{
            flex: 1, minWidth: 0, padding: '10px 16px', borderRadius: 24,
            border: `1.5px solid ${C.border}`, outline: 'none',
            fontSize: 14, background: C.cream, color: C.text,
          }}
        />
        <button onClick={handleSend} style={{
          width: 38, height: 38, borderRadius: '50%',
          background: text.trim() ? C.sage : C.border,
          border: 'none', cursor: text.trim() ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'background 0.15s',
          boxShadow: text.trim() ? '0 2px 12px rgba(50,100,60,0.25)' : 'none',
        }}>
          <IconSend />
        </button>
      </div>
    </div>
  )
}
