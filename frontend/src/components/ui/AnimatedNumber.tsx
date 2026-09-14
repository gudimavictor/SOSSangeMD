import { useEffect, useState } from 'react'
import { useMotionValue, useTransform, animate } from 'motion/react'

type AnimatedNumberProps = {
    value: number
    duration?: number
}

export function AnimatedNumber({ value, duration = 1 }: AnimatedNumberProps) {
    const motionVal = useMotionValue(0)
    const rounded = useTransform(motionVal, (latest) => Math.round(latest))
    const [display, setDisplay] = useState(0)

    useEffect(() => {
        const controls = animate(motionVal, value, { duration, ease: 'easeOut' })
        const unsubscribe = rounded.on('change', (v) => setDisplay(v))
        return () => {
            controls.stop()
            unsubscribe()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    return <>{display}</>
}