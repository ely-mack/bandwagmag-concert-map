const BUBBLE_PADDING = 6;
const LAYOUT_ITERS = 240;

export interface PlacedNode {
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
  radius: number;
}

export function relax(nodes: PlacedNode[]): void {
  for (let iter = 0; iter < LAYOUT_ITERS; iter++) {
    let moved = false;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        const minDist = a.radius + b.radius + BUBBLE_PADDING;
        if (dist < minDist) {
          const overlap = (minDist - dist) / 2;
          const ux = dx / dist;
          const uy = dy / dist;
          a.x -= ux * overlap;
          a.y -= uy * overlap;
          b.x += ux * overlap;
          b.y += uy * overlap;
          moved = true;
        }
      }
    }
    for (const n of nodes) {
      const dx = n.anchorX - n.x;
      const dy = n.anchorY - n.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.5) {
        const k = 0.04;
        n.x += dx * k;
        n.y += dy * k;
        moved = true;
      }
    }
    if (!moved) break;
  }
}

const MIN_PX = 36;
const MAX_PX = 88;

export function markerSize(count: number, min: number, max: number): number {
  if (max === min) return (MIN_PX + MAX_PX) / 2;
  const t = (count - min) / (max - min);
  return Math.round(MIN_PX + t * (MAX_PX - MIN_PX));
}

export function markerInitials(name: string): string {
  const cleaned = name.replace(/^The\s+/i, "").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
