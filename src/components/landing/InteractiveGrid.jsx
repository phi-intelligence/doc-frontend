import React, { useRef, useEffect } from 'react';

export default function InteractiveGrid() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let mouseX = -1000;
    let mouseY = -1000;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const gridSize = 50;
      const dotSize = 1;
      const color = '#427CCB'; // brand-accent-500
      
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.1;

      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          const dx = mouseX - x;
          const dy = mouseY - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 200) {
            const opacity = (1 - dist / 200) * 0.5 + 0.1;
            ctx.globalAlpha = opacity;
            const offset = (1 - dist / 200) * 10;
            ctx.beginPath();
            ctx.arc(x + (dx/dist)*offset, y + (dy/dist)*offset, dotSize * 1.5, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.globalAlpha = 0.1;
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
