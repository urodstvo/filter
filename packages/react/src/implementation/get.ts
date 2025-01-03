import { compact, isNullOrUndefined, isObject, isUndefined } from './utils';

export default <T>(object: T, path?: string | null, defaultValue?: unknown): any => {
    if (!path || !isObject(object)) {
        return defaultValue;
    }

    const result = compact(path.split(/[,[\].]+?/)).reduce(
        (result, key) => (isNullOrUndefined(result) ? result : result[key as keyof {}]),
        object,
    );

    return isUndefined(result) || result === object
        ? isUndefined(object[path as keyof T])
            ? defaultValue
            : object[path as keyof T]
        : result;
};
