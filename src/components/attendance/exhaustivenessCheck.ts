export default function exhaustivenessCheck(value: never): never {
  throw new Error(`Exhaustiveness check fell through: ${value}`);
}
