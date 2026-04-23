export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

export function approach(current: number, target: number, amount: number) {
  if (current < target) {
    return Math.min(target, current + amount);
  }

  if (current > target) {
    return Math.max(target, current - amount);
  }

  return current;
}

export function overlaps1D(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && aEnd > bStart;
}

export function seededValue(seed: number) {
  return Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
}
