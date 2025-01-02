import { RegisterOptions } from "./filter";
import { FieldPath, FieldPathValue } from "./path";
import { RefCallBack } from "./utils";

export type FieldType = "range" | "text" | "number" | "select" | "radio" | "checkbox" | "switch";

export type FieldValue<TFieldValues extends FieldValues> = TFieldValues[InternalFieldName];

export type FieldValues = Record<string, any>;

export type InternalFieldName = string;

export type FieldRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  onChange: (...event: any[]) => void;
  onBlur: () => void;
  value: FieldPathValue<TFieldValues, TName>;
  disabled?: boolean;
  name: TName;
  ref: RefCallBack;
};

export type FieldProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  > = {
      render: (props: {field: FieldRenderProps<TFieldValues, TName>}) => React.ReactElement
  } & UseFieldProps<TFieldValues, TName>;

export type UseFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  rules?: Omit<
    RegisterOptions<TFieldValues, TName>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >;
  shouldUnregister?: boolean;
  defaultValue?: FieldPathValue<TFieldValues, TName>;
  disabled?: boolean;
};

export type UseFieldReturn<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  field: FieldRenderProps<TFieldValues, TName>;
};

export type FieldName = string;
    
export type CustomElement =
  Partial<HTMLElement> & {
    name: FieldName;
    type?: string;
    value?: any;
    disabled?: boolean;
    checked?: boolean;
    options?: HTMLOptionsCollection;
    focus?: () => void;
  };

export type FieldElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | CustomElement;

export type Ref = FieldElement;

export type Field = {
  _f: {
    ref: Ref;
    name: InternalFieldName;
    refs?: HTMLInputElement[];
    mount?: boolean;
  } & RegisterOptions;
};

export type FieldRefs = Partial<{
  [key: InternalFieldName]: Field | FieldRefs;
}>;

export type NativeFieldValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | unknown[];