export type TupleToUnionTuple<T extends any[], R extends any[] = [], U = T[number]> = T extends [infer I, ...infer Rest] ? TupleToUnionTuple<Rest, [...R, U], U> | R : R;
export type UniqueTuple<T extends any[], Seen extends any[] = []> = T extends [
    infer First,
    ...infer Rest
] ? First extends Seen[number] ? never : UniqueTuple<Rest, [...Seen, First]> : Seen extends [infer I, ...infer Rest] ? Seen : never;
