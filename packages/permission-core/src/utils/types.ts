
/*
TODO: maybe need to released structure type with this types
type NoneOrderTuple<
  T extends any[],
  C extends readonly any[],
  U = Exclude<T[number], C[number]>,
  R extends any[] = [C]
> = T["length"] extends C["length"] //CheckMaxSize<T, C> extends never
  ? C
  : T[number] extends C[number]
  ? C
  : C extends [...infer Rest, infer I]
  ? NoneOrderTuple<T, [...C, U], U, [...R, C]> | R[number]
  : NoneOrderTuple<T, readonly [...C, U], U>;

type CheckMaxSize<B extends any[], S extends any[]> = S extends [
  infer IS,
  ...infer RestS
]
  ? B extends [infer IB, ...infer RestB]
    ? CheckMaxSize<RestB, RestS>
    : never
  : S;

  export type RemoveUsedType<
  T extends readonly any[],
  R extends readonly any[] = [],
  U extends readonly any[] = []
> = T extends [infer I, ...infer Rest]
  ? I extends R[number]
    ? RemoveUsedType<Rest, R, U>
    : RemoveUsedType<Rest, R, [I, ...U]>
  : U;
*/

// FIXME: in mvp 1.0.0 need to released structure type without this hard type, arr.length = 7 => 13999 type variants, 8 cant load
export type TupleToUnionTuple<
  T extends any[],
  R extends any[] = [],
  U = T[number]
> = T extends [infer I, ...infer Rest]
  ? TupleToUnionTuple<Rest, [...R, U], U> | R
  : R;

export type UniqueTuple<T extends any[], Seen extends any[] = []> = T extends [
  infer First,
  ...infer Rest
]
  ? First extends Seen[number]
    ? never
    : UniqueTuple<Rest, [...Seen, First]>
  : Seen extends [infer I, ...infer Rest]
  ? Seen
  : never;

