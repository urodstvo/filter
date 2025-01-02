import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Example } from './example';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Example />
    </StrictMode>,
);

/**
 * <Filter>
 *   <FilterOptions>
 *     <FilterField
 *      type="text"
 *      name="search"
 *      defaultValue=""
 *      render={({field}) => {
 *        return <input {...field} placeholder='Search' />
 *      }}
 *    />
 *   </FilterOptions>
 *   <FilterList
 *     initialList={initialList}
 *     callback={callback}
 *     render={({list}) => {
 *       return <>
 *          {list.map()}
 *       </>
 *     }}
 *   />
 * </Filter>
 *
 *
 *
 *
 */
