import {
    EmptyObject,
    Primitive,
    Field,
    FieldElement,
    InternalFieldName,
    NativeFieldValue,
    Ref,
    Names,
    Observer,
    Subject,
    Subscription,
} from '../types';

export const isObjectType = (value: unknown): value is object => typeof value === 'object';

export const isNullOrUndefined = (value: unknown): value is null | undefined => value == null;

export const isDateObject = (value: unknown): value is Date => value instanceof Date;

export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

export const isEmptyObject = (value: unknown): value is EmptyObject => isObject(value) && !Object.keys(value).length;

export const isFunction = (value: unknown): value is Function => typeof value === 'function';

export const isUndefined = (val: unknown): val is undefined => val === undefined;

export const isString = (value: unknown): value is string => typeof value === 'string';

export const isPrimitive = (value: unknown): value is Primitive => isNullOrUndefined(value) || !isObjectType(value);

export const isObject = <T extends object>(value: unknown): value is T =>
    !isNullOrUndefined(value) && !Array.isArray(value) && isObjectType(value) && !isDateObject(value);

export const isPlainObject = (tempObject: object) => {
    const prototypeCopy = tempObject.constructor && tempObject.constructor.prototype;

    return isObject(prototypeCopy) && prototypeCopy.hasOwnProperty('isPrototypeOf');
};

export function cloneObject<T>(data: T): T {
    let copy: any;
    const isArray = Array.isArray(data);
    const isFileListInstance = typeof FileList !== 'undefined' ? data instanceof FileList : false;

    if (data instanceof Date) copy = new Date(data);
    else if (data instanceof Set) copy = new Set(data);
    else if (!(isWeb && (data instanceof Blob || isFileListInstance)) && (isArray || isObject(data))) {
        copy = isArray ? [] : {};

        if (!isArray && !isPlainObject(data)) copy = data;
        else for (const key in data) if (data.hasOwnProperty(key)) copy[key] = cloneObject(data[key]);
    } else return data;

    return copy;
}

export const isWeb =
    typeof window !== 'undefined' && typeof window.HTMLElement !== 'undefined' && typeof document !== 'undefined';

export const isKey = (value: string) => /^\w*$/.test(value);

export const compact = <TValue>(value: TValue[]) => (Array.isArray(value) ? value.filter(Boolean) : []);

export const stringToPath = (input: string): string[] => compact(input.replace(/["|']|\]/g, '').split(/\.|\[/));

export const isHTMLElement = (value: unknown): value is HTMLElement => {
    if (!isWeb) return false;

    const owner = value ? ((value as HTMLElement).ownerDocument as Document) : 0;
    return value instanceof (owner && owner.defaultView ? owner.defaultView.HTMLElement : HTMLElement);
};

export const isMultipleSelect = (element: FieldElement): element is HTMLSelectElement =>
    element.type === `select-multiple`;

export const isCheckBoxInput = (element: FieldElement): element is HTMLInputElement => element.type === 'checkbox';

export const isRadioInput = (element: FieldElement): element is HTMLInputElement => element.type === 'radio';

export const isRadioOrCheckbox = (ref: FieldElement): ref is HTMLInputElement =>
    isRadioInput(ref) || isCheckBoxInput(ref);

export const live = (ref: Ref) => isHTMLElement(ref) && ref.isConnected;

export const getFieldValueAs = <T extends NativeFieldValue>(
    value: T,
    { valueAsNumber, valueAsDate, setValueAs }: Field['_f'],
) =>
    isUndefined(value)
        ? value
        : valueAsNumber
          ? value === ''
              ? NaN
              : value
                ? +value
                : value
          : valueAsDate && isString(value)
            ? new Date(value)
            : setValueAs
              ? setValueAs(value)
              : value;

export const isWatched = (name: InternalFieldName, _names: Names, isBlurEvent?: boolean) =>
    !isBlurEvent &&
    (_names.watchAll ||
        _names.watch.has(name) ||
        [..._names.watch].some(
            (watchName) => name.startsWith(watchName) && /^\.\w+/.test(name.slice(watchName.length)),
        ));

export const createSubject = <T>(): Subject<T> => {
    let _observers: Observer<T>[] = [];

    const next = (value: T) => {
        for (const observer of _observers) observer.next && observer.next(value);
    };

    const subscribe = (observer: Observer<T>): Subscription => {
        _observers.push(observer);
        return {
            unsubscribe: () => {
                _observers = _observers.filter((o) => o !== observer);
            },
        };
    };

    const unsubscribe = () => {
        _observers = [];
    };

    return {
        get observers() {
            return _observers;
        },
        next,
        subscribe,
        unsubscribe,
    };
};

type RadioFieldResult = {
    isValid: boolean;
    value: number | string | null;
};

const defaultReturn: RadioFieldResult = {
    isValid: false,
    value: null,
};

export const getRadioValue = (options?: HTMLInputElement[]): RadioFieldResult =>
    Array.isArray(options)
        ? options.reduce(
              (previous, option): RadioFieldResult =>
                  option && option.checked && !option.disabled
                      ? {
                            isValid: true,
                            value: option.value,
                        }
                      : previous,
              defaultReturn,
          )
        : defaultReturn;

type CheckboxFieldResult = {
    isValid: boolean;
    value: string | string[] | boolean | undefined;
};

const defaultResult: CheckboxFieldResult = { value: false, isValid: false };
const validResult = { value: true, isValid: true };

export const getCheckboxValue = (options?: HTMLInputElement[]): CheckboxFieldResult => {
    if (Array.isArray(options)) {
        if (options.length > 1) {
            const values = options
                .filter((option) => option && option.checked && !option.disabled)
                .map((option) => option.value);
            return { value: values, isValid: !!values.length };
        }

        return options[0]!.checked && !options[0]!.disabled
            ? // @ts-expect-error expected to work in the browser
              options[0].attributes && !isUndefined(options[0].attributes.value)
                ? isUndefined(options[0]!.value) || options[0]!.value === ''
                    ? validResult
                    : { value: options[0]!.value, isValid: true }
                : validResult
            : defaultResult;
    }

    return defaultResult;
};

export default function getFieldValue(_f: Field['_f']) {
    const ref = _f.ref;

    if (isRadioInput(ref)) return getRadioValue(_f.refs).value;

    if (isMultipleSelect(ref)) return [...ref.selectedOptions].map(({ value }) => value);

    if (isCheckBoxInput(ref)) return getCheckboxValue(_f.refs).value;

    return getFieldValueAs(isUndefined(ref.value) ? _f.ref.value : ref.value, _f);
}

type Event = { target: any };

export const getEventValue = (event: unknown) =>
    isObject(event) && (event as Event).target
        ? isCheckBoxInput((event as Event).target)
            ? (event as Event).target.checked
            : (event as Event).target.value
        : event;

export function deepEqual(object1: any, object2: any) {
    if (isPrimitive(object1) || isPrimitive(object2)) return object1 === object2;

    if (isDateObject(object1) && isDateObject(object2)) return object1.getTime() === object2.getTime();

    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        const val1 = object1[key];

        if (!keys2.includes(key)) return false;

        if (key !== 'ref') {
            const val2 = object2[key];

            if (
                (isDateObject(val1) && isDateObject(val2)) ||
                (isObject(val1) && isObject(val2)) ||
                (Array.isArray(val1) && Array.isArray(val2))
                    ? !deepEqual(val1, val2)
                    : val1 !== val2
            )
                return false;
        }
    }

    return true;
}

export const convertToArrayPayload = <T>(value: T) => (Array.isArray(value) ? value : [value]);

export const shouldSubscribeByName = <T extends string | string[] | undefined>(
    name?: T,
    signalName?: string,
    exact?: boolean,
) =>
    !name ||
    !signalName ||
    name === signalName ||
    convertToArrayPayload(name).some(
        (currentName) =>
            currentName &&
            (exact
                ? currentName === signalName
                : currentName.startsWith(signalName) || signalName.startsWith(currentName)),
    );
