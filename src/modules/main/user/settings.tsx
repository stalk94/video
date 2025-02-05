import React from 'react';
import { EVENT } from '../../../lib/engine';
import { Dropdown } from 'primereact/dropdown';
import { SelectButton } from 'primereact/selectbutton';
import { useDidMount } from 'rooks';
import { useTranslation } from 'react-i18next';
import Flag from "../../../component/flag";


const constructConfig =(deviceId: string, type: 'video' | 'audio')=> {
    if(type === 'video') globalThis.creditionals.video = { deviceId: { exact: deviceId } };
    else globalThis.creditionals.audio = { deviceId: { exact: deviceId } };
}


export default function() {
    const [selectLang, setSelectLang] = React.useState('GB');
    const [selectAudios, setSelectAudios] = React.useState();
    const [selectVideos, setSelectVideos] = React.useState();
    const [inputVideos, setInputVideos] = React.useState([]);
    const [inputAudios, setInputAudios] = React.useState([]);
    const { t, i18n } = useTranslation();

    const getIo =(type: 'video'|'audio')=> {
        return navigator.mediaDevices.enumerateDevices().then((devices)=> {
            const devicesFilter = devices.filter((device)=> device.kind === `${type}input`);
    
            return devicesFilter;
        });
    }
    const useOptionsVideo =()=> {
        const newArr = [];

        getIo('video').then((data)=> {
            data.forEach((elem)=> {
                newArr.push({
                    name: elem.label,
                    code: elem.deviceId
                })
            });

            setInputVideos(newArr);
        });
    }
    const useOptionsAudio =()=> {
        const newArr = [];

        getIo('audio').then((data)=> {
            data.forEach((elem)=> {
                newArr.push({
                    name: elem.label,
                    code: elem.deviceId
                })
            });

            setInputAudios(newArr);
        });
    }
    const useSelectVideo =(value)=> {
        const dump = structuredClone(globalThis.creditionals);
        constructConfig(value.code, 'video');

        EVENT.emit('switchMediaStream', {
            reason: ()=> {
                console.log('OK');
                setSelectVideos(value);
                useStorage('video', value);
            },
            reject: ()=> {
                console.log('not OK');
                globalThis.creditionals = dump;
            }
        });
    }
    const useSelectAudio =(value)=> {
        const dump = structuredClone(globalThis.creditionals);
        constructConfig(value.code, 'audio');

        EVENT.emit('switchMediaStream', {
            reason: ()=> {
                console.log('OK');
                setSelectAudios(value);
                useStorage('audio', value);
            },
            reject: ()=> {
                console.log('not OK');
                globalThis.creditionals = dump;
            }
        });
    }
    const useSelectLang =(value: "GB" | "RU" | "CN" | "DE")=> {
        setSelectLang(value);
        i18n.changeLanguage(value);
        globalThis.lang = value;
        localStorage.setItem('LANGUAGE', value);
    }
    const useStorage =(type: 'video'|'audio', value: {name:string,code:string})=> {
        localStorage.setItem(type, JSON.stringify(value));
    }
    useDidMount(()=> {
        useOptionsVideo();
        useOptionsAudio();

        const lang = localStorage.getItem('LANGUAGE');
        const videos = localStorage.getItem('video');
        const audios = localStorage.getItem('audio');

        if(lang) {
            setSelectLang(lang);
        }
        if(videos) {
            setSelectVideos(JSON.parse(videos));
            //constructConfig(JSON.parse(videos).code, 'video');
        }
        if(audios) {
            setSelectAudios(JSON.parse(audios));
            //constructConfig(JSON.parse(audios).code, 'audio');
        }
    });


    return(
        <div className='IO'>
            <div className='IoRow' style={{marginTop:'0.6rem'}}>
                <div id="labelSettings">
                    { t('settings_lang_label') }
                </div>
                <SelectButton style={{width:'100%'}}
                    value={selectLang} 
                    options={[
                        {label: <Flag code='RU'/>, value: 'RU'},
                        {label: <Flag code='GB'/>, value: 'GB'},
                        {label: <Flag code='CN'/>, value: 'CN'},
                        {label: <Flag code='DE'/>, value: 'DE'},
                    ]} 
                    onChange={(e)=> useSelectLang(e.value)}
                />
            </div>
            <div className='IoRow' style={{marginTop:'1rem'}}>
                <div id="labelSettings">
                    { t('settings_video_label') }
                </div>
                <Dropdown
                    value={selectVideos} 
                    options={inputVideos} 
                    onChange={(e)=> useSelectVideo(e.value)} 
                    optionLabel="name" 
                    editable 
                />
            </div>
            <div className='IoRow' style={{marginTop:'0.6rem'}}>
                <div id="labelSettings">
                    { t('settings_audio_label') }
                </div>
                <Dropdown 
                    value={selectAudios} 
                    options={inputAudios} 
                    onChange={(e)=> useSelectAudio(e.value)} 
                    optionLabel="name" 
                    editable 
                />
            </div>
        </div>
    );
}