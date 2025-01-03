import { FieldValues } from './field';
import { FieldPath } from './path';

export type FilterResetProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
    fieldName?: TName;
    render: (props: { onClick: () => void }) => React.ReactElement;
};
