export type ParseInt<T> = T extends `${infer N extends number}` ? N : never;
