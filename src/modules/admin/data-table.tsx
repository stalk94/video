import React, { useRef, useState, useEffect, ComponentProps } from 'react';
import { DataTable, DataTableValueArray } from "primereact/datatable";
import styled, { css } from 'styled-components';



export type TableStyles = {
    body: {
        background: string
        borderColor: string
        textColor: string
    }
    header: {
        background: string
    }
    thead: {
        background: string
        textColor: string
    }
}
export type DataTablePropsWrapper = ComponentProps<typeof DataTable> & {
    fontSizeHead: string
    styles: TableStyles
}



// todo: стилизировать через тему
const StyledTableWrapper = styled.div<{ 
    fontSizeHead: string;
}>`
    display: flex;
    flex-direction: column;

    // прокрутка
    ::-webkit-scrollbar-track {
        background-color:#2a2a2b85;
    }
    ::-webkit-scrollbar-thumb {
        -webkit-border-radius: 3px;
        border-radius: 3px;
        background-color:#dedfdf;
        border: #333 1px solid;
    }
    ::-webkit-scrollbar-thumb {
        -webkit-border-radius: 10px;
        border-radius: 10px;
        background-color:#adadad;
    }
    ::-webkit-scrollbar {
        width: 7px;
    }


    .p-datatable {
        border-radius: 5px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        border: 1px solid;
        width: 100%;
    }
    .p-datatable-header {
        border-bottom: 1px solid #5f5f5f35;
        font-size: 18px;
        font-weight: bold;
    }
    .p-datatable-footer {
        border-top: 1px solid;
        display: flex;
        font-size: 16px;
        padding: 6px 8px;
    }
    // панель фильтры и сортировка
    .p-datatable-thead > tr > th {
        font-weight: bold;
        text-align: left;
        box-shadow: 0 4px 3px rgba(0, 0, 0, 0.08) inset, 0 3px 4px rgba(0, 0, 0, 0.06);
        backdrop-filter: blur(10px);
        white-space: nowrap;
    }
    // нечетные row 
    .p-datatable-tbody > tr:nth-child(even) {
    }
    // стили row текста 
    .p-datatable-tbody > tr {
        font-size: 16px;
        transition: background 0.2s ease-in-out;
    }
    // подсвет всей строки при наведении
    .p-datatable-tbody > tr:hover {
        //background: #3a3c52;
    }
    // при наведении на row
    .p-datatable-tbody > tr > td:hover {
        background: #3a3c52;
        cursor: pointer;
    }
    // границы row
    .p-datatable-tbody > tr > td {
        padding: 12px;
    }
    .p-datatable-tbody > tr.p-highlight {
        background: #574b90 !important;
    }
`;



/**
 * 🎁 Декоратор над PrimeReact `<DataTable>`:           
 * добавляет автоматическую подстройку высоты контейнера,       
 * сохраняя оригинальное API компонента.
 */
export default function DataTableCustom({ value, children, header, footer, fontSizeHead, styles, style, ...props }: DataTablePropsWrapper) {
    const tableRef = useRef<DataTable<DataTableValueArray>>(null);
    const [scrollHeight, setScrollHeight] = useState<string>('100%');
    const [height, setHeight] = useState<number>();
    
    

    const getPadding =(element: Element)=> {
        const style = getComputedStyle(element);
        const padding = parseFloat(style.paddingBottom);

        return padding;
    }
    const getBound =(element: Element)=> {
        const parent = element.parentElement;     // родитель
        const bound = element.getBoundingClientRect();
        const boundParent = parent.getBoundingClientRect();
        
        const maxHeight = window.innerHeight - bound.y;
        const padding = getPadding(parent) * 2;
        //console.log(window.innerHeight, boundParent.height)

        if(window.innerHeight <= boundParent.height) {
            parent.style.height = maxHeight + 'px';
            
            return maxHeight - padding;
        }
        else {
            return boundParent.height - padding;
        }
    }
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const updateHeight = () => {
            if (tableRef.current) {
                const container = tableRef.current.getElement();
                const bodyArea = tableRef.current.getTable()?.parentElement;
                const parent = container?.parentElement;

                const headerElement = container?.querySelector('.p-datatable-header');
                const footerElement = container?.querySelector('.p-datatable-footer');

                const containerHeight = container?.offsetHeight || 0;
                const headerHeight = headerElement?.offsetHeight || 0;
                const footerHeight = footerElement?.offsetHeight || 0;

                const calculatedScrollHeight = containerHeight - headerHeight - footerHeight;

                setScrollHeight(`${Math.max(calculatedScrollHeight, 50)}px`);
                setHeight(getBound(container));
            }
        };

        const debouncedUpdate = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(updateHeight, 2000);
        };

        const resizeObserver = new ResizeObserver(debouncedUpdate);

        if (tableRef.current) {
            const container = tableRef.current.getElement();
            if (container) resizeObserver.observe(container);
        }

        // Первый запуск через timeout, чтобы дождаться полной отрисовки DOM
        debouncedUpdate();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            resizeObserver.disconnect();
        };
    }, [header, footer]);
    
    
    return (
        <StyledTableWrapper 
            as="span"
            fontSizeHead={fontSizeHead}
        >
            <DataTable
                ref={tableRef}
                value={value}
                scrollable={true}
                scrollHeight={scrollHeight}
                style={{ height: '100%', width: '100%', flexGrow: 1, ...style }}
                header={header}
                footer={footer}
                {...props}
            >
                { children }
            </DataTable>
        </StyledTableWrapper>
    );
}