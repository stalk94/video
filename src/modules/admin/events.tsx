import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { EVENT, send } from "../../lib/engine";
import { useDidMount, useIntervalWhen } from 'rooks';


const Header =({ useUpdate })=> {
    const [header, setHeader] = React.useState('');
    const [text, setText] = React.useState('');

    const useCreate =()=> {
        if(header.length > 3 && text.length > 5) {
            socket.emit('admin.eventAdd', {
                peerId: globalThis.peerId,
                data: {
                    header: header,
                    text: text
                }
            });
            setTimeout(useUpdate, 500);
        }
        else EVENT.emit('error', {text: 'Заголовок менее 3х символов либо текст менее 5!'});
    }

    return(
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <InputText
                    placeholder='Заголовок'
                    value={header}
                    onChange={(e)=> setHeader(e.target.value)}
                />
                <InputTextarea 
                    placeholder='Текст'
                    rows={3} 
                    cols={50} 
                    value={text} 
                    onChange={(e)=> setText(e.target.value)} 
                />
            </div>
            <Button className='p-button-success'
                style={{marginLeft: '20px'}}
                icon={"pi pi-plus"}
                onClick={()=> useCreate()}
            />
        </div>
    );
}


export default function() {
    const [products, setProducts] = React.useState([]);

    const useTimeFormat =(timeshtamp: number)=> {
        const time = new Date(timeshtamp);
        const dmy = `${time.getDay()}.${time.getMonth()}.${time.getFullYear()} `;
        const hm = `${time.getHours()}:${time.getMinutes()}`;

        return(
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <var>
                    { dmy }
                </var>
                <var style={{color:'gray', marginLeft:'5px'}}>
                    { hm }
                </var>
            </div>
        );
    }
    const useUpdate =()=> {
        send("getAllEvents", {}, "POST").then((data)=> {
            setProducts(Object.values(data));
        });
    }
    useDidMount(()=> {
        useUpdate();
    });


    return(
        <div className='AdminBase'>
            <DataTable 
                value={products.reverse()}
                header={
                    <Header useUpdate={useUpdate}/>
                }
            >
                <Column field="timeshtamp" header="Время" sortable
                    body={(data)=> 
                        <div>
                            { useTimeFormat(data.timeshtamp) }
                        </div>
                    }
                />
                <Column field="author" header="Автор"/>
                <Column field="header" header="Заголовок"/>
                <Column field="text" header="Текст"/>
            </DataTable>
        </div>
    );
}