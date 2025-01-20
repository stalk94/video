import { UserDataState } from "../../global.d.ts";
import React from 'react';
import { EVENT, send } from "../../lib/engine";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { IoMdFemale, IoMdMale } from "react-icons/io";
import { useDidMount, useIntervalWhen } from 'rooks';



export default function() {
    const [login, setLogin] = React.useState<string>();
    const [country, setCountry] = React.useState<string>();
    const [products, setProducts] = React.useState<UserDataState[] | []>([]);

    const chek =(userData: UserDataState)=> {
        if(userData.googleData) {
            return `${userData.googleData.name} ${userData.googleData.familyName}`;
        }
        else return userData.login;
    }
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
            const copy = products[findIndex];
            if(copy.googleData) copy.login = copy.googleData.id;

            socket.emit('admin.userRead', {
                peerId: globalThis.peerId,
                data: copy
            });
            setTimeout(useUpdate, 400);
        }
    }
    const useUpdate =()=> {
        send("getAllUsers", {}, "POST").then((data)=> {
            const result = [];
            Object.values(data).forEach((user, index)=> {
                if(user.googleData) user.login = chek(user);
                result.push(user);
            });
            setProducts(result);
        });
    }
    const useCountryFilter =(curCountry: string)=> {
        if(country!==curCountry) setCountry(curCountry);
        else setCountry();
    }
    const useFiltre =(login: string)=> {
        let result = products;

        if(!login || login.length===0) result = products;
        else {
            result = result.filter((elem)=> 
                elem.login.includes(login) === true
            );
        }
        if(country && country.length) {
            result = result.filter((elem)=> elem?.info?.country===country);
        }

        return result;
    }
    useDidMount(()=> {
        useUpdate();
    });


    return(
        <div className='AdminBase'>
            <DataTable 
                scrollable
                scrollHeight="78vh"
                value={useFiltre(login)}
                header={
                    <InputText className='Filter'
                        placeholder='Поиск'
                        value={login}
                        onChange={(e)=> setLogin(e.target.value)}
                    />
                }
            >
                <Column sortable field="login" header="Login"/>
                <Column field="sex" header="Пол" sortable
                    body={(data: UserDataState)=>
                        <div>
                            {data.sex === 'fem'
                                ? <IoMdFemale style={{ color: 'red', fontSize: "25px" }} />
                                : <IoMdMale style={{ color: 'blue', fontSize: "25px" }} />
                            }
                        </div>
                    }
                />
                <Column sortable header="Страна" field="info.country"
                    body={(data: UserDataState)=> 
                        <div className='Country' onClick={()=> useCountryFilter(data.info.country)}>
                            { data.info?.country }
                        </div>
                    }
                />
                <Column header="Лайки"
                    body={(data: UserDataState)=> 
                        <InputNumber showButtons
                            size={3}
                            value={data.likes} 
                            onValueChange={(e)=> useEdit('likes', e.value, data.login)} 
                            min={0}  
                        />
                    }
                />
                <Column sortable header="Coins" field="coins"
                    body={(data: UserDataState)=> 
                        <InputNumber showButtons
                            size={3}
                            value={data.money} 
                            onValueChange={(e)=> useEdit('money', e.value, data.login)} 
                            min={0}  
                        />
                    }
                />
                <Column 
                    body={(data: UserDataState)=> 
                        <Button className='p-button-outlined p-button-success'
                            style={{height:'4vw'}}
                            icon={"pi pi-pencil"}
                            onClick={()=> useClickButton(data.login)}
                        />
                    }
                />
            </DataTable>
        </div>
    );
}