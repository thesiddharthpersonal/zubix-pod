import { useRef, useState, useEffect, TouchEvent, MouseEvent } from 'react';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // minimum distance in pixels for a swipe
}

export const useSwipe = (config: SwipeConfig) => {
  const { onSwipeLeft, onSwipeRight, threshold = 50 } = config;
  
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  
  const [swipeOffset, setSwipeOffset] = useState<number>(0);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging.current) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = Math.abs(currentY - touchStartY.current);
    
    // Only track horizontal swipes (vertical scrolling should still work)
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
      e.preventDefault();
      // Limit swipe offset to reasonable amount
      const limitedOffset = Math.max(-100, Math.min(100, deltaX));
      setSwipeOffset(limitedOffset);
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!isDragging.current) return;
    
    touchEndX.current = e.changedTouches[0].clientX;
    touchEndY.current = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = Math.abs(touchEndY.current - touchStartY.current);
    
    isDragging.current = false;
    setSwipeOffset(0);
    
    // Only register as swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > deltaY) {
      if (deltaX > threshold && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < -threshold && onSwipeLeft) {
        onSwipeLeft();
      }
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    isDragging.current = true;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    
    const deltaX = e.clientX - touchStartX.current;
    const deltaY = Math.abs(e.clientY - touchStartY.current);
    
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
      const limitedOffset = Math.max(-100, Math.min(100, deltaX));
      setSwipeOffset(limitedOffset);
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging.current) return;
    
    touchEndX.current = e.clientX;
    touchEndY.current = e.clientY;
    
    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = Math.abs(touchEndY.current - touchStartY.current);
    
    isDragging.current = false;
    setSwipeOffset(0);
    
    if (Math.abs(deltaX) > deltaY) {
      if (deltaX > threshold && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < -threshold && onSwipeLeft) {
        onSwipeLeft();
      }
    }
  };

  useEffect(() => {
    const handleMouseUpGlobal = () => {
      isDragging.current = false;
      setSwipeOffset(0);
    };
    
    document.addEventListener('mouseup', handleMouseUpGlobal);
    return () => document.removeEventListener('mouseup', handleMouseUpGlobal);
  }, []);

  return {
    swipeOffset,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
    },
  };
};
