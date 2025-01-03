import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createControl, deepEqual, isFunction } from './implementation';
import { FilterState, FieldValues, FilterContextType, FilterProviderProps, UseFilterProps } from './types';
import { useSubscribe } from './use-watch';

const FilterContext = createContext<FilterContextType | null>(null);

export const FilterProvider = <TFieldValues extends FieldValues, TContext = any>(
    props: FilterProviderProps<TFieldValues, TContext>,
) => {
    const { children, ...data } = props;
    return <FilterContext.Provider value={data as unknown as FilterContextType}>{children}</FilterContext.Provider>;
};

export const useFilterContext = <TFieldValues extends FieldValues, TContext = any>() =>
    useContext(FilterContext) as FilterContextType<TFieldValues, TContext>;

export function useFilter<TFieldValues extends FieldValues = FieldValues, TContext = any>(
    props: UseFilterProps<TFieldValues, TContext> = {},
): FilterContextType<TFieldValues, TContext> {
    const _control = useRef<FilterContextType<TFieldValues, TContext> | undefined>(undefined);
    const _values = useRef<typeof props.values>(undefined);
    const [state, setState] = useState<FilterState<TFieldValues>>({
        defaultValues: isFunction(props.defaultValues) ? undefined : props.defaultValues,
        disabled: props.disabled || false,
    });

    if (!_control.current) _control.current = { ...createControl(props), filterState: state };

    const control = _control.current._control;
    control._options = props;

    useSubscribe({
        subject: control._subjects.state,
        next: () => {
            setState({ ...control._filterState });
        },
    });

    useEffect(() => control._disableFilter(props.disabled), [control, props.disabled]);

    useEffect(() => {
        if (props.values && !deepEqual(props.values, _values.current)) {
            control._reset(props.values);
            _values.current = props.values;
            setState((state) => ({ ...state }));
        } else control._resetDefaultValues();
    }, [props.values, control]);

    useEffect(() => {
        if (!control._state.mount) control._state.mount = true;
        if (control._state.watch) control._state.watch = false;

        control._removeUnmounted();
    });

    useEffect(() => {
        props.shouldUnregister &&
            control._subjects.values.next({
                values: control._getWatch(),
            });
    }, [props.shouldUnregister, control]);

    _control.current.filterState = state;

    return _control.current;
}
