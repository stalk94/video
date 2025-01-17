import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { useDidMount } from 'rooks';
//import { DropDown } from '../component/dropDown';


const getIo =(type: 'video'|'audio')=> {
    return navigator.mediaDevices.enumerateDevices().then((devices)=> {
        const devicesFilter = devices.filter((device)=> device.kind === `${type}input`);

        return devicesFilter;
    });
}
const constructConfig =(deviceId: string, type: 'video'|'audio')=> {
    if(type === 'video') globalThis.creditionals.video = { deviceId: { exact: deviceId } };
    else globalThis.creditionals.audio = { deviceId: { exact: deviceId } };
}


export default function() {
    const [selectAudios, setSelectAudios] = React.useState(null);
    const [selectVideos, setSelectVideos] = React.useState(null);
    const [inputVideos, setInputVideos] = React.useState([]);
    const [inputAudios, setInputAudios] = React.useState([]);

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
        setSelectVideos(value);
        constructConfig(value.code, 'video');
        useStorage('video', value);
    }
    const useSelectAudio =(value)=> {
        setSelectAudios(value);
        constructConfig(value.code, 'audio');
        useStorage('audio', value);
    }
    const useStorage =(type: 'video'|'audio', value: {name:string,code:string})=> {
        localStorage.setItem(type, JSON.stringify(value));
    }
    useDidMount(()=> {
        useOptionsVideo();
        useOptionsAudio();

        const videos = localStorage.getItem('video');
        const audios = localStorage.getItem('audio');

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
            <div className='IoRow'>
                <div style={{color:'gray',marginTop:'auto',marginBottom:'auto'}}>
                    Видео input: &nbsp; &nbsp;
                </div>
                <Dropdown 
                    value={selectVideos} 
                    options={inputVideos} 
                    onChange={(e)=> useSelectVideo(e.value)} 
                    optionLabel="name" 
                    editable 
                />
            </div>
            <div className='IoRow' style={{marginTop:'5px'}}>
                <div style={{color:'gray',marginTop:'auto',marginBottom:'auto'}}>
                    Аудио output: &nbsp;
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