import { FieldValues } from './field';
import { AnyIsEqual, BrowserNativeObject, IsAny, IsTuple, Primitive, TupleKeys } from './utils';

type PathImpl<K extends string | number, V, TraversedTypes> = V extends Primitive | BrowserNativeObject
    ? `${K}`
    : // Check so that we don't recurse into the same type
      // by ensuring that the types are mutually assignable
      // mutually required to avoid false positives of subtypes
      true extends AnyIsEqual<TraversedTypes, V>
      ? `${K}`
      : `${K}` | `${K}.${PathInternal<V, TraversedTypes | V>}`;

type ArrayPathImpl<K extends string | number, V, TraversedTypes> = V extends Primitive | BrowserNativeObject
    ? IsAny<V> extends true
        ? string
        : never
    : V extends ReadonlyArray<infer U>
      ? U extends Primitive | BrowserNativeObject
          ? IsAny<V> extends true
              ? string
              : never
          : // Check so that we don't recurse into the same type
            // by ensuring that the types are mutually assignable
            // mutually required to avoid false positives of subtypes
            true extends AnyIsEqual<TraversedTypes, V>
            ? never
            : `${K}` | `${K}.${ArrayPathInternal<V, TraversedTypes | V>}`
      : true extends AnyIsEqual<TraversedTypes, V>
        ? never
        : `${K}.${ArrayPathInternal<V, TraversedTypes | V>}`;

export type ArrayKey = number;

type PathInternal<T, TraversedTypes = T> =
    T extends ReadonlyArray<infer V>
        ? IsTuple<T> extends true
            ? {
                  [K in TupleKeys<T>]-?: PathImpl<K & string, T[K], TraversedTypes>;
              }[TupleKeys<T>]
            : PathImpl<ArrayKey, V, TraversedTypes>
        : {
              [K in keyof T]-?: PathImpl<K & string, T[K], TraversedTypes>;
          }[keyof T];

export type Path<T> = T extends any ? PathInternal<T> : never;

export type FieldPath<TFieldValues extends FieldValues> = Path<TFieldValues>;

type ArrayPathInternal<T, TraversedTypes = T> =
    T extends ReadonlyArray<infer V>
        ? IsTuple<T> extends true
            ? {
                  [K in TupleKeys<T>]-?: ArrayPathImpl<K & string, T[K], TraversedTypes>;
              }[TupleKeys<T>]
            : ArrayPathImpl<ArrayKey, V, TraversedTypes>
        : {
              [K in keyof T]-?: ArrayPathImpl<K & string, T[K], TraversedTypes>;
          }[keyof T];

export type ArrayPath<T> = T extends any ? ArrayPathInternal<T> : never;

type PathValueImpl<T, P extends string> = T extends any
    ? P extends `${infer K}.${infer R}`
        ? K extends keyof T
            ? PathValueImpl<T[K], R>
            : K extends `${ArrayKey}`
              ? T extends ReadonlyArray<infer V>
                  ? PathValueImpl<V, R>
                  : never
              : never
        : P extends keyof T
          ? T[P]
          : P extends `${ArrayKey}`
            ? T extends ReadonlyArray<infer V>
                ? V
                : never
            : never
    : never;

export type PathValue<T, P extends Path<T> | ArrayPath<T>> = PathValueImpl<T, P>;

export type FieldPathValue<TFieldValues extends FieldValues, TFieldPath extends FieldPath<TFieldValues>> = PathValue<
    TFieldValues,
    TFieldPath
>;

export type FieldPathValues<
    TFieldValues extends FieldValues,
    TPath extends FieldPath<TFieldValues>[] | readonly FieldPath<TFieldValues>[],
> = {} & {
    [K in keyof TPath]: FieldPathValue<TFieldValues, TPath[K] & FieldPath<TFieldValues>>;
};
