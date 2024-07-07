export function random(min, max) {
  if (min === undefined) {
    min = 0;
    max = 1;
  }

  if (max === undefined) {
    max = min;
    min = 0;
  }

  return Math.random() * (max - min) + min;
}
