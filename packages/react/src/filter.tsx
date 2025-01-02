import { FilterProvider } from './provider';
import { FilterProviderProps, FieldValues } from './types';

export const Filter = <TFieldValues extends FieldValues = FieldValues, TContext = any>({
    children,
    ...props
}: FilterProviderProps<TFieldValues, TContext>) => {
    return <FilterProvider {...(props as unknown as FilterProviderProps<FieldValues, any>)}>{children}</FilterProvider>;
};
