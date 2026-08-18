'use client'
import { useRef, useState, useCallback } from 'react'

export function useDragToDismiss(onDismiss: () => void, threshold = 120) {
  const startY = useRef(0)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    setDragging(true)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const delta = e.touches[0].clientY - startY.current
    if (delta > 0) setDragY(delta)
  }, [])

  const onTouchEnd = useCallback(() => {
    setDragging(false)
    if (dragY >= threshold) {
      setDragY(0)
      onDismiss()
    } else {
      setDragY(0)
    }
  }, [dragY, threshold, onDismiss])

  // Inline style for the sheet: overrides CSS transform during drag
  const dragStyle = dragging || dragY > 0
    ? { transform: `translateY(${dragY}px)`, transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.4,0,0.2,1)' }
    : undefined

  return { onTouchStart, onTouchMove, onTouchEnd, dragStyle }
}
