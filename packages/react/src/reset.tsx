import { useFilterContext } from './provider';
import { FilterResetProps } from './types';

export const FilterReset = ({ fieldName, render }: FilterResetProps) => {
    const { reset, resetField } = useFilterContext();

    return render({
        onClick: () => {
            fieldName ? resetField(fieldName) : reset();
        },
    });
};
