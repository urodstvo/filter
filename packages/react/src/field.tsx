import { useCallback, useEffect, useMemo, useRef } from "react"
import { useFilterContext } from "./provider"

import { Field, FieldProps, FieldValues, InternalFieldName, UseFieldProps, UseFieldReturn } from "./types/field"
import { FieldPath, FieldPathValue } from "./types/path"
import { cloneObject, getEventValue, isBoolean, isUndefined } from "./implementation/utils";
import get from "./implementation/get";
import set from "./implementation/set";
import { EVENTS } from "./constants";
import { useWatch } from "./useWatch";


function useField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: UseFieldProps<TFieldValues, TName>,
): UseFieldReturn<TFieldValues, TName> {
  const ctx = useFilterContext<TFieldValues>();
  const control = ctx._control
  const { name, disabled, shouldUnregister } = props;

  const value = useWatch({
    control,
    name,
    defaultValue: get(
      control._filterValues,
      name,
      get(control._defaultValues, name, props.defaultValue),
    ),
    exact: true,
  }) as FieldPathValue<TFieldValues, TName>;

  const _registerProps = useRef(
    control.register(name, {
      ...props.rules,
      value,
      ...(isBoolean(props.disabled) ? { disabled: props.disabled } : {}),
    }),
  );

  const onChange = useCallback(
    (event: any) =>
      _registerProps.current.onChange({
        target: {
          value: getEventValue(event),
          name: name as InternalFieldName,
        },
        type: EVENTS.CHANGE,
      }),
    [name],
  );

  const onBlur = useCallback(
    () =>
      _registerProps.current.onBlur({
        target: {
          value: get(control._filterValues, name),
          name: name as InternalFieldName,
        },
        type: EVENTS.BLUR,
      }),
    [name, control._filterValues],
  );

  const ref = useCallback(
    (elm: any) => {
      const field = get(control._fields, name);

      if (field && elm) {
        field._f.ref = {
          focus: () => elm.focus(),
          select: () => elm.select(),
          setCustomValidity: (message: string) =>
            elm.setCustomValidity(message),
          reportValidity: () => elm.reportValidity(),
        };
      }
    },
    [control._fields, name],
  );

  const field = useMemo(
    () => ({
        ...(isBoolean(disabled) 
          ? { disabled: disabled }
          : {}),
      name,
      value,
      onChange,
      onBlur,
      ref,
    }),
    [name, disabled, onChange, onBlur, ref, value],
  );

  useEffect(() => {
    const _shouldUnregisterField =
      control._options.shouldUnregister || shouldUnregister;

    const updateMounted = (name: InternalFieldName, value: boolean) => {
      const field: Field = get(control._fields, name);

      if (field && field._f) {
        field._f.mount = value;
      }
    };

    updateMounted(name, true);

    if (_shouldUnregisterField) {
      const value = cloneObject(get(control._options.defaultValues, name));
      set(control._defaultValues, name, value);
      if (isUndefined(get(control._filterValues, name))) {
        set(control._filterValues, name, value);
      }
    }

    control.register(name);

    return () => {_shouldUnregisterField      
        ? control.unregister(name)
        : updateMounted(name, false);
    };
  }, [name, control, shouldUnregister]);

  useEffect(() => {
    control._updateDisabledField({
      disabled,
      name,
    });
  }, [disabled, name, control]);

  return useMemo(() => ({ field }), [field]);
}


export const FilterField = <
        TFieldValues extends FieldValues = FieldValues,
        TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    >(props: FieldProps<TFieldValues, TName>) => {
        return props.render(useField<TFieldValues, TName>(props));
    }