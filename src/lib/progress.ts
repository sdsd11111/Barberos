export function getProgressBar(current: number, target: number): string {
  const filled = "█";
  const empty = "░";
  const filledCount = Math.min(current, target);
  const emptyCount = target - filledCount;

  const bar = filled.repeat(filledCount) + empty.repeat(emptyCount);
  return `[${bar}] ${current} de ${target}`;
}
