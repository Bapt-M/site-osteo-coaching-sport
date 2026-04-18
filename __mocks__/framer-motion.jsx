import React from 'react'

const tags = ['div','section','nav','header','footer','span','p','h1','h2','h3','h4','ul','li','a','button','img','video']

export const motion = Object.fromEntries(
  tags.map(tag => [tag, React.forwardRef(({ children, ...props }, ref) => {
    const { initial, animate, exit, whileInView, whileHover, whileTap, variants,
            transition, viewport, layout, layoutId, onAnimationComplete, ...rest } = props
    return React.createElement(tag, { ...rest, ref }, children)
  })])
)

export const AnimatePresence = ({ children }) => <>{children}</>
export const useScroll = () => ({ scrollY: { get: () => 0 }, scrollYProgress: { get: () => 0 } })
export const useTransform = (_, __, output) => Array.isArray(output) ? output[0] : 0
export const useMotionValue = (v) => ({ get: () => v, set: () => {}, onChange: () => () => {} })
export const useSpring = (v) => v
export const useInView = () => [null, false]
export const useAnimation = () => ({ start: () => {}, set: () => {} })
