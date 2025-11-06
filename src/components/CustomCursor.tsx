import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const CustomCursor = () => {
  const isMobile = useIsMobile();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    // Don't add event listeners on mobile
    if (isMobile) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      // Check if the target or any parent is clickable
      const target = e.target as HTMLElement;
      const isClickable = !!(
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('.cursor-pointer')
      );
      
      setIsPointer(isClickable);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  // Don't render custom cursor on mobile devices
  if (isMobile) {
    return null;
  }

  return (
    <div
      className="custom-cursor"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -50%) scale(${isPointer ? 1.5 : 1})`,
        borderColor: isPointer ? 'hsl(var(--foreground) / 0.8)' : 'hsl(var(--foreground) / 0.4)',
        borderWidth: isPointer ? '2px' : '1px',
      }}
    />
  );
};

export default CustomCursor;

