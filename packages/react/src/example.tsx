import { FilterField } from './field';
import { Filter } from './filter';
import { FilterForm } from './form';
import { FilterReset } from './reset';

export const Example = () => {
    return (
        <main
            style={{
                width: '100%',
                minHeight: '90vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: 12,
                margin: 0,
                padding: 0,
            }}
        >
            <Filter>
                <FilterForm
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <FilterField
                        name='aboba'
                        defaultValue='test'
                        render={({ field }) => (
                            <>
                                <input type='text' {...field} placeholder='test input' />
                                <div style={{ color: field.disabled ? 'gray' : 'red' }}>{field.value}</div>
                            </>
                        )}
                    />
                    <FilterField
                        name='ne_aboba'
                        defaultValue=''
                        render={({ field }) => (
                            <>
                                <input type='text' {...field} placeholder='test input' />
                                <div style={{ color: field.disabled ? 'gray' : 'red' }}>{field.value}</div>
                            </>
                        )}
                    />
                </FilterForm>
                <FilterReset render={({ onClick }) => <button onClick={onClick}>Reset</button>} />
                <FilterReset
                    fieldName='ne_aboba'
                    render={({ onClick }) => <button onClick={onClick}>Reset ne_aboba</button>}
                />
            </Filter>
        </main>
    );
};
