export function resolveCollisions(bodies) {
  for (const a of bodies) {
    for (const b of bodies) {
      if (a === b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < a.radius + b.radius) {
        const overlap = a.radius + b.radius - dist;
        a.x -= (dx / dist) * overlap * 0.5;
        b.x += (dx / dist) * overlap * 0.5;
      }
    }
  }
}
