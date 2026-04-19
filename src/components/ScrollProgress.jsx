import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.3,
    restDelta: 0.0008,
  })
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left pointer-events-none"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, rgba(200,169,106,0) 0%, #C8A96A 45%, #E8D4A8 55%, rgba(200,169,106,0) 100%)',
      }}
    />
  )
}
