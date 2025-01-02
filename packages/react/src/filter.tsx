import { FilterProvider } from "./provider";
import { FilterProviderProps } from "./types/context";
import { FieldValues } from "./types/field";

export const Filter = <
        TFieldValues extends FieldValues = FieldValues,
        TContext = any
    >({children, ...props}: FilterProviderProps<TFieldValues, TContext>) => {
        return <FilterProvider {...props as unknown as FilterProviderProps<FieldValues, any>}>{children}</FilterProvider>;
    };

