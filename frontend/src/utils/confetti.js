// Lightweight, high-performance canvas confetti particle engine (Zero npm dependencies)
export function triggerConfetti(durationMs = 2500) {
  const canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const colors = [
    '#2563eb', '#38bdf8', '#4f46e5', '#7c3aed', 
    '#ec4899', '#f43f5e', '#10b981', '#f59e0b'
  ];

  const particleCount = 120;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: width * (0.3 + Math.random() * 0.4),
      y: height * 0.4,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 1.2) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      tilt: Math.random() * 10,
      opacity: 1,
    });
  }

  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / durationMs;

    if (progress >= 1) {
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // gravity
      p.vx *= 0.98; // air resistance
      p.rotation += p.rotSpeed;
      p.opacity = Math.max(0, 1 - progress);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
      ctx.restore();
    });

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
