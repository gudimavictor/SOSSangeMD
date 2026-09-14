import { useEffect, useRef, useState } from 'react'
import './CustomSelect.css'

type CustomSelectProps = {
    options: string[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    labels?: Record<string, string>
}

export function CustomSelect({ options, value, onChange, placeholder, labels }: CustomSelectProps) {
    const [deschis, setDeschis] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setDeschis(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    function selecteaza(optiune: string) {
        onChange(optiune)
        setDeschis(false)
    }

    function afiseaza(optiune: string) {
        return labels?.[optiune] ?? optiune
    }

    return (
        <div className="customSelect" ref={containerRef}>
            <button
                type="button"
                className="customSelectButton"
                onClick={() => setDeschis((prev) => !prev)}
            >
                <span>{value ? afiseaza(value) : placeholder || 'Selectează'}</span>
                <span className={`customSelectArrow ${deschis ? 'customSelectArrowOpen' : ''}`}>▼</span>
            </button>

            {deschis && (
                <div className="customSelectDropdown">
                    {options.map((optiune) => (
                        <div
                            key={optiune}
                            className={`customSelectOption ${optiune === value ? 'customSelectOptionSelected' : ''}`}
                            onClick={() => selecteaza(optiune)}
                        >
                            {afiseaza(optiune)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}