import type { Member } from '../types'

interface Props {
  member: Member
  size?: number
  style?: React.CSSProperties
}

export function Avatar({ member, size = 32, style }: Props) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: member.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 700, color: 'white',
      letterSpacing: '-0.3px', flexShrink: 0, userSelect: 'none',
      ...style,
    }}>
      {member.initials}
    </div>
  )
}

interface AvatarGroupProps {
  memberIds: string[]
  members: Member[]
  size?: number
}

export function AvatarGroup({ memberIds, members, size = 22 }: AvatarGroupProps) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {memberIds.map(id => {
        const m = members.find(m => m.id === id)
        if (!m) return null
        return <Avatar key={id} member={m} size={size} />
      })}
    </div>
  )
}
