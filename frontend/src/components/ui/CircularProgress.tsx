import { motion } from 'motion/react'
import './CircularProgress.css'

type CircularProgressProps = {
    percent: number
    size?: number
    strokeWidth?: number
    color?: string
    trackColor?: string
    label?: string
}

export function CircularProgress({
    percent,
    size = 128,
    strokeWidth = 10,
    color = 'var(--color-primary)',
    trackColor = 'var(--color-border)',
    label,
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const clamped = Math.min(100, Math.max(0, percent))
    const offset = circumference - (clamped / 100) * circumference
    const center = size / 2

    return (
        <div className="circularProgress" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={center} cy={center} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
                <motion.circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    transform={`rotate(-90 ${center} ${center})`}
                    className="circularProgressArc"
                />
            </svg>
            <div className="circularProgressCenter">
                <span className="circularProgressValue">{Math.round(clamped)}%</span>
                {label && <span className="circularProgressLabel">{label}</span>}
            </div>
        </div>
    )
}
