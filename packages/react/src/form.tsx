import { useEffect } from 'react';
import { FieldValues, FilterFormProps } from './types';
import { useFilterContext } from './provider';
import { useSubscribe } from './use-subscribe';

type persistDataProps = {
    value: any;
    key?: string;
    storage?: Storage;
};

const persistData = ({ value, key, storage }: persistDataProps) => {
    if (storage && key) storage.setItem(key, JSON.stringify(value));
};

const getSavedData = (key: string, storage: Storage) => {
    let data = storage.getItem(key);
    if (data) {
        try {
            data = JSON.parse(data);
        } catch (err) {
            console.log(err);
        }
        return data as unknown as FieldValues;
    }
    return undefined;
};

export const FilterForm = ({
    component,
    children,
    disabled,
    storage,
    storageKey,
    ...props
}: FilterFormProps<'form'>) => {
    const ctx = useFilterContext();

    useEffect(() => {
        if (storage && storageKey) {
            const savedData = getSavedData(storageKey, storage);
            if (savedData) for (const key in savedData) ctx.setValue(key, savedData[key]);
        }
    }, []);

    useSubscribe({
        subject: ctx._control._subjects.values,
        next() {
            persistData({ value: ctx.getValues(), key: storageKey, storage });
        },
    });

    useEffect(() => {
        ctx._control._disableFilter(disabled);
    }, [disabled]);

    return <form {...props}>{children}</form>;
};
