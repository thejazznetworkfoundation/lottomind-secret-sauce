import type { Rect } from "@/types/arcade";

export function rectsIntersect(a: Rect, b: Rect, inset = 0): boolean {
  return (
    a.x + inset < b.x + b.width &&
    a.x + a.width - inset > b.x &&
    a.y + inset < b.y + b.height &&
    a.y + a.height - inset > b.y
  );
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function distanceBetweenRects(a: Rect, b: Rect): number {
  const ax = a.x + a.width / 2;
  const ay = a.y + a.height / 2;
  const bx = b.x + b.width / 2;
  const by = b.y + b.height / 2;
  return Math.hypot(ax - bx, ay - by);
}

