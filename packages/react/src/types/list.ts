import { FieldValues } from "./field";

export type FilterListProps<T> = {
    render: (list: T[], prevList?: T[]) => React.ReactElement;
    callback: (props: { initialList: T[]; filterValues: FieldValues }) => T[];
    initialList: T[];
};
