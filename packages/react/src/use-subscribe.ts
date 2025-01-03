import { useEffect, useRef } from 'react';
import { Subject } from './types';

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
