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
import { OverlayPanel } from 'primereact/overlaypanel';
import { FileUpload } from 'primereact/fileupload';
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
const VideoPreview =({ data, useUpdate, setUpload })=> {
    const [duration, setDuration] = React.useState();
    const op = React.useRef(null);
    const choseOptions = {
        label: 'Выбрать', 
        icon: 'pi pi-fw pi-file',
        className: 'p-button-outlined p-button-success FileLoader'
    }

    const handleSubmit =(e, botName: string)=> {
        //event.preventDefault();
        setUpload(true);
        const url = gurl + 'upload';
        const formData = new FormData();
        formData.append('file', e.files[0]);
        formData.append('fileName', botName);
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            }
        };
        
        axios.post(url, formData, config).then((response)=> {
            console.log(response.data);
            e.options.clear();
            useUpdate();
            setUpload(false);
        });
    }
    React.useEffect(()=> {
        setDuration();
    }, [data]);
    

    return(
        <div style={{position:'relative'}}
            onMouseOver={(e)=> {
                //op.current.style.width = '200px';
                //op?.current?.play();
                //op.current.volume = 0;
            }}
            onMouseOut={()=> {
                //op.current.style.width = '150px';
                if(op?.current?.pause?.ss) {
                    op.current.pause();
                    op.current.currentTime = 0;
                    op.current.playbackRate = 3;
                }
            }}
        >
            <FileUpload
                auto
                name="file"
                url="./upload"
                accept='video/*'
                mode="basic"
                customUpload
                uploadHandler={(e)=> handleSubmit(e, data.login)}
                chooseOptions={choseOptions}
            />
            { duration &&
                <div className='TimerPreview'>
                    { Math.ceil(duration) } sec
                </div>
            }
            {data.videos[0]
                ? <video ref={op}
                    src={`upload/${data.login}/${data.videos[0]}`}
                    width='150px'
                    onLoadedMetadata={(e)=> setDuration(e.target.duration)}
                  />
                : <div>no video</div>
            }
        </div>
    );
}
const SelectDay =({ select, onChange })=> {
    return(
        <div className='SelectDayContainer'>
            {['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'].map((name, index)=> 
                <div className={`OptionDay ${select?.day===index?'SelectDay':''}`}
                    key={index}
                    onClick={()=> onChange(index, select?.login)}
                >
                    { name }
                </div>
            )}
        </div>
    );
}


export default function() {
    const op = React.useRef(null);
    const [upload, setUpload] = React.useState(false);
    const [checked, setCheked] = React.useState(false);
    const [checkedOnline, setChekedOnline] = React.useState(false);
    const [checkedCurDay, setChekedCurDay] = React.useState(0);
    const [selectDay, setSelectDay] = React.useState();
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
    const getWeekDay =(date)=> {
        const days = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

        return days[date];
    }
    const handlerSelectDay =(day, login)=> {
        useEdit('startDay', day, login);
        setSelectDay({day, login});
        op.current.hide();
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
        if(checkedOnline) {
            result = result.filter((elem)=> elem.isOnline===true);
        }
        if(checkedCurDay===0) result = result.sort((a, b)=> a.time.startDay - b.time.startDay);
        else if(checkedCurDay===1) result = result.sort((a, b)=> b.time.startDay - a.time.startDay);
        else {
            const day = new Date().getDay();
            result = result.filter((elem)=> elem.time.startDay===day);
        }

        return result;
    }
    useDidMount(()=> {
        useUpdate();
    });
    

    return(
        <div className='AdminBase'>
            { upload && <Uploader />}
            <OverlayPanel ref={op} style={{maxWidth: '60%'}}>
                <SelectDay
                    select={selectDay}
                    onChange={handlerSelectDay}
                />
            </OverlayPanel>
            <DataTable 
                scrollable
                scrollHeight="78vh"
                value={useChekedFiltre(login)}
                header={
                    <NewBot useUpdate={useUpdate} />
                }
            >
                <Column field="isOnline"
                    header={
                        <Checkbox 
                            onChange={(e)=> setChekedOnline(e.checked)} 
                            checked={checkedOnline}
                        />
                    }
                    body={(data)=> 
                        <div>
                            { data.isOnline === true
                                ? <div style={{color: 'green'}}>on</div>
                                : <div style={{color: 'red'}}>off</div>
                            }
                        </div>
                    }
                />
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
                <Column field="time.startDay"
                    header={
                        <div className='FiltreStartDay' 
                            onClick={(e)=> {
                                if(checkedCurDay===0) setChekedCurDay(1);
                                else if(checkedCurDay===1) setChekedCurDay(2);
                                else setChekedCurDay(0);
                            }}
                        >
                            {checkedCurDay===0 && <div style={{color:'#efed9f'}}>Вход 🡇</div>}
                            {checkedCurDay===1 && <div style={{color:'#e7c573'}}>Вход 🡅</div>}
                            {checkedCurDay===2 && <div style={{color:'#73e77d'}}>Вход ◉</div>}
                        </div>
                    }
                    body={(data)=> 
                        <div className='PreviewSelectDay'
                            onClick={(e)=> {
                                setSelectDay({day:data.time.startDay,login:data.login});
                                op.current.toggle(e);
                            }}
                        >
                            { getWeekDay(data.time.startDay) }
                        </div>
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
                        <VideoPreview 
                            data={data} 
                            useUpdate={useUpdate}
                            setUpload={setUpload}
                        />  
                    }
                />
                <Column header="Перекл." field="timerNext" sortable
                    body={(data)=> 
                        <InputNumber showButtons
                            size={2}
                            value={data.timerNext} 
                            onValueChange={(e)=> useEdit('timerNext', e.value, data.login)} 
                            min={15} 
                            max={300} 
                        />
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

/**
 * <InputNumber showButtons
                            size={1}
                            value={data.time.startDay} 
                            onValueChange={(e)=> useEdit('startDay', e.value, data.login)} 
                            min={0} 
                            max={6} 
                        />
 */
/**
 * <form onSubmit={(e)=> handleSubmit(e, data.login)}>
                            <input name="file" 
                                type="file"
                                accept='video/*'
                                onChange={useLoad} 
                            />
                            <button type="submit">
                                загрузить
                            </button>
                        </form>
 */
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