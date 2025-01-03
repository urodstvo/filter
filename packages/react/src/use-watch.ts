import { useEffect, useRef, useState } from 'react';

import {
    Control,
    Subject,
    FieldValues,
    InternalFieldName,
    FieldPath,
    FieldPathValue,
    FieldPathValues,
    DeepPartialSkipArrayKey,
} from './types';
import { cloneObject, generateWatchOutput, shouldSubscribeByName } from './implementation';
import { useFilterContext } from './provider';

type Props<T> = {
    disabled?: boolean;
    subject: Subject<T>;
    next: (value: T) => void;
};

export function useSubscribe<T>(props: Props<T>) {
    const _props = useRef(props);
    _props.current = props;

    useEffect(() => {
        const subscription =
            !props.disabled &&
            _props.current.subject &&
            _props.current.subject.subscribe({
                next: _props.current.next,
            });

        return () => {
            subscription && subscription.unsubscribe();
        };
    }, [props.disabled]);
}

export type UseWatchProps<TFieldValues extends FieldValues = FieldValues> = {
    defaultValue?: unknown;
    disabled?: boolean;
    name?: FieldPath<TFieldValues> | FieldPath<TFieldValues>[] | readonly FieldPath<TFieldValues>[];
    control?: Control<TFieldValues>;
    exact?: boolean;
};

export function useWatch<TFieldValues extends FieldValues = FieldValues>(props: {
    defaultValue?: DeepPartialSkipArrayKey<TFieldValues>;
    control?: Control<TFieldValues>;
    disabled?: boolean;
    exact?: boolean;
}): DeepPartialSkipArrayKey<TFieldValues>;

export function useWatch<
    TFieldValues extends FieldValues = FieldValues,
    TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
    name: TFieldName;
    defaultValue?: FieldPathValue<TFieldValues, TFieldName>;
    control?: Control<TFieldValues>;
    disabled?: boolean;
    exact?: boolean;
}): FieldPathValue<TFieldValues, TFieldName>;

export function useWatch<
    TFieldValues extends FieldValues = FieldValues,
    TFieldNames extends readonly FieldPath<TFieldValues>[] = readonly FieldPath<TFieldValues>[],
>(props: {
    name: readonly [...TFieldNames];
    defaultValue?: DeepPartialSkipArrayKey<TFieldValues>;
    control?: Control<TFieldValues>;
    disabled?: boolean;
    exact?: boolean;
}): FieldPathValues<TFieldValues, TFieldNames>;

export function useWatch<TFieldValues extends FieldValues = FieldValues>(): DeepPartialSkipArrayKey<TFieldValues>;

export function useWatch<TFieldValues extends FieldValues>(props?: UseWatchProps<TFieldValues>) {
    const ctx = useFilterContext();

    const { control = ctx._control, name, defaultValue, disabled, exact } = props || {};

    const _name = useRef(name);

    _name.current = name;

    useSubscribe({
        disabled,
        subject: control._subjects.values,
        next: (state: { name?: InternalFieldName; values?: FieldValues }) => {
            if (shouldSubscribeByName(_name.current as InternalFieldName, state.name, exact)) {
                updateValue(
                    cloneObject(
                        generateWatchOutput(
                            _name.current as InternalFieldName | InternalFieldName[],
                            control._names,
                            state.values || control._filterValues,
                            false,
                            defaultValue,
                        ),
                    ),
                );
            }
        },
    });

    const [value, updateValue] = useState(
        control._getWatch(name as InternalFieldName, defaultValue as DeepPartialSkipArrayKey<TFieldValues>),
    );

    useEffect(() => control._removeUnmounted());

    return value;
}
