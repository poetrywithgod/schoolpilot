// apps/super-admin/src/components/ui/Select.tsx

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const openDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setCoords({ top: rect.bottom + 6, left: rect.left, width: rect.width })
    }
    setIsOpen((prev) => !prev)
  }

  const selected = options.find((o) => o.value === value)

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={openDropdown}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-white outline-none border capitalize disabled:opacity-60 transition-colors"
        style={{
          backgroundColor: '#081f19',
          borderColor: isOpen ? '#FFBA00' : 'rgba(109,151,115,0.2)',
          fontFamily: 'Lora, serif',
        }}
      >
        <span className="truncate">{selected?.label ?? 'Select...'}</span>
        <ChevronDown
          size={16}
          style={{
            color: '#6D9773',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
            flexShrink: 0,
            marginLeft: 6,
          }}
        />
      </button>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] rounded-xl border overflow-hidden shadow-lg"
          style={{
            top: coords.top,
            left: coords.left,
            width: coords.width,
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
        </div>,
        document.body
      )}
    </div>
  )
}
