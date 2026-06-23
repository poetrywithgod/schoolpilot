interface InputProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

export const Input = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  disabled = false,
  required = false,
  className = '',
}: InputProps) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors
          ${error ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}
          ${disabled ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-900'}
          ${className}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}