import { BotDataState } from "../../global.d.ts";
import React from 'react';
import axios from 'axios';
import { SelectButton } from 'primereact/selectbutton';
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
import Flag from "../../component/flag";
import Modal from "../../component/modal";
import VideoTrimer from "../../component/video-trimer";
import { useDidMount, useIntervalWhen, useWillUnmount } from 'rooks';


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
const SelectCountry =({ select, onChange }: { select: string, onChange: (value: string)=> void })=> {
    return(
        <SelectButton
            value={select}
            options={[
                { label: <Flag code='RU' />, value: 'RU' },
                { label: <Flag code='BY' />, value: 'BY' },
                { label: <Flag code='UA' />, value: 'UA' },
                { label: <Flag code='RO' />, value: 'RO' },
                { label: <Flag code='PL' />, value: 'PL' },
                { label: <Flag code='US' />, value: 'US' },
                { label: <Flag code='GB' />, value: 'GB' },
                { label: <Flag code='CN' />, value: 'CN' },
                { label: <Flag code='IN' />, value: 'IN' },
                { label: <Flag code='DE' />, value: 'DE' },
                { label: <Flag code='ES' />, value: 'ES' },
                { label: <Flag code='EE' />, value: 'EE' },
                { label: <Flag code='FR' />, value: 'FR' },
                { label: <Flag code='IT' />, value: 'IT' },
            ]}
            onChange={(e)=> onChange(e.value)}
        />
    );
}
const NewBot =({ useUpdate }: { useUpdate: ()=> void })=> {
    const op = React.useRef<OverlayPanel | null>(null);
    const rop = React.useRef<OverlayPanel | null>(null);
    const [login, setLogin] = React.useState('');
    const [sex, setSex] = React.useState({name:'Ж',code:'fem'});
    const [selectDay, setSelectDay] = React.useState<{day:number, login:string}>();
    const [country, setCountry] = React.useState('RU');
    const [state, setState] = React.useState({
        login: '',
        time: {
            startDay: 0,
            start: 0,
            end: 23
        }
    });


    const useClickNewBot =()=> {
        state.login = login;
        state.sex = sex.code??'fem';
        state.info = {
            country: country.toUpperCase()
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
    const getWeekDay =(date: number)=> {
        const days = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

        return days[date];
    }
    const useState =(key:string, value:any)=> {
        setState((old)=> {
            if(key === 'login') old[key] = value;
            else old.time[key] = value;
            
            return old;
        });
    }
    const handlerSelectDay =(index: number, login?: string)=> {
        setSelectDay({day: index});
        useState('startDay', index);
    }


    return(
        <div style={{display: 'flex', flexDirection: 'row'}}>
            <OverlayPanel ref={op} style={{maxWidth: '60%'}}>
                <SelectCountry
                    select={country}
                    onChange={setCountry}
                />
            </OverlayPanel>
            <OverlayPanel ref={rop} style={{maxWidth: '60%'}}>
                <SelectDay
                    select={selectDay}
                    onChange={handlerSelectDay}
                />
            </OverlayPanel>
            <InputText 
                placeholder='Логин'
                value={login} 
                onChange={(e)=> setLogin(e.target.value)} 
            />
            <Dropdown 
                size={1}
                style={{width:'90px',marginLeft: '15px'}}
                value={sex}
                options={[
                    {name:'Ж',code:'fem'},
                    {name:'М',code:'m'}
                ]}
                onChange={(e)=> setSex(e.value)}
                optionLabel="name"
                editable 
            />
            <InputText
                size={2}
                style={{marginLeft: '15px'}}
                placeholder='RU, UA, EE ...'
                value={country} 
                onChange={(e)=> setCountry(e.target.value)} 
            />
            <Button className="p-button-outlined p-button-help"
                icon="pi pi-list"
                style={{marginLeft:'3px',marginRight:'15px',width:'45px',background:'#da6ae224'}}
                onClick={(e)=> op.current.toggle(e)}
            />
            <div className='PreviewSelectDay' style={{padding:'12px', paddingLeft:'26px', width:'80px'}}
                onClick={(e)=> {
                    setSelectDay({ day: state.time.startDay, login: state.login });
                    rop.current.toggle(e);
                }}
            >
                { getWeekDay(state.time.startDay) }
            </div>
            <Button className='p-button-success'
                style={{marginLeft: '25px'}}
                icon={"pi pi-user-plus"}
                label='Создать'
                onClick={()=> useClickNewBot()}
            />
        </div>
    );
}
const VideoPreview =(
    { data, useUpdate, setUpload }: 
    { data: BotDataState, useUpdate: ()=> void, setUpload: (t: boolean)=> void }
)=> {
    const [visible, setVisible] = React.useState(false);
    const [duration, setDuration] = React.useState<number>();
    const op = React.useRef<HTMLVideoElement | null>(null);
    const choseOptions = {
        label: 'load', 
        icon: 'pi pi-fw pi-file',
        className: 'p-button-outlined p-button-success FileLoader'
    }

    const useChangeVideoEditor =(newPath: string)=> {
        socket.emit('admin.readVideoBot', {
            botLogin: data.login,
            src: newPath
        });
        setVisible(false);
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
        <div style={{position:'relative',display:'flex'}}
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
            <Modal
                visible={visible}
                setVisible={()=> setVisible(false)}
                message={
                    <VideoTrimer
                        path={`upload/${data.login}/${data.videos[0]}`}
                        onComplete={useChangeVideoEditor}
                    />
                }
                header={'Редактор'}
                accept={console.log}
                reject={console.log}
                id={'video-editor'}
                footer={true}
            />
            { duration &&
                <div className='TimerPreview'>
                    { Math.ceil(duration) } sec
                </div>
            }
            { data.videos[0] &&
                <video ref={op} style={{maxHeight: '85px'}}
                    src={`upload/${data.login}/${data.videos[0]}`}
                    width='150px'
                    onLoadedMetadata={(e)=> setDuration(e.target.duration)}
                />
            }
            <div className='PanelVideo'>
                { data.videos[0] &&
                    <Button className='p-button-outlined p-button-success ButtonTrimerVideo'
                        icon={"pi pi-pencil"}
                        style={{color:'silver'}}
                        onClick={()=> setVisible(true)}
                    />
                }
                <FileUpload 
                    className="UploadFileContainer"
                    auto
                    name="file"
                    url="./upload"
                    accept='video/*'
                    mode="basic"
                    customUpload
                    uploadHandler={(e)=> handleSubmit(e, data.login)}
                    chooseOptions={choseOptions}
                />
            </div>
        </div>
    );
}
const SelectDay =(
    { select, onChange }: 
    { select: {day:number, login:string}, onChange: (index:number, login:string)=> void }
)=> {
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
const SelectSex =(
    { select, onChange }: 
    { select: {sex:'fem'|'m', login:string}, onChange: (select:'fem'|'m', login:string)=> void }
)=> {
    const chek =(index: number)=> {
        if(select?.sex==='fem' && index===0) return true;
        else if(select?.sex==='m' && index===1) return true;
    }
    const useIndex =(index: number)=> {
        if(index === 0) return 'fem';
        else return 'm';
    }

    return(
        <div className='SelectDayContainer'>
            {['Ж', 'М'].map((name, index)=> 
                <div className={`OptionDay ${chek(index)?'SelectDay':''}`}
                    style={{minWidth:'50px', minHeight:'50px'}}
                    key={index}
                    onClick={()=> onChange(useIndex(index), select?.login)}
                >
                    { name }
                </div>
            )}
        </div>
    );
}


// lazy scrollable virtualScrollerOptions={{ itemSize: 8 }}
export default function() {
    const op = React.useRef<OverlayPanel | null>(null);
    const refSex = React.useRef<OverlayPanel | null>(null);
    const [upload, setUpload] = React.useState(false);
    const [checked, setCheked] = React.useState(false);
    const [checkedOnline, setChekedOnline] = React.useState(false);
    const [checkedCurDay, setChekedCurDay] = React.useState(0);
    const [selectDay, setSelectDay] = React.useState<{day:number, login:string}>();
    const [selectSex, setSelectSex] = React.useState<{sex:'fem'|'m', login:string}>();
    const [filtreDay, setFiltreDay] = React.useState<{name:string, code:string}>({name:'нет', code:-1});
    const [country, setCountry] = React.useState<string>();
    const [login, setLogin] = React.useState<string>();
    const [products, setProducts] = React.useState<BotDataState[] | []>([]);
    
   
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

            return [...old];
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
    const useDelete =(login: string)=> {
        const findIndex = products.findIndex((elem)=> elem.login === login);

        if(findIndex !== -1) {
            socket.emit('admin.botDelete', {
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
    const getWeekDay =(date: number)=> {
        const days = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

        return days[date];
    }
    const handlerSelectDay =(day: number, login: string)=> {
        useEdit('startDay', day, login);
        setSelectDay({day, login});
        op.current.hide();
    }
    const handlerSelectSex =(sex: 'fem'|'m', login: string)=> {
        useEdit('sex', sex, login);
        setSelectSex({sex, login});
        refSex.current.hide();
    }
    const useCountryFilter =(curCountry: string)=> {
        if(country!==curCountry) setCountry(curCountry);
        else setCountry();
    }
    const useFiltre =(login: string)=> {
        if(!login || login.length===0) return products;
        else {
            const filters = products.filter((elem)=> 
                elem.login.includes(login) === true
            );
            return filters;
        }
    }
    const useChekedFiltre =(login: string)=> {
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
        if(filtreDay.code!==-1) result = result.filter((elem)=> elem.time.startDay===filtreDay.code);

        return result;
    }
    useDidMount(()=> {
        useUpdate();
        socket.on('update.bots', useUpdate);
        document.addEventListener("keydown", (ev)=> {
            if(ev.key === 'Escape') setFiltreDay({name:'нет', code:-1});
        });
    });
    useWillUnmount(()=> socket.off('update.bots', useUpdate));
    

    return(
        <div className='AdminBase'>
            { upload && <Uploader />}
            <OverlayPanel ref={op} style={{maxWidth: '60%'}}>
                <SelectDay
                    select={selectDay}
                    onChange={handlerSelectDay}
                />
            </OverlayPanel>
            <OverlayPanel ref={refSex} style={{maxWidth: '60%'}}>
                <SelectSex
                    select={selectSex}
                    onChange={handlerSelectSex}
                />
            </OverlayPanel>
            <DataTable 
                scrollHeight="83vh"
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
                    body={(data: BotDataState)=> 
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
                    body={(data: BotDataState)=> 
                        <div style={{cursor:'pointer'}} onClick={(e)=> {
                            setSelectSex({sex:data.sex,login:data.login});
                            refSex.current.toggle(e);
                        }}>
                            { data.sex === 'fem' 
                                ? <IoMdFemale style={{color: 'red', fontSize: "25px"}}/>
                                : <IoMdMale style={{color: 'blue', fontSize: "25px"}} />
                            }
                        </div>
                    }
                />
                <Column header="Страна" field="info.country"
                    body={(data: BotDataState)=> 
                        <div className='Country' onClick={()=> useCountryFilter(data.info.country)}>
                            { data.info.country }
                        </div>
                    }
                />
                <Column header="Лайки"
                    body={(data: BotDataState)=> 
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
                        <div>
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
                            <Dropdown 
                                style={{width:'90px', height:'35px',marginTop:'15px'}}
                                value={filtreDay}
                                options={(()=> {
                                    const days = ['нет', 'ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
                                    return days.map((elem, index)=> ({name: elem, code: index-1}));
                                })()}
                                onChange={(e)=> setFiltreDay(e.value)}
                                optionLabel="name"
                                editable 
                            />
                        </div>
                    }
                    body={(data: BotDataState)=> 
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
                    body={(data: BotDataState)=> 
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
                <Column header="Пустышка" field="isEmpty" sortable
                    body={(data)=> 
                        <Checkbox 
                            onChange={(e)=> useEdit('isEmpty', e.checked, data.login)} 
                            checked={data.isEmpty}
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
                            min={5} 
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
                        <div style={{display:'flex', flexDirection:'row'}}>
                            <Button className='p-button-outlined p-button-success'
                                style={{height:'4vw'}}
                                icon={"pi pi-pencil"}
                                onClick={()=> useClickButton(data.login)}
                            />
                            <Button className='p-button-outlined p-button-danger'
                                style={{height:'4vw', marginLeft:'15px'}}
                                icon={"pi pi-trash"}
                                onClick={()=> useDelete(data.login)}
                            />
                        </div>
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