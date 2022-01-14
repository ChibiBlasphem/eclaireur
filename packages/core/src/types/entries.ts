export type Entry<T> = {
  [K in keyof T]-?: [K, T[K]];
}[keyof T];

export type Entries<T> = Entry<T>[];
