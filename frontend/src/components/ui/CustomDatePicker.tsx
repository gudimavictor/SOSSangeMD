import { useEffect, useRef, useState } from 'react'
import './CustomDatePicker.css'

type CustomDatePickerProps = {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    maxDate?: string
}

const zileSaptamana = ['lu.', 'ma.', 'mi.', 'joi', 'vi.', 'sâ.', 'du.']

const luni = [
    'ianuarie',
    'februarie',
    'martie',
    'aprilie',
    'mai',
    'iunie',
    'iulie',
    'august',
    'septembrie',
    'octombrie',
    'noiembrie',
    'decembrie',
]

function toISO(d: Date) {
    const an = d.getFullYear()
    const luna = String(d.getMonth() + 1).padStart(2, '0')
    const zi = String(d.getDate()).padStart(2, '0')
    return `${an}-${luna}-${zi}`
}

function parseISO(value: string) {
    if (!value) return null
    const [an, luna, zi] = value.split('-').map(Number)
    return new Date(an, luna - 1, zi)
}

function formateazaAfisare(value: string) {
    const d = parseISO(value)
    if (!d) return ''
    return d.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function genereazaZile(anCurent: number, lunaCurenta: number) {
    const primaZi = new Date(anCurent, lunaCurenta, 1)
    const ultimaZi = new Date(anCurent, lunaCurenta + 1, 0)

    const offsetStart = (primaZi.getDay() + 6) % 7

    const zile: { data: Date; inLuna: boolean }[] = []

    for (let i = offsetStart; i > 0; i--) {
        zile.push({ data: new Date(anCurent, lunaCurenta, 1 - i), inLuna: false })
    }
    for (let zi = 1; zi <= ultimaZi.getDate(); zi++) {
        zile.push({ data: new Date(anCurent, lunaCurenta, zi), inLuna: true })
    }
    while (zile.length % 7 !== 0) {
        const ultima = zile[zile.length - 1].data
        zile.push({ data: new Date(ultima.getFullYear(), ultima.getMonth(), ultima.getDate() + 1), inLuna: false })
    }

    return zile
}

export function CustomDatePicker({ value, onChange, placeholder, maxDate }: CustomDatePickerProps) {
    const [deschis, setDeschis] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const selectata = parseISO(value)
    const azi = new Date()
    const [vizualizare, setVizualizare] = useState(() => selectata ?? azi)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setDeschis(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const maxD = maxDate ? parseISO(maxDate) : null

    function schimbaLuna(delta: number) {
        setVizualizare((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
    }

    function selecteazaZi(d: Date) {
        if (maxD && d > maxD) return
        onChange(toISO(d))
        setDeschis(false)
    }

    const zile = genereazaZile(vizualizare.getFullYear(), vizualizare.getMonth())

    return (
        <div className="customDatePicker" ref={containerRef}>
            <button
                type="button"
                className="customDatePickerButton"
                onClick={() => setDeschis((prev) => !prev)}
            >
                <span className={value ? '' : 'customDatePickerPlaceholder'}>
                    {value ? formateazaAfisare(value) : placeholder || 'Selectează data'}
                </span>
                <span className={`customDatePickerArrow ${deschis ? 'customDatePickerArrowOpen' : ''}`}>▼</span>
            </button>

            {deschis && (
                <div className="customDatePickerDropdown">
                    <div className="customDatePickerHeader">
                        <span className="customDatePickerMonth">
                            {luni[vizualizare.getMonth()]} {vizualizare.getFullYear()}
                        </span>
                        <div className="customDatePickerNav">
                            <button type="button" onClick={() => schimbaLuna(-1)} aria-label="Luna anterioară">
                                ‹
                            </button>
                            <button type="button" onClick={() => schimbaLuna(1)} aria-label="Luna următoare">
                                ›
                            </button>
                        </div>
                    </div>

                    <div className="customDatePickerWeekdays">
                        {zileSaptamana.map((zi) => (
                            <span key={zi}>{zi}</span>
                        ))}
                    </div>

                    <div className="customDatePickerGrid">
                        {zile.map(({ data, inLuna }) => {
                            const esteSelectata = selectata && toISO(data) === toISO(selectata)
                            const esteAzi = toISO(data) === toISO(azi)
                            const disabled = Boolean(maxD && data > maxD)

                            return (
                                <button
                                    type="button"
                                    key={toISO(data)}
                                    className={[
                                        'customDatePickerDay',
                                        !inLuna ? 'customDatePickerDayMuted' : '',
                                        esteSelectata ? 'customDatePickerDaySelected' : '',
                                        esteAzi && !esteSelectata ? 'customDatePickerDayToday' : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    disabled={disabled}
                                    onClick={() => selecteazaZi(data)}
                                >
                                    {data.getDate()}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}