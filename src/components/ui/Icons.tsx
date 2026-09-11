import type { CSSProperties } from 'react'
import {
    MapPin,
    Users,
    BarChart2,
    Pencil,
    Lightbulb,
    AlertTriangle,
    Clock,
    Phone,
    Mail,
    Footprints,
    Car,
    Heart,
    Check,
    Star,
    Droplet,
} from 'lucide-react'

type IconProps = {
    className?: string
}

const iconStyle: CSSProperties = {
    width: '1em',
    height: '1em',
    verticalAlign: '-0.15em',
    flexShrink: 0,
}

export function IconLocation({ className }: IconProps) {
    return <MapPin style={iconStyle} className={className} strokeWidth={2} />
}

export function IconUsers({ className }: IconProps) {
    return <Users style={iconStyle} className={className} strokeWidth={2} />
}

export function IconChart({ className }: IconProps) {
    return <BarChart2 style={iconStyle} className={className} strokeWidth={2} />
}

export function IconPencil({ className }: IconProps) {
    return <Pencil style={iconStyle} className={className} strokeWidth={2} />
}

export function IconBulb({ className }: IconProps) {
    return <Lightbulb style={iconStyle} className={className} strokeWidth={2} />
}

export function IconWarning({ className }: IconProps) {
    return <AlertTriangle style={iconStyle} className={className} strokeWidth={2} />
}

export function IconClock({ className }: IconProps) {
    return <Clock style={iconStyle} className={className} strokeWidth={2} />
}

export function IconPhone({ className }: IconProps) {
    return <Phone style={iconStyle} className={className} strokeWidth={2} />
}

export function IconMail({ className }: IconProps) {
    return <Mail style={iconStyle} className={className} strokeWidth={2} />
}

export function IconWalk({ className }: IconProps) {
    return <Footprints style={iconStyle} className={className} strokeWidth={2} />
}

export function IconCar({ className }: IconProps) {
    return <Car style={iconStyle} className={className} strokeWidth={2} />
}

export function IconHeart({ className, filled = true }: IconProps & { filled?: boolean }) {
    return (
        <Heart
            style={iconStyle}
            className={className}
            strokeWidth={2}
            fill={filled ? 'currentColor' : 'none'}
        />
    )
}

export function IconCheck({ className }: IconProps) {
    return <Check style={iconStyle} className={className} strokeWidth={2.5} />
}

export function IconStar({ className }: IconProps) {
    return <Star style={iconStyle} className={className} fill="currentColor" strokeWidth={0} />
}

export function IconDrop({ className }: IconProps) {
    return <Droplet style={iconStyle} className={className} fill="currentColor" strokeWidth={0} />
}