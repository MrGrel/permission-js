type Mode = "forEach" | "some" | "every";

export const stringPairHandler = <
  F extends string,
  S extends string,
  M extends Mode,
  R = M extends "forEach" ? undefined : boolean
>(
  first: F | F[],
  second: S | S[],
  cb: (first: F, second: S) => R,
  mode: M,
  defaultValue: R
): R => {
  if (Array.isArray(first) && typeof second === "string") {
    if (!first.length) return defaultValue;
    return first[mode]((f) => cb(f, second)) as R;
  }

  if (Array.isArray(second) && typeof first === "string") {
    if (!second.length) return defaultValue;
    return second[mode]((s) => cb(first, s)) as R;
  }

  if (Array.isArray(first) && Array.isArray(second)) {
    if (!first.length || !second.length) return defaultValue;
    return first[mode]((s) => second[mode]((a) => cb(s, a))) as R;
  }

  if (typeof first === "string" && typeof second === "string") {
    return cb(first, second);
  }

  return defaultValue;
};