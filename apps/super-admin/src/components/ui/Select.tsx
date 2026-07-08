// apps/super-admin/src/components/ui/Select.tsx

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  disabled?: boolean
}

export const Select = ({ value, onChange, options, disabled }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border capitalize disabled:opacity-60 transition-colors"
        style={{
          backgroundColor: '#081f19',
          borderColor: isOpen ? '#FFBA00' : 'rgba(109,151,115,0.2)',
          fontFamily: 'Lora, serif',
        }}
      >
        <span>{selected?.label ?? 'Select...'}</span>
        <ChevronDown
          size={16}
          style={{
            color: '#6D9773',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
          }}
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1.5 rounded-xl border overflow-hidden shadow-lg"
          style={{
            backgroundColor: '#0C3B2E',
            borderColor: 'rgba(109,151,115,0.25)',
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-left capitalize transition-colors hover:bg-white/5"
                style={{
                  color: isSelected ? '#FFBA00' : '#F5F5F0',
                  fontFamily: 'Lora, serif',
                  backgroundColor: isSelected ? 'rgba(255,186,0,0.08)' : 'transparent',
                }}
              >
                <span>{option.label}</span>
                {isSelected && <Check size={14} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
