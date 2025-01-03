import { DeepPartial, FieldValues, Names } from '../types';
import { isString } from './utils';
import get from './get';

export const generateWatchOutput = <T>(
    names: string | string[] | undefined,
    _names: Names,
    filterValues?: FieldValues,
    isGlobal?: boolean,
    defaultValue?: DeepPartial<T> | unknown,
) => {
    if (isString(names)) {
        isGlobal && _names.watch.add(names);
        return get(filterValues, names, defaultValue);
    }

    if (Array.isArray(names)) {
        return names.map((fieldName) => (isGlobal && _names.watch.add(fieldName), get(filterValues, fieldName)));
    }

    isGlobal && (_names.watchAll = true);

    return filterValues;
};
