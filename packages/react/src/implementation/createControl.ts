import { FilterContextType } from "../types/context";
import { Control, FilterState, Names, Subjects } from "../types/control";
import { EventType } from "../types/events";
import { Field, FieldRefs, FieldValues, InternalFieldName, Ref } from "../types/field";
import { SetFieldValue, 
    UseFilterGetValues, 
    UseFilterProps, 
    UseFilterRegister, 
    UseFilterReset, 
    UseFilterResetField, 
    UseFilterSetValue, 
    UseFilterUnregister, 
    UseFilterWatch, 
    WatchInternal, 
    WatchObserver } from "../types/filter";
import { FieldPath } from "../types/path";
import { ChangeHandler, DeepPartial } from "../types/utils";
import get from "./get";
import set from "./set";
import getFieldValue, { 
    cloneObject, 
    convertToArrayPayload, 
    createSubject, 
    generateWatchOutput, 
    getEventValue, 
    getFieldValueAs, 
    isBoolean, 
    isCheckBoxInput, 
    isDateObject, 
    isEmptyObject, 
    isFunction, 
    isHTMLElement, 
    isMultipleSelect, 
    isNullOrUndefined, 
    isObject, 
    isRadioOrCheckbox, 
    isString, 
    isUndefined, 
    isWatched, 
    isWeb, 
    iterateFieldsByAction, 
    live } from "./utils";
import { EVENTS } from "../constants";

export function createControl<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
>(
  props: UseFilterProps<TFieldValues, TContext> = {},
): Omit<FilterContextType<TFieldValues, TContext>, 'filterState'> {
  let _options = {
    ...props,
  };

  let _fields: FieldRefs = {};
  let _defaultValues =
    isObject(_options.defaultValues) || isObject(_options.values)
      ? cloneObject(_options.defaultValues || _options.values) || {}
      : {};

  let _filterValues = _options.shouldUnregister
    ? {}
    : cloneObject(_defaultValues);

  let _state = {
    action: false,
    mount: false,
    watch: false,
  };

  let _filterState: FilterState<TFieldValues> = {
    disabled: _options.disabled || false,
  };

  
  let _names: Names = {
    mount: new Set(),
    disabled: new Set(),
    unMount: new Set(),
    watch: new Set(),
  };

  const _subjects: Subjects<TFieldValues> = {
    values: createSubject(),
    state: createSubject(),
  };


  const _removeUnmounted = () => {
    for (const name of _names.unMount) {
      const field: Field = get(_fields, name);

      field &&
        (field._f.refs
          ? field._f.refs.every((ref) => !live(ref))
          : !live(field._f.ref)) &&
        unregister(name as FieldPath<TFieldValues>);
    }

    _names.unMount = new Set();
  };

  const setFieldValue = (
    name: InternalFieldName,
    value: SetFieldValue<TFieldValues>
  ) => {
    const field: Field = get(_fields, name);
    let fieldValue: unknown = value;

    if (field) {
      const fieldReference = field._f;

      if (fieldReference) {
        !fieldReference.disabled &&
          set(_filterValues, name, getFieldValueAs(value, fieldReference));

        fieldValue =
          isHTMLElement(fieldReference.ref) && isNullOrUndefined(value)
            ? ''
            : value;

        if (isMultipleSelect(fieldReference.ref)) {
          [...fieldReference.ref.options].forEach(
            (optionRef) =>
              (optionRef.selected = (
                fieldValue as InternalFieldName[]
              ).includes(optionRef.value)),
          );
        } else if (fieldReference.refs) {
          if (isCheckBoxInput(fieldReference.ref)) {
            fieldReference.refs.length > 1
              ? fieldReference.refs.forEach(
                  (checkboxRef) =>
                    (!checkboxRef.defaultChecked || !checkboxRef.disabled) &&
                    (checkboxRef.checked = Array.isArray(fieldValue)
                      ? !!(fieldValue as []).find(
                          (data: string) => data === checkboxRef.value,
                        )
                      : fieldValue === checkboxRef.value),
                )
              : fieldReference.refs[0] &&
                (fieldReference.refs[0].checked = !!fieldValue);
          } else {
            fieldReference.refs.forEach(
              (radioRef: HTMLInputElement) =>
                (radioRef.checked = radioRef.value === fieldValue),
            );
          }
        } else {
          fieldReference.ref.value = fieldValue;
        }
      }
    }

  };

  const setValues = <
    T extends InternalFieldName,
    K extends SetFieldValue<TFieldValues>
  >(
    name: T,
    value: K,
  ) => {
    for (const fieldKey in value) {
      const fieldValue = value[fieldKey];
      const fieldName = `${name}.${fieldKey}`;
      const field = get(_fields, fieldName);

      (isObject(fieldValue) || (field && !field._f)) && !isDateObject(fieldValue)
        ? setValues(fieldName, fieldValue)
        : setFieldValue(fieldName, fieldValue);
    }
  };

  const setValue: UseFilterSetValue<TFieldValues> = (name, value) => {
    const cloneValue = cloneObject(value);

    set(_filterValues, name, cloneValue);

    isWatched(name, _names) && _subjects.state.next({ ..._filterState });
    _subjects.values.next({
      name: _state.mount ? name : undefined,
      values: { ..._filterValues },
    });
  };

  const onChange: ChangeHandler = async (event) => {
    _state.mount = true;
    const target = event.target;
    let name = target.name as string;
    const field: Field = get(_fields, name);
    const getCurrentFieldValue = () => target.type ? getFieldValue(field._f) : getEventValue(event);
    
   

    if (field) {
      const fieldValue = getCurrentFieldValue();
      const isBlurEvent = event.type === EVENTS.BLUR || event.type === EVENTS.FOCUS_OUT;

      set(_filterValues, name, fieldValue);

      if (isBlurEvent) field._f.onBlur && field._f.onBlur(event);
      else if (field._f.onChange) field._f.onChange(event);

      const watched = isWatched(name, _names, isBlurEvent);
      !isBlurEvent && watched && _subjects.state.next({ ..._filterState });

      !isBlurEvent &&
        _subjects.values.next({
          name,
          type: event.type,
          values: { ..._filterValues },
        });     
        
        
    }

  };

  const getValues: UseFilterGetValues<TFieldValues> = (
    fieldNames?:
      | FieldPath<TFieldValues>
      | ReadonlyArray<FieldPath<TFieldValues>>,
  ) => {
    const values = {
      ...(_state.mount ? _filterValues : _defaultValues),
    };

    return isUndefined(fieldNames)
      ? values
      : isString(fieldNames)
        ? get(values, fieldNames)
        : fieldNames.map((name) => get(values, name));
  };

  const _getWatch: WatchInternal<TFieldValues> = (
    names,
    defaultValue,
    isGlobal,
  ) =>
    generateWatchOutput(
      names,
      _names,
      {
        ...(_state.mount
          ? _filterValues
          : isUndefined(defaultValue)
            ? _defaultValues
            : isString(names)
              ? { [names]: defaultValue }
              : defaultValue),
      },
      isGlobal,
      defaultValue,
    );

  const watch: UseFilterWatch<TFieldValues> = (
    name?:
      | FieldPath<TFieldValues>
      | ReadonlyArray<FieldPath<TFieldValues>>
      | WatchObserver<TFieldValues>,
    defaultValue?: DeepPartial<TFieldValues>,
  ) =>
    isFunction(name) 
      ? _subjects.values.subscribe({
        next: (payload) =>
            name(
                _getWatch(undefined, defaultValue),
                payload as {
                  name?: FieldPath<TFieldValues>;
                  type?: EventType;
                  value?: unknown;
                },
              )
            })
      :  _getWatch(
        name as InternalFieldName | InternalFieldName[],
        defaultValue,
        true,
      )

  const unregister: UseFilterUnregister<TFieldValues> = (name) => {
    for (const fieldName of name ? convertToArrayPayload(name) : _names.mount) 
        _names.mount.delete(fieldName);
    

    _subjects.values.next({
      values: { ..._filterValues },
    });
  };

  const _updateDisabledField: Control<TFieldValues>['_updateDisabledField'] = ({
    disabled,
    name,
  }) => {
    if ( (isBoolean(disabled) && _state.mount) || !!disabled || _names.disabled.has(name) ) 
        disabled ? _names.disabled.add(name) : _names.disabled.delete(name);
  };

    const updateValue = (
        name: InternalFieldName,
        shouldSkipSetValueAs: boolean,
        value?: unknown,
        ref?: Ref,
    ) => {
        const field: Field = get(_fields, name);

        if (field) {
        const defaultValue = get(
            _filterValues,
            name,
            isUndefined(value) ? get(_defaultValues, name) : value,
        );

        isUndefined(defaultValue) ||
        (ref && (ref as HTMLInputElement).defaultChecked) ||
        shouldSkipSetValueAs
            ? set(
                _filterValues,
                name,
                shouldSkipSetValueAs ? defaultValue : getFieldValue(field._f),
            )
            : setFieldValue(name, defaultValue);
        }
    };

    const register: UseFilterRegister<TFieldValues> = (name, options = {}) => {
        let field = get(_fields, name);
        const disabledIsDefined =
        isBoolean(options.disabled) || isBoolean(_options.disabled);

        set(_fields, name, {
        ...(field || {}),
        _f: {
            ...(field && field._f ? field._f : { ref: { name } }),
            name,
            mount: true,
            ...options,
        },
        });
        _names.mount.add(name);

        if (field) _updateDisabledField({
            disabled: isBoolean(options.disabled)
            ? options.disabled
            : _options.disabled,
            name,
        });
        else updateValue(name, true, options.value);
      

        return {
        ...(disabledIsDefined
            ? { disabled: options.disabled || _options.disabled }
            : {}),
        name,
        onChange,
        onBlur: onChange,
        ref: (ref: HTMLInputElement | null): void => {
            if (ref) {
              register(name, options);
              field = get(_fields, name);

              const fieldRef = isUndefined(ref.value)
                  ? ref.querySelectorAll
                  ? (ref.querySelectorAll('input,select,textarea')[0] as Ref) || ref
                  : ref
                  : ref;
              const radioOrCheckbox = isRadioOrCheckbox(fieldRef);
              const refs = field._f.refs || [];

              if (
                  radioOrCheckbox
                  ? refs.find((option: Ref) => option === fieldRef)
                  : fieldRef === field._f.ref
              ) return;
              

              set(_fields, name, {
                  _f: {
                  ...field._f,
                  ...(radioOrCheckbox
                      ? {
                          refs: [
                          ...refs.filter(live),
                          fieldRef,
                          ...(Array.isArray(get(_defaultValues, name)) ? [{}] : []),
                          ],
                          ref: { type: fieldRef.type, name },
                      }
                      : { ref: fieldRef }),
                  },
              });

              updateValue(name, false, undefined, fieldRef);
            } else {
              field = get(_fields, name, {});

              if (field._f) field._f.mount = false;
              

              (_options.shouldUnregister || options.shouldUnregister) && _state.action &&_names.unMount.add(name);
            }
        },
        };
    };


  const resetField: UseFilterResetField<TFieldValues> = (name, options = {}) => {
    if (get(_fields, name)) {
        if (isUndefined(options.defaultValue)) setValue(name, cloneObject(get(_defaultValues, name)));
        else {
            setValue(
              name,
              options.defaultValue as Parameters<typeof setValue<typeof name>>[1],
            );
            set(_defaultValues, name, cloneObject(options.defaultValue));
        }
    }

    _subjects.state.next({ ..._filterState });
  };

  const _reset: UseFilterReset<TFieldValues> = (filterValues) => {
    const updatedValues = filterValues ? cloneObject(filterValues) : _defaultValues;
    const cloneUpdatedValues = cloneObject(updatedValues);
    const isEmptyResetValues = isEmptyObject(filterValues);
    const values = isEmptyResetValues ? _defaultValues : cloneUpdatedValues;


    if (isWeb && isUndefined(filterValues)) {
        for (const name of _names.mount) {
            const field = get(_fields, name);
            if (field && field._f) {
                const fieldReference = Array.isArray(field._f.refs)
                ? field._f.refs[0]
                : field._f.ref;

                if (isHTMLElement(fieldReference)) {
                    const form = fieldReference.closest('form');
                    if (form) {
                        form.reset();
                        break;
                    }
                }
            }
        }
    }

    _fields = {};
    

    _filterValues = _options.shouldUnregister
    ? cloneObject(_defaultValues)
    : cloneObject(values);


    _subjects.values.next({
    values: { ...values },
    });
    

    _names = {
      mount: new Set(),
      unMount: new Set(),
      disabled: new Set(),
      watch: new Set(),
      watchAll: false,
      focus: '',
    };
    
    _state.watch = !!_options.shouldUnregister;

  };

  const reset: UseFilterReset<TFieldValues> = (values) =>
    _reset(
      isFunction(values)
        ? (values as Function)(_filterValues as TFieldValues)
        : values
    );

  const _resetDefaultValues = () =>
    isFunction(_options.defaultValues) &&
    (_options.defaultValues as Function)().then((values: TFieldValues) => {
        reset(values);
    });

  const _disableFilter = (disabled?: boolean) => {
    if (isBoolean(disabled)) {
        _subjects.state.next({ disabled });
        iterateFieldsByAction(
            _fields,
            (ref, name) => {
                const currentField: Field = get(_fields, name);
                if (currentField) {
                    ref.disabled = currentField._f.disabled || disabled;

                    if (Array.isArray(currentField._f.refs)) {
                        currentField._f.refs.forEach((inputRef) => {
                        inputRef.disabled = currentField._f.disabled || disabled;
                        });
                    }
                }
            },
            0,
            false,
            );
        }
    };

  return {
    _control: {
        register,
        unregister,
        _getWatch,
        _removeUnmounted,
        _updateDisabledField,
        _reset,
        get _filterState() {
          return _filterState;
        },
        set _filterState(value) {
          _filterState = value;
        },
        get _fields() {
            return _fields;
        },
        get _filterValues() {
            return _filterValues;
        },
        get _state() {
            return _state;
        },
        set _state(value) {
            _state = value;
        },
        get _defaultValues() {
            return _defaultValues;
        },
        get _names() {
            return _names;
        },
        set _names(value) {
            _names = value;
        },
        get _options() {
            return _options;
        },
        set _options(value) {
            _options = {
                ..._options,
                ...value,
            };
        },
        _subjects,
        _resetDefaultValues,
        _disableFilter,
    },
    watch,
    setValue,
    getValues,
    reset,
    resetField,
  };
}