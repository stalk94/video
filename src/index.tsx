import "./global.d.ts";
import "primereact/resources/themes/md-dark-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import '@mantine/core/styles.css';
import 'primeicons/primeicons.css';
import { createTheme, MantineProvider } from '@mantine/core';
import React from 'react';
import { checkCameraPermission, errorMedia } from "./function";
import { io, Socket } from "socket.io-client";
import { EVENT, send } from "./lib/engine";
import globalState from "./global.state";
import { createRoot } from 'react-dom/client'
import { useHookstate } from '@hookstate/core';
import { Peer } from "peerjs";
import { useDidMount, useIntervalWhen } from "rooks";
import { Toast } from 'primereact/toast';
import Base from "./modules/main/index";
import Loader from "./modules/load";
import Admin from "./modules/admin/index";
import "./css/index.css";
import "./css/hearts.css";
import "./css/button.css";
import "./sw.js";
//import "./pwa.js";


globalThis.peercall;
globalThis.peerId;
globalThis.peer = new Peer();
globalThis.creditionals = { audio: true, video: true };
const icon = {
    sucess: "✔️",
    error: "🛑",
    warn: "💡"
}


function App() {
    const state = useHookstate(globalState);
    const toast = React.useRef<Toast | null>(null);
    const [peerID, setPeerId] = React.useState<string>();
    const [view, setView] = React.useState<'base'|'load'|'admin'>('base');
    

    const init =()=> {
        const constructConfig =(deviceId: string, type: 'video'|'audio')=> {
            if(type === 'video') globalThis.creditionals.video = { deviceId: { exact: deviceId } };
            else globalThis.creditionals.audio = { deviceId: { exact: deviceId } };
        }

        const videos = localStorage.getItem('video');
        const audios = localStorage.getItem('audio');

        if(videos) constructConfig(JSON.parse(videos).code, 'video');
        if(audios) constructConfig(JSON.parse(audios).code, 'audio');
    }
    const showToast =(type:'error'|'success'|'warn', title:string, text:string)=> {
        toast.current.clear();
        toast.current.show({
            severity: type, 
            summary: <>{ icon[type] }{ title }</>, 
            detail: text, 
            life: 3000
        });
    }
    const useAuth =(login: string, password: string)=> {
        if(socket) socket.emit('auth', {
            login: login,
            password: password,
            peerId: globalThis.peerId
        });
        else console.error('нет соединения с сокетом');
    }
    // прием входящего
    const callanswer =()=> {
        console.log('📞 CALL ANSWER!!!');
        const myVideo: HTMLVideoElement = document.querySelector('#myVideo');
        const ovnerVideo: HTMLVideoElement = document.querySelector('#ovnerVideo');
        delete ovnerVideo.src;
        ovnerVideo.src = '';

        navigator.mediaDevices.getUserMedia(globalThis.creditionals)
            .then((mediaStream)=> {
                peercall.answer(mediaStream); // отвечаем на звонок и передаем свой медиапоток собеседнику
                //peercall.on ('close', onCallClose); //можно обработать закрытие-обрыв звонка
                
                //помещаем собственный медиапоток в объект видео (чтоб видеть себя)
                myVideo.srcObject = mediaStream;
                myVideo.volume = 0;
                setTimeout(()=> {
                    //входящий стрим помещаем в объект видео для отображения
                    ovnerVideo.srcObject = peercall.remoteStream;
                    EVENT.emit('input.start', {});
                }, 1000);

            })
            .catch(errorMedia);
    }
    // проверим сессию
    const chekSessionToken =(socket: Socket, peerId: string)=> {
        const token = window.localStorage.getItem('TOKEN');
        
        if(token) {
            // пробуем вытащить сессию
            socket.emit('session', {
                token: token,
                peerId: peerId
            });
        }
        // токена нет в хранилище
        else setView('load');
    }
    useDidMount(()=> {
        EVENT.on('error', (data)=> {
            showToast('error', 'Ошибка!', data.text);
        });
        EVENT.on('success', (data)=> {
            showToast('success', 'Успешно!', data.text);
        });
        EVENT.on('exit', (data)=> {
            setView('load');
            localStorage.removeItem('TOKEN');
            state.set({});
        });
        // настройки изменены
        EVENT.on('inputChange', ()=> {
            
        });
        
        socket.on('data.ovner', (data)=> {
            state.ovner.set(data.userData);
        });
        // авторизация успещно
        socket.on('autorize.sucess', (data)=> {
            setView('base');
            window.localStorage.setItem('TOKEN', data.token);
            state.user.set(data.user);
        });
        // сессия не совпадает
        socket.on('autorize.filed', (data)=> {
            setView('load');
            localStorage.removeItem('TOKEN');
        });
        // обновился стейт юзера
        socket.on('refreshed', (data)=> {
            state.user.set((oldState)=> {
                Object.keys(data).map((key)=> {
                    oldState[key] = data[key];
                });

                return oldState;
            });
        });
        // оповещения от сервера
        socket.on('info', (data)=> {
            showToast('success', data.title, data.text);
        });
        // оповещения от сервера warning
        socket.on('warn', (data)=> {
            showToast('warn', data.title, data.text);
        });

        peer.on('open', (peerID)=> {
            globalThis.peerId = peerID;
            setPeerId(peerID);
            chekSessionToken(socket, peerID);
		});
        // нам звонок
        peer.on('call', (call)=> {
            EVENT.emit('callanswer', call);
            globalThis.peercall = call;
            callanswer();
        });

        window.addEventListener("keydown", (e)=> {
            const permision = state.user.permision.get();
            
            if(permision && permision > 0 && e.key==='*') {
                setView((old)=> {
                    if(old !== 'admin') return 'admin';
                    else return 'base';
                });
            }
        });

        init();
    });
    useIntervalWhen(()=> {
        if(socket) socket.emit('chek', {peerId: globalThis.peerId});
    }, 2000, view==='load' ? false : true);


    return(
        <MantineProvider theme={{}}>
            <div className="rootTop">
                <Toast style={{
                        width: '35%',
                        fontSize: window.innerWidth > 1300 ? '13px' : '11px'
                    }} 
                    ref={toast} 
                />
                { view==='admin' && <Admin />}
                { view==='base' && <Base peerId={peerID} /> }
                { view==='load' && <Loader useAuth={useAuth} /> }
            </div>
            <div id="heart-container"></div>
        </MantineProvider>
    );
}



//------------------------------------------------------------------------
window.onload =()=> createRoot(document.querySelector(".root")).render(
    <App/>
);
globalThis.socket = io(globalThis.gurl, {
    transports: ["websocket"],
    withCredentials: false,
});
window.addEventListener("beforeunload", ()=> {
    send('exit', {peerId: peerId});
});