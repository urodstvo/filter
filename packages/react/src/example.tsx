import { FilterField } from './field';
import { Filter } from './filter';
import { FilterForm } from './form';
import { FilterList } from './list';
import { FilterReset } from './reset';

const list = [
    {
        id: 1,
        name: 'Bob',
    },
    {
        id: 2,
        name: 'Cock',
    },
    {
        id: 3,
        name: 'Dick',
    },
]

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
                <div style={{
                    display: 'flex',
                    gap: 16
                }}>

                <FilterList 
                    initialList={list}
                    callback={({initialList, filterValues}) => {
                        return initialList.filter(item => item.name.toLowerCase().includes(filterValues.aboba?.toLowerCase()))
                    }}
                    render={(list) => {
                        return <>
                            {list.map(item => {
                                return <div key={item.id}>{item.name}</div>
                            })}
                        </>
                    }}
                    />
                <FilterList 
                    initialList={list}
                    callback={({initialList, filterValues}) => {
                        return initialList.filter(item => item.name.toLowerCase().includes(filterValues.aboba?.toLowerCase()))
                    }}
                    render={(_, prev) => {
                        return <>
                            {prev?.map(item => {
                                return <div key={item.id} style={{color: 'red'}}>{item.name}</div>
                            })}
                        </>
                    }}
                    />
                    </div>
                <FilterReset render={({ onClick }) => <button onClick={onClick}>Reset</button>} />
                <FilterReset
                    fieldName='ne_aboba'
                    render={({ onClick }) => <button onClick={onClick}>Reset ne_aboba</button>}
                />
            </Filter>
        </main>
    );
};
