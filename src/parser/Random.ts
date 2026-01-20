export class Random {
  constructor(private seed: number) {
  }

  nextBoolean(): boolean {
    const number: number = splitmix32(this.seed++);
    return number < 0.5;
  }
  nextInt(min:number, max:number) {
    const number: number = splitmix32(this.seed++);
    return Math.floor(number * (max - min)) + min;
  }
}

function splitmix32(a: number) {
  a |= 0;
  a = a + 0x9e3779b9 | 0;
  let t = a ^ a >>> 16;
  t = Math.imul(t, 0x21f0aaad);
  t = t ^ t >>> 15;
  t = Math.imul(t, 0x735a2d97);
  return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
}