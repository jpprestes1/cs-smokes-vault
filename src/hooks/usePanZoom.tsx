import { useState, useRef } from 'react';

export function usePanZoom(setCoords?: (coords: { x: number; y: number }) => void) {
  const [zoom, setZoom] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoom((prev) => Math.min(prev + 0.25, 1.5));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoom((prev) => Math.max(prev - 0.25, 1));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setDragStart({
      x: e.pageX - scrollRef.current.offsetLeft,
      y: e.pageY - scrollRef.current.offsetTop,
    });
    setScrollPos({
      left: scrollRef.current.scrollLeft,
      top: scrollRef.current.scrollTop,
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const y = e.pageY - scrollRef.current.offsetTop;
    const walkX = x - dragStart.x;
    const walkY = y - dragStart.y;
    scrollRef.current.scrollLeft = scrollPos.left - walkX;
    scrollRef.current.scrollTop = scrollPos.top - walkY;
  };

  const handleInnerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!setCoords) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPercent = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setCoords({
      x: Math.max(0, Math.min(100, xPercent)),
      y: Math.max(0, Math.min(100, yPercent)),
    });
  };

  return {
    zoom,
    scrollRef,
    isDragging,
    handleZoomIn,
    handleZoomOut,
    handleMouseDown,
    handleMouseUpOrLeave,
    handleContainerMouseMove,
    handleInnerMouseMove,
  };
}
