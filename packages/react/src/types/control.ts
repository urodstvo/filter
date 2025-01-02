import { EventType } from "./events";
import {  FieldName, FieldRefs, FieldValues, InternalFieldName } from "./field";
import { DefaultValues, UseFilterProps, UseFilterRegister, UseFilterReset, UseFilterUnregister, WatchInternal } from "./filter";
import { DeepPartial } from "./utils";


export type Names = {
    mount: Set<InternalFieldName>;
    unMount: Set<InternalFieldName>;
    disabled: Set<InternalFieldName>;
    watch: Set<InternalFieldName>;
    focus?: InternalFieldName;
    watchAll?: boolean;
  };

export type Observer<T> = {
  next: (value: T) => void;
};

export type Subscription = {
  unsubscribe: () => void;
};

export type Subject<T> = {
  readonly observers: Observer<T>[];
  subscribe: (value: Observer<T>) => Subscription;
  unsubscribe: () => void;
} & Observer<T>;

export type FilterStateSubjectRef<TFieldValues extends FieldValues> = Subject<
  Partial<FilterState<TFieldValues>> & { name?: InternalFieldName }
>;

export type Subjects<TFieldValues extends FieldValues> = {
    values: Subject<{
      name?: InternalFieldName;
      type?: EventType;
      values: FieldValues;
    }>;
    state: FilterStateSubjectRef<TFieldValues>;
  };

export type FilterState<TFieldValues extends FieldValues> = {
  disabled: boolean;
  defaultValues?: undefined | Readonly<DeepPartial<TFieldValues>>;
};

export type Control<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
> = {
  _subjects: Subjects<TFieldValues>;
  _names: Names;
  _state: {
    mount: boolean;
    action: boolean;
    watch: boolean;
  };
  _filterState: FilterState<TFieldValues>;
  _reset: UseFilterReset<TFieldValues>;
  _options: UseFilterProps<TFieldValues, TContext>;
  _fields: FieldRefs;
  _filterValues: FieldValues;
  _defaultValues: Partial<DefaultValues<TFieldValues>>;
  _resetDefaultValues: () => void;
  _updateDisabledField: (
      props: {
          disabled?: boolean;
          name: FieldName;
          value?: unknown;
        }
    ) => void;
    register: UseFilterRegister<TFieldValues>;
    unregister: UseFilterUnregister<TFieldValues>;
    _disableFilter: (disabled?: boolean) => void;
    _removeUnmounted: () => void;
    _getWatch: WatchInternal<TFieldValues>;
};