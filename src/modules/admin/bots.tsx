import React from 'react';
import axios from 'axios';
import { EVENT, send } from "../../lib/engine";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { IoMdFemale, IoMdMale } from "react-icons/io";
import { useDidMount, useIntervalWhen } from 'rooks';


const Uploader =()=> {
    return(
        <div className='Uploader'>
            <i className="pi pi-spin pi-spinner" id='Spiner'/>
            <var className='UploaderText'>
                идет загрузка
            </var>
        </div>
    );
}
const NewBot =({ useUpdate })=> {
    const [login, setLogin] = React.useState('');
    const [sex, setSex] = React.useState({name:'Ж',code:'fem'});
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
        state.sex = sex.code??'fem';
        state.info = {
            country: country
        }

        if(login.length > 3) {
            socket.emit('admin.botCreate', {
                peerId: globalThis.peerId,
                data: state
            });
            setTimeout(useUpdate, 500);
            setSex({name:'Ж',code:'fem'});
            setLogin('');
        }
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
            <Dropdown 
                style={{width:'100px',marginLeft: '15px'}}
                value={sex}
                options={[
                    {name:'Ж',code:'fem'},
                    {name:'М',code:'fem'}
                ]}
                onChange={(e)=> setSex(e.value)}
                optionLabel="name"
                editable 
            />
            <InputText
                size={3}
                style={{marginLeft: '5px',marginRight: '15px'}}
                placeholder='RU, UA, EE ...'
                value={country} 
                onChange={(e)=> setCountry(e.target.value)} 
            />
            <InputNumber showButtons
                size={1}
                style={{marginLeft: '5px'}}
                value={state.time.start} 
                onValueChange={(e)=> useState('start', e.value)} 
                min={0} 
                max={23} 
            />
            <InputNumber showButtons 
                size={1}
                style={{marginLeft: '5px'}}
                value={state.time.end} 
                onValueChange={(e)=> useState('end', e.value)} 
                min={0} 
                max={23} 
            />
            <Button className='p-button-success'
                style={{marginLeft: '25px'}}
                icon={"pi pi-user-plus"}
                label='Создать'
                onClick={()=> useClickNewBot()}
            />
        </div>
    );
}
const VideoPreview =({ data })=> {
    return(
        <div>
            {data.videos[0]
                ? <video 
                    src={`upload/${data.login}/${data.videos[0]}`}
                    width='150px'
                  />
                : <div>no video</div>
            }
        </div>
    );
}



export default function() {
    const [upload, setUpload] = React.useState(false);
    const [file, setFile] = React.useState();
    const [checked, setCheked] = React.useState(false);
    const [country, setCountry] = React.useState();
    const [login, setLogin] = React.useState();
    const [products, setProducts] = React.useState([]);

    const useEdit =(key: string, value: any, login: string)=> {
        const findIndex = products.findIndex((elem)=> elem.login === login);

        if(findIndex !== -1) setProducts((old)=> {
            if(key !== 'start' && key !== 'end' && key !== 'startDay' && key !== 'endDay') {
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
    const handleSubmit =(event, botName: string)=> {
        event.preventDefault();
        setUpload(true);
        const url = gurl + 'upload';
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', botName);
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            }
        };
        
        axios.post(url, formData, config).then((response)=> {
            console.log(response.data);
            useUpdate();
            setUpload(false);
        });
    }
    const useLoad =(e)=> {
        setFile(e.target.files[0]);
    }
    const getWeekDay =(date)=> {
        const days = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

        return days[date.getDay()];
    }
    const useCountryFilter =(curCountry: string)=> {
        if(country!==curCountry) setCountry(curCountry);
        else setCountry();
    }
    const useFiltre =(login)=> {
        if(!login || login.length===0) return products;
        else {
            const filters = products.filter((elem)=> 
                elem.login.includes(login) === true
            );
            return filters;
        }
    }
    const useChekedFiltre =(login)=> {
        let result = useFiltre(login);
        
        if(checked) {
            result = result.filter((elem)=> elem.videos[0]!==undefined);
        }
        if(country && country.length) {
            result = result.filter((elem)=> elem.info.country===country);
        }

        return result;
    }
    useDidMount(()=> {
        useUpdate();
    });
    

    return(
        <div className='AdminBase'>
            { upload && <Uploader />}
            <DataTable 
                value={useChekedFiltre(login)}
                header={
                    <NewBot useUpdate={useUpdate} />
                }
            >
                <Column field="login" header="Login" sortable/>
                <Column field="sex" header="Пол" sortable
                    body={(data)=> 
                        <div>
                            { data.sex === 'fem' 
                                ? <IoMdFemale style={{color: 'red', fontSize: "25px"}}/>
                                : <IoMdMale style={{color: 'blue', fontSize: "25px"}} />
                            }
                        </div>
                    }
                />
                <Column header="Страна" field="info.country"
                    body={(data)=> 
                        <div className='Country' onClick={()=> useCountryFilter(data.info.country)}>
                            { data.info.country }
                        </div>
                    }
                />
                <Column header="Лайки"
                    body={(data)=> 
                        <InputNumber showButtons
                            size={1}
                            value={data.likes} 
                            onValueChange={(e)=> useEdit('likes', e.value, data.login)} 
                            min={0}  
                        />
                    }
                />
                <Column header="День вход" field="time.startDay" sortable
                    body={(data)=> 
                        <InputNumber showButtons
                            size={1}
                            value={data.time.startDay} 
                            onValueChange={(e)=> useEdit('startDay', e.value, data.login)} 
                            min={0} 
                            max={6} 
                        />
                    }
                />
                <Column header="Время вход" field="time.start" sortable
                    body={(data)=> 
                        <InputNumber showButtons
                            size={1}
                            value={data.time.start} 
                            onValueChange={(e)=> useEdit('start', e.value, data.login)} 
                            min={0} 
                            max={23} 
                        />
                    }
                />
                <Column header="Время выход" field="time.end" sortable
                    body={(data)=> 
                        <InputNumber showButtons
                            size={1}
                            value={data.time.end} 
                            onValueChange={(e)=> useEdit('end', e.value, data.login)} 
                            min={0} 
                            max={23} 
                        />
                    }
                />
                <Column 
                    header={
                        <Checkbox 
                            onChange={(e)=> setCheked(e.checked)} 
                            checked={checked}
                        />
                    }
                    body={(data)=> 
                        <VideoPreview data={data} />
                    }
                />
                <Column 
                    header={
                        <InputText className='Filter'
                            placeholder='Поиск'
                            value={login} 
                            onChange={(e)=> setLogin(e.target.value)} 
                        />
                    }
                    body={(data)=> 
                        <form onSubmit={(e)=> handleSubmit(e, data.login)}>
                            <input name="file" 
                                type="file"
                                accept='video/*'
                                onChange={useLoad} 
                            />
                            <button type="submit">
                                загрузить
                            </button>
                        </form>
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


/*
<Column header="День выход" field="time.endDay" sortable
                    body={(data)=> 
                        <InputNumber showButtons
                            size={1}
                            value={data.time.endDay} 
                            onValueChange={(e)=> useEdit('endDay', e.value, data.login)} 
                            min={0} 
                            max={6} 
                        />
                    }
                />
**/