import { FilterField } from './field';
import { Filter } from './filter';
import { useFilter } from './provider';

export const Example = () => {
    const filter = useFilter<{ aboba: string; ne_aboba: string }>({
        disabled: false,
    });

    const aboba = filter.watch('aboba');

    return (
        <Filter {...filter}>
            <form>
                <FilterField
                    name='aboba'
                    render={({ field }) => (
                        <>
                            <input type='text' {...field} placeholder='test input' />
                            <div style={{ color: field.disabled ? 'gray' : 'red' }}>{field.value}</div>
                        </>
                    )}
                />
                <FilterField
                    name='ne_aboba'
                    render={({ field }) => (
                        <>
                            <input type='text' {...field} placeholder='test input' />
                            <div style={{ color: field.disabled ? 'gray' : 'red' }}>{field.value}</div>
                        </>
                    )}
                />
            </form>
            aboba: {aboba}
            <br />
            <button onClick={() => filter.reset()}>reset</button>
            <button onClick={() => console.log(filter.getValues())}>getvalues</button>
            <button
                onClick={() =>
                    console.log(
                        filter.resetField('aboba', {
                            defaultValue: 'aboba',
                        }),
                    )
                }
            >
                reset aboba
            </button>
            <button onClick={() => console.log(filter.setValue('aboba', 'aboba'))}>set aboba</button>
        </Filter>
    );
};
