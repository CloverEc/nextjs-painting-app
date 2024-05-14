import { useEffect, useRef, useState } from 'react';

interface Draw {
  ctx: CanvasRenderingContext2D;
  currentPoint: { x: number; y: number };
  prevPoint: { x: number; y: number } | null;
}

export const useDraw = (onDraw: ({ ctx, currentPoint, prevPoint }: Draw) => void) => {
  const [mouseDown, setMouseDown] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!mouseDown) return;

      const currentPoint = { x: e.clientX, y: e.clientY };
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      const prevPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      onDraw({ ctx, currentPoint, prevPoint });
    };

    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [mouseDown, onDraw]);

  return {
    canvasRef,
    onMouseDown: () => setMouseDown(true),
    onMouseUp: () => setMouseDown(false),
  };
};

