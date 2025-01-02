import { FilterOptionsProps } from './types';

export const FilterOptions = <T extends React.ElementType = 'form'>({
    children,
    component: Component = 'form',
    ...props
}: FilterOptionsProps<T>) => {
    return <Component {...props}>{children}</Component>;
};
