import { MathDifficulty } from '../types/pose';

export interface MathProblem {
  text: string;   // e.g. "47 − 19"
  answer: number;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Random number with the given digit count (1, 2 or 3 digits). */
function byDigits(d: 1 | 2 | 3): number {
  if (d === 1) return randInt(1, 9);
  if (d === 2) return randInt(10, 99);
  return randInt(100, 999);
}

function addSub(aDigits: 1 | 2 | 3, bDigits: 1 | 2 | 3): MathProblem {
  let a = byDigits(aDigits);
  let b = byDigits(bDigits);
  if (Math.random() < 0.5) {
    return { text: `${a} + ${b}`, answer: a + b };
  }
  if (b > a) [a, b] = [b, a]; // keep subtraction non-negative
  return { text: `${a} − ${b}`, answer: a - b };
}

/** Multiplication or clean division using 2-digit operands. */
function mulOrDiv(): MathProblem {
  if (Math.random() < 0.5) {
    const a = byDigits(2);
    const b = byDigits(2);
    return { text: `${a} × ${b}`, answer: a * b };
  }
  // division with an integer result: divisor is 2-digit, quotient 1-digit
  const divisor = byDigits(2);
  const quotient = randInt(2, 9);
  const dividend = divisor * quotient;
  return { text: `${dividend} ÷ ${divisor}`, answer: quotient };
}

interface Weighted { w: number; make: () => MathProblem; }

function pick(items: Weighted[]): MathProblem {
  const total = items.reduce((sum, i) => sum + i.w, 0);
  let r = Math.random() * total;
  for (const item of items) {
    if (r < item.w) return item.make();
    r -= item.w;
  }
  return items[items.length - 1].make();
}

export function generateProblem(difficulty: MathDifficulty): MathProblem {
  switch (difficulty) {
    case 'easy':
      // +,- only, always two 2-digit operands (e.g. 22 + 57). Never single-digit.
      return addSub(2, 2);
    case 'medium':
      // +,- with 50% 2-digit, 40% 3-digit, 10% ×/÷ of 2-digit
      return pick([
        { w: 50, make: () => addSub(2, 2) },
        { w: 40, make: () => addSub(3, 3) },
        { w: 10, make: () => mulOrDiv() },
      ]);
    case 'hard':
      // 60% 3-digit +,-, 10% 2-digit +,-, 30% ×/÷ of 2-digit
      return pick([
        { w: 60, make: () => addSub(3, 3) },
        { w: 10, make: () => addSub(2, 2) },
        { w: 30, make: () => mulOrDiv() },
      ]);
  }
}

export function generateProblems(difficulty: MathDifficulty, count: number): MathProblem[] {
  return Array.from({ length: count }, () => generateProblem(difficulty));
}
