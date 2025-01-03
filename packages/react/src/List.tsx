import { useState } from 'react';
import { FilterListProps } from './types';
import { useSubscribe } from './use-watch';
import { useFilterContext } from './provider';
import { deepEqual } from './implementation';

export function FilterList<T = any>({ render, initialList, callback }: FilterListProps<T>) {
    const ctx = useFilterContext();
    const [prevList, setPrevList] = useState<T[] | undefined>(undefined);
    const [list, setList] = useState<T[]>(callback({ initialList, filterValues: ctx.getValues() })); 

    useSubscribe({
        subject: ctx._control._subjects.values,
        next(v) {
            const newList = callback({ initialList, filterValues: v.values });
            setList(prev => {
                if (deepEqual(prev, newList)) return prev;
                setPrevList(prev);
                return newList;
            });
        },
    });

    return render(list, prevList);
}
