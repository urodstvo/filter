import { FilterProvider, useFilter } from './provider';

type FilterProps = {
    children?: React.ReactNode;
};
export const Filter = ({ children }: FilterProps) => {
    const filter = useFilter();

    return <FilterProvider {...filter}>{children}</FilterProvider>;
};
