import { UserDataState } from "../../global.d.ts";
import React from 'react';
import { EVENT, send } from "../../lib/engine";
import ModerateUser from "./video-moderate";
import { Checkbox } from 'primereact/checkbox';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { IoMdFemale, IoMdMale } from "react-icons/io";
import { WiMoonAltNew } from "react-icons/wi";
import { useDidMount } from 'rooks';



export default function() {
    const [login, setLogin] = React.useState<string>();
    const [country, setCountry] = React.useState<string>();
    const [checkedOnline, setChekedOnline] = React.useState(false);
    const [viewModeratePanel, setViewModeratePanel] = React.useState();
    const [products, setProducts] = React.useState<UserDataState[] | []>([]);

    const chek =(userData: UserDataState)=> {
        if(userData.googleData) {
            return `${userData.googleData.name} ${userData.googleData.familyName}`;
        }
        else return userData.login;
    }
    const findUserFromPeerId =(peerId: string)=> {
        return products.find((user)=> user.peerId === peerId);
    }
    const useAvatar =(userState: UserDataState)=> {
        if(userState.avatar) return gurl + userState.avatar;
        else if(userState?.googleData?.img) return userState.googleData.img;
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
        if(checkedOnline) {
            result = result.filter((elem)=> elem.isOnline===true);
        }

        return result;
    }
    useDidMount(()=> {
        useUpdate();
    });


    return(
        <div className='AdminBase'>
            { viewModeratePanel &&
                <ModerateUser 
                    userData={viewModeratePanel}
                    onExit={()=> setViewModeratePanel()}
                    useFindUserFromPeerId={findUserFromPeerId}
                />
            }
            <DataTable 
                //lazy
                //scrollable
                //virtualScrollerOptions={{ itemSize: 10 }}
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
                <Column field="avatar" 
                    header={
                        <Checkbox
                            onChange={(e)=> setChekedOnline(e.checked)}
                            checked={checkedOnline}
                        />
                    }
                    body={(data: UserDataState)=>
                        <div>
                            { data.isOnline && <WiMoonAltNew className="OnlineIcon" style={{color:'green',position:'absolute'}}/> }
                            <img style={{border:'1px solid #97919157',borderRadius:'5px',maxHeight:'85px'}}
                                src={ useAvatar(data) }
                                onError={(e)=> e.target.src = gurl + '/img/non-avatar.jpg'}
                                width='45px'
                            />
                        </div>
                    }
                />
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
                        <React.Fragment>
                            <Button className='p-button-outlined p-button-success'
                                style={{height:'4vw'}}
                                icon={"pi pi-pencil"}
                                onClick={()=> useClickButton(data.login)}
                            />
                            <Button className='p-button-outlined p-button-succes'
                                style={{height:'4vw', marginLeft:'15px'}}
                                icon={"pi pi-search"}
                                disabled={globalThis.peerId === data.peerId}
                                onClick={()=> setViewModeratePanel(data)}
                            />
                        </React.Fragment>
                    }
                />
            </DataTable>
        </div>
    );
}