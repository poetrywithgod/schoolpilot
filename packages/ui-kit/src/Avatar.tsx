interface AvatarProps {
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
}

export const Avatar = ({ src, name, size = 'md' }: AvatarProps) => {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
  }

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover`}
      />
    )
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold`}>
      {initials}
    </div>
  )
}