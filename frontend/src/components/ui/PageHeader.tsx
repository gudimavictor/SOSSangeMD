import type { ReactNode } from 'react'
import './PageHeader.css'

type PageHeaderProps = {
    icon: ReactNode
    eyebrow: string
    title: string
    subtitle: ReactNode
    className?: string
}

export function PageHeader({ icon, eyebrow, title, subtitle, className }: PageHeaderProps) {
    return (
        <div className={`pageHeader ${className ?? ''}`}>
            <span className="pageHeaderIcon">{icon}</span>
            <div className="pageHeaderText">
                <span className="pageHeaderEyebrow">{eyebrow}</span>
                <h1 className="pageHeaderTitle">{title}</h1>
                <p className="pageHeaderSubtitle">{subtitle}</p>
            </div>
        </div>
    )
}
