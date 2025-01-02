import { FilterListProps } from "./types/list"

export function FilterList({ render, initialList, callback }: FilterListProps<any>) {

    return <>{render}</>
}