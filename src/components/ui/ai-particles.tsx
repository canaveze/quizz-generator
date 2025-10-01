import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  symbol: string;
  color: string;
}

interface AIParticlesProps {
  density?: number; // Particles per movement
  minSize?: number;
  maxSize?: number;
  minSpeed?: number;
  maxSpeed?: number;
  lifetime?: number; // in milliseconds
  colors?: string[];
}

export const AIParticles: React.FC<AIParticlesProps> = ({
  density = 2,
  minSize = 12,
  maxSize = 20,
  minSpeed = 0.3,
  maxSpeed = 1,
  lifetime = 2000,
  colors = ['rgba(255, 138, 0, 0.8)', 'rgba(0, 51, 102, 0.8)', 'rgba(255, 200, 100, 0.8)']
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0 });
  const animationRef = useRef<number>();

  const symbols = [
    'AI', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '⚡', '◆', '●', '◉', '⬢'
  ];

  const createParticle = (x: number, y: number): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: lifetime,
      maxLife: lifetime,
      size: minSize + Math.random() * (maxSize - minSize),
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      color: colors[Math.floor(Math.random() * colors.length)]
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      mouseRef.current.lastX = mouseRef.current.x;
      mouseRef.current.lastY = mouseRef.current.y;
      mouseRef.current.x = clientX;
      mouseRef.current.y = clientY;

      // Calculate distance moved
      const dx = mouseRef.current.x - mouseRef.current.lastX;
      const dy = mouseRef.current.y - mouseRef.current.lastY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Generate particles based on movement distance
      if (distance > 5) {
        const particlesToCreate = Math.ceil(density * (distance / 10));
        for (let i = 0; i < particlesToCreate; i++) {
          particlesRef.current.push(createParticle(clientX, clientY));
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 16; // Approximate frame time

        if (particle.life <= 0) return false;

        const opacity = particle.life / particle.maxLife;
        const currentColor = particle.color.replace(/[\d.]+\)$/, `${opacity})`);

        ctx.save();
        ctx.font = `bold ${particle.size}px Arial`;
        ctx.fillStyle = currentColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add glow effect
        ctx.shadowColor = currentColor;
        ctx.shadowBlur = 8 * opacity;
        
        ctx.fillText(particle.symbol, particle.x, particle.y);
        ctx.restore();

        return true;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [density, minSize, maxSize, minSpeed, maxSpeed, lifetime, colors]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};
