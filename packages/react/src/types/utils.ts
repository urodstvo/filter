declare const $NestedValue: unique symbol;

export type ExtractObjects<T> = T extends infer U
  ? U extends object
    ? U
    : never
  : never;

export type NestedValue<TValue extends object = object> = {
    [$NestedValue]: never;
  } & TValue;

export type DeepPartial<T> = T extends BrowserNativeObject | NestedValue
  ? T
  : {
      [K in keyof T]?: ExtractObjects<T[K]> extends never
        ? T[K]
        : DeepPartial<T[K]>;
    };

export type IsTuple<T extends ReadonlyArray<any>> = number extends T['length']
    ? false
    : true;

export type TupleKeys<T extends ReadonlyArray<any>> = Exclude<
    keyof T,
    keyof any[]
  >;

export type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint;

export type BrowserNativeObject = Date | FileList | File;

export type IsEqual<T1, T2> = T1 extends T2
  ? (<G>() => G extends T1 ? 1 : 2) extends <G>() => G extends T2 ? 1 : 2
    ? true
    : false
  : false;


export type AnyIsEqual<T1, T2> = T1 extends T2
  ? IsEqual<T1, T2> extends true
    ? true
    : never
  : never;

export type IsAny<T> = 0 extends 1 & T ? true : false;

export type ChangeHandler = (event: {
    target: any;
    type?: any;
  }) => Promise<void | boolean>;

export type RefCallBack = (instance: any) => void;


export type EmptyObject = { [K in string | number]: never };

export type DeepPartialSkipArrayKey<T> = T extends
  | BrowserNativeObject
  | NestedValue
  ? T
  : T extends ReadonlyArray<any>
    ? { [K in keyof T]: DeepPartialSkipArrayKey<T[K]> }
    : { [K in keyof T]?: DeepPartialSkipArrayKey<T[K]> };