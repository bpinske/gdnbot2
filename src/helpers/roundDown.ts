/**
 * Round a number down to the closest 10's place
 */
export default function roundDown (count: number): number {
  if (count <= 10) {
    return count;
  }

  return count - (count % 10);
}
