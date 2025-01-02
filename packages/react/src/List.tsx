import { FilterListProps } from './types';

export function FilterList({ render, initialList, callback }: FilterListProps<any>) {
    return <>{render}</>;
}
