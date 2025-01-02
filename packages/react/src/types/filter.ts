import { FilterContextType } from "./context";
import { Subscription } from "./control";
import { EventType } from "./events";
import {  FieldValue, FieldValues, InternalFieldName } from "./field";
import { FieldPath, FieldPathValue, FieldPathValues } from "./path";
import { ChangeHandler, DeepPartial, RefCallBack } from "./utils";



type ResetAction<TFieldValues> = (formValues: TFieldValues) => TFieldValues;
export type DefaultValues<TFieldValues> = DeepPartial<TFieldValues>;


export type KeepStateOptions = Partial<{
  keepValues: boolean;
  keepDefaultValues: boolean;
}>;

export type UseFilterReset<TFieldValues extends FieldValues> = (
    values?:
        | DefaultValues<TFieldValues>
        | TFieldValues
        | ResetAction<TFieldValues>,
    keepStateOptions?: KeepStateOptions,
) => void;


export type UseFilterProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
> = Partial<{
  disabled: boolean;
  defaultValues: DefaultValues<TFieldValues>;
  values: TFieldValues;
  resetOptions: Parameters<UseFilterReset<TFieldValues>>[1];
  context: TContext;
  shouldUnregister: boolean;
}>;

export type Message = string;

export type ValidationValue = boolean | number | string | RegExp;

export type ValidationValueMessage<
  TValidationValue extends ValidationValue = ValidationValue,
> = {
  value: TValidationValue;
  message: Message;
};

export type ValidationRule<
  TValidationValue extends ValidationValue = ValidationValue,
> = TValidationValue | ValidationValueMessage<TValidationValue>;

export type RegisterOptions<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Partial<{
  value: FieldPathValue<TFieldValues, TFieldName>;
  setValueAs: (value: any) => any;
  shouldUnregister?: boolean;
  onChange?: (event: any) => void;
  onBlur?: (event: any) => void;
  disabled: boolean;
  deps: FieldPath<TFieldValues> | FieldPath<TFieldValues>[];
}> &
(
  | {
      pattern?: ValidationRule<RegExp>;
      valueAsNumber?: false;
      valueAsDate?: false;
    }
  | {
      pattern?: undefined;
      valueAsNumber?: false;
      valueAsDate?: true;
    }
  | {
      pattern?: undefined;
      valueAsNumber?: true;
      valueAsDate?: false;
    }
);

export type UseFilterRegisterReturn<
  TFieldName extends InternalFieldName = InternalFieldName,
> = {
  onChange: ChangeHandler;
  onBlur: ChangeHandler;
  ref: RefCallBack;
  name: TFieldName;
  disabled?: boolean;
};


export type UseFilterRegister<TFieldValues extends FieldValues> = <
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  name: TFieldName,
  options?: RegisterOptions<TFieldValues, TFieldName>,
) => UseFilterRegisterReturn<TFieldName>;

export type SetFocusOptions = Partial<{
  shouldSelect: boolean;
}>;

export type UseFilterUnregister<TFieldValues extends FieldValues> = (
    name?:
      | FieldPath<TFieldValues>
      | FieldPath<TFieldValues>[]
      | readonly FieldPath<TFieldValues>[],
  ) => void;

export type UseFilterResetField<TFieldValues extends FieldValues> = <
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  name: TFieldName,
  options?: Partial<{
    defaultValue: FieldPathValue<TFieldValues, TFieldName>;
  }>,
) => void;


export type UseFilterGetValues<TFieldValues extends FieldValues> = {
    (): TFieldValues;

    <TFieldName extends FieldPath<TFieldValues>>(
      name: TFieldName,
    ): FieldPathValue<TFieldValues, TFieldName>;

    <TFieldNames extends FieldPath<TFieldValues>[]>(
      names: readonly [...TFieldNames],
    ): [...FieldPathValues<TFieldValues, TFieldNames>];
  };

export type FilterProps<
    TFieldValues extends FieldValues = FieldValues,
    TContext = any
    > = Partial<{
        filter: FilterContextType<TFieldValues, TContext>;    
        children: React.ReactNode | React.ReactNode[];
    }>;

  export type SetFieldValue<TFieldValues extends FieldValues> = FieldValue<TFieldValues>;

export type UseFilterSetValue<TFieldValues extends FieldValues> = <
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  name: TFieldName,
  value: FieldPathValue<TFieldValues, TFieldName>
) => void;

export type WatchInternal<TFieldValues> = (
  fieldNames?: InternalFieldName | InternalFieldName[],
  defaultValue?: DeepPartial<TFieldValues>,
  isMounted?: boolean,
  isGlobal?: boolean,
) =>
  | FieldPathValue<FieldValues, InternalFieldName>
  | FieldPathValues<FieldValues, InternalFieldName[]>;

export type WatchObserver<TFieldValues extends FieldValues> = (
  value: DeepPartial<TFieldValues>,
  info: {
    name?: FieldPath<TFieldValues>;
    type?: EventType;
    values?: unknown;
  },
) => void;

export type UseFilterWatch<TFieldValues extends FieldValues> = {
  (): TFieldValues;

  <TFieldNames extends readonly FieldPath<TFieldValues>[]>(
    names: readonly [...TFieldNames],
    defaultValue?: DeepPartial<TFieldValues>,
  ): FieldPathValues<TFieldValues, TFieldNames>;

  <TFieldName extends FieldPath<TFieldValues>>(
    name: TFieldName,
    defaultValue?: FieldPathValue<TFieldValues, TFieldName>,
  ): FieldPathValue<TFieldValues, TFieldName>;

  (
    callback: WatchObserver<TFieldValues>,
    defaultValues?: DeepPartial<TFieldValues>,
  ): Subscription;
};