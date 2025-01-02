export type FilterListProps<T> = {
    render: (list: T[]) => React.ReactNode
    callback: (list: T[]) => boolean
    initialList: T[]
}