import { FilterOptionsProps } from "./types/options";

export const FilterOptions = <T extends React.ElementType = 'form'>({ children, component: Component = 'form', ...props }: FilterOptionsProps<T>) => {
    return <Component {...props}>{children}</Component>
};