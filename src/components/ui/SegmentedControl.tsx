import './SegmentedControl.css'

interface SegmentedOption {
  id: string
  label: string
}

interface SegmentedControlProps {
  options: SegmentedOption[]
  value: string
  onChange: (id: string) => void
  'aria-label': string
}

export function SegmentedControl({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
}: SegmentedControlProps) {
  return (
    <div className="segmented" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`segmented-item ${value === option.id ? 'segmented-item--active' : ''}`}
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
