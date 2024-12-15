import React from 'react';
import { EVENT, send } from "../../lib/engine";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { useDidMount, useIntervalWhen } from 'rooks';



export default function() {
    const [products, setProducts] = React.useState([]);

    const useEdit =(key: string, value: any, login: string)=> {
        const findIndex = products.findIndex((elem)=> elem.login === login);

        if(findIndex !== -1) setProducts((old)=> {
            if(key !== 'start' && key !== 'end') {
                old[findIndex][key] = value;
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
            socket.emit('admin.userRead', {
                peerId: globalThis.peerId,
                data: products[findIndex]
            });
            setTimeout(useUpdate, 400);
        }
    }
    const useUpdate =()=> {
        send("getAllUsers", {}, "POST").then((data)=> {
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
            >
                <Column field="login" header="Login"/>
                <Column header="Страна"
                    body={(data)=> 
                        <div>
                            { data.info?.country }
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
                <Column header="Coins"
                    body={(data)=> 
                        <InputNumber showButtons
                            value={data.money} 
                            onValueChange={(e)=> useEdit('money', e.value, data.login)} 
                            min={0}  
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