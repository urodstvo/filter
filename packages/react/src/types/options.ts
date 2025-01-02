export type FilterOptionsProps<T extends React.ElementType> = React.ComponentPropsWithRef<T> & {
    component?: T;
};
