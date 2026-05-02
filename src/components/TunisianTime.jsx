import { useEffect, useState } from 'react'

export default function TunisianTime() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const tunisianTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Tunis' }))
      const hours = String(tunisianTime.getHours()).padStart(2, '0')
      const minutes = String(tunisianTime.getMinutes()).padStart(2, '0')
      const seconds = String(tunisianTime.getSeconds()).padStart(2, '0')
      setTime(`${hours}:${minutes}:${seconds}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <span className="w-1 h-1 rounded-full bg-gold animate-pulse" />
      <span className="text-[9px] tracking-[0.3em] uppercase text-on-surface-variant font-medium">Tunis</span>
      <span className="font-mono text-[11px] font-light text-on-surface tabular-nums tracking-wider">{time || '--:--:--'}</span>
    </div>
  )
}
