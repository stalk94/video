import React from 'react';
import { EVENT, send } from "../../lib/engine";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { useDidMount, useIntervalWhen } from 'rooks';


const NewBot =({ useUpdate })=> {
    const [login, setLogin] = React.useState('');
    const [country, setCountry] = React.useState('RU');
    const [state, setState] = React.useState({
        login: '',
        time: {
            start: 0,
            end: 23
        }
    });


    const useClickNewBot =()=> {
        state.login = login;
        state.info = {
            country: country
        }

        if(login.length > 3) socket.emit('admin.botCreate', {
            peerId: globalThis.peerId,
            data: state
        });
        else EVENT.emit('error', {text: 'Логин менее 3х символов'});
    }
    const useState =(key, value)=> {
        setState((old)=> {
            if(key === 'login') old[key] = value;
            else old.time[key] = value;
            
            return old;
        });
    }


    return(
        <div style={{display: 'flex', flexDirection: 'row'}}>
            <InputText 
                placeholder='Логин'
                value={login} 
                onChange={(e)=> setLogin(e.target.value)} 
            />
            <InputText
                style={{marginLeft: '5px'}}
                placeholder='RU, UA, EE ...'
                value={country} 
                onChange={(e)=> setCountry(e.target.value)} 
            />
            <InputNumber showButtons
                style={{marginLeft: '5px'}}
                value={state.time.start} 
                onValueChange={(e)=> useState('start', e.value)} 
                min={0} 
                max={23} 
            />
            <InputNumber showButtons 
                style={{marginLeft: '5px'}}
                value={state.time.end} 
                onValueChange={(e)=> useState('end', e.value)} 
                min={0} 
                max={23} 
            />
            <Button className='p-button-success'
                style={{marginLeft: '20px'}}
                icon={"pi pi-user-plus"}
                onClick={()=> useClickNewBot()}
            />
        </div>
    );
}


export default function() {
    const [products, setProducts] = React.useState([]);

    const useEdit =(key: string, value: any, login: string)=> {
        const findIndex = products.findIndex((elem)=> elem.login === login);

        if(findIndex !== -1) setProducts((old)=> {
            if(key !== 'start' && key !== 'end') {
                old[findIndex][key] = value;
            }
            else if(key === 'country') {
                old[findIndex].info.country = value;
            }
            else {
                old[findIndex].time[key] = value;
            }

            return old;
        });
    }
    const useClickButton =(login: string)=> {
        const findIndex = products.findIndex((elem)=> elem.login === login);
        
        if(findIndex !== -1) {
            socket.emit('admin.botRead', {
                peerId: globalThis.peerId,
                data: products[findIndex]
            });
            setTimeout(useUpdate, 400);
        }
    }
    const useUpdate =()=> {
        send("getAllBot", {}, "POST").then((data)=> {
            setProducts(Object.values(data));
        });
    }
    useDidMount(()=> {
        useUpdate();
    });


    return(
        <div className='AdminBase'>
            <DataTable 
                value={products}
                header={
                    <NewBot useUpdate={useUpdate} />
                }
            >
                <Column field="login" header="Login"/>
                <Column header="Страна"
                    body={(data)=> 
                        <div>
                            { data.info.country }
                        </div>
                    }
                />
                <Column header="Лайки"
                    body={(data)=> 
                        <InputNumber showButtons
                            value={data.likes} 
                            onValueChange={(e)=> useEdit('likes', e.value, data.login)} 
                            min={0}  
                        />
                    }
                />
                <Column header="Время вход"
                    body={(data)=> 
                        <InputNumber showButtons
                            value={data.time.start} 
                            onValueChange={(e)=> useEdit('start', e.value, data.login)} 
                            min={0} 
                            max={23} 
                        />
                    }
                />
                <Column header="Время выход"
                    body={(data)=> 
                        <InputNumber showButtons
                            value={data.time.end} 
                            onValueChange={(e)=> useEdit('end', e.value, data.login)} 
                            min={0} 
                            max={23} 
                        />
                    }
                />
                <Column 
                    body={(data)=> 
                        <Button className="button"
                            icon={"pi pi-pencil"}
                            onClick={()=> useClickButton(data.login)}
                        />
                    }
                />
            </DataTable>
        </div>
    );
}