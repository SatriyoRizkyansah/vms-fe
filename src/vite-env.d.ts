/// <reference types="vite/client" />

declare global {
  type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (...args: any) => Promise<infer R> ? R : any;
  type ExclusiveOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
  type ToOptional<T> = { [P in keyof T]?: T[P] };
}

export {};
