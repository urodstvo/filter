import { Control, FilterState } from './control';
import { FieldValues } from './field';
import { UseFilterGetValues, UseFilterReset, UseFilterResetField, UseFilterSetValue, UseFilterWatch } from './filter';

export type FilterProviderProps<TFieldValues extends FieldValues = FieldValues, TContext = any> = {
    children?: React.ReactNode;
} & FilterContextType<TFieldValues, TContext>;

export type FilterContextType<TFieldValues extends FieldValues = FieldValues, TContext = any> = {
    _control: Control<TFieldValues, TContext>;
    filterState: FilterState<TFieldValues>;
    watch: UseFilterWatch<TFieldValues>;
    getValues: UseFilterGetValues<TFieldValues>;
    setValue: UseFilterSetValue<TFieldValues>;
    resetField: UseFilterResetField<TFieldValues>;
    reset: UseFilterReset<TFieldValues>;
};
