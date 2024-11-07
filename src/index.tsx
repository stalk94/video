import "primereact/resources/themes/lara-dark-blue/theme.css";
import "primereact/resources/primereact.min.css";
import 'primeicons/primeicons.css';
import React from 'react';
import { io } from "socket.io-client";
import { EVENT, send } from "./lib/engine";
import globalState from "./global.state";
import { createRoot } from 'react-dom/client'
import { useHookstate } from '@hookstate/core';
import { Peer, MediaConnection } from "peerjs";
import { useDidMount } from "rooks";
import { Toast } from 'primereact/toast';
import Base from "./component/base";
import Loader from "./component/loader";
import "./css/index.css";


var peercall: MediaConnection;
globalThis.peerCall;
globalThis.peerId;
const peer = new Peer();
const icon = {
    sucess: "✔️",
    error: "🛑",
    warn: "💡"
}


function App() {
    const state = useHookstate(globalState);
    const toast = React.useRef(null);
    const [view, setView] = React.useState<'base'|'load'>('load');

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
    // проверим сессию
    const chekSessionToken =(socket, peerId: string)=> {
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
    // прием входящего
    const callanswer =()=> {
        const myVideo: HTMLVideoElement = document.querySelector('#myVideo');
        const ovnerVideo: HTMLVideoElement = document.querySelector('#ovnerVideo');

        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then((mediaStream)=> {
                peercall.answer(mediaStream); // отвечаем на звонок и передаем свой медиапоток собеседнику
                //peercall.on ('close', onCallClose); //можно обработать закрытие-обрыв звонка
                
                //помещаем собственный медиапоток в объект видео (чтоб видеть себя)
                myVideo.srcObject = mediaStream;
                myVideo.onloadedmetadata =(e)=> {
                    //запускаем воспроизведение, когда объект загружен
                    myVideo.play();
                };
                setTimeout(()=> {
                    //входящий стрим помещаем в объект видео для отображения
                    ovnerVideo.srcObject = peercall.remoteStream;
                    ovnerVideo.onloadedmetadata =(e)=> {
                        // и запускаем воспроизведение когда объект загружен
                        ovnerVideo.play();
                    };
                }, 1500);

            })
            .catch((err)=> { 
                console.log(err.name + ": " + err.message); 
            });
    }
    // вызов
    const useCall =(peerId)=> {
        const myVideo: HTMLVideoElement = document.querySelector('#myVideo');
        const ovnerVideo: HTMLVideoElement = document.querySelector('#ovnerVideo');

        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then((mediaStream)=> {	
                //звоним, указав peerId-партнера и передав свой mediaStream		  
                peercall = peer.call(peerId, mediaStream);
                globalThis.peerCall = peercall;
                peercall.on('stream', (stream)=> {
                    //нам ответили, получим стрим
                    setTimeout(()=> {
                        ovnerVideo.srcObject = peercall.remoteStream;
                        ovnerVideo.onloadedmetadata =(e)=> {
                            ovnerVideo.play();
                        }
                    }, 1500);	
                });
                //  peercall.on('close', onCallClose);
                myVideo.srcObject = mediaStream;
                myVideo.onloadedmetadata =(e)=> {
                    myVideo.play();
                };
            })
            .catch((err)=> { 
                console.log(err.name + ": " + err.message); 
            });
    }
    // завершить вызов
    const useEndCall =()=> {
        const myVideo: HTMLVideoElement = document.querySelector('#myVideo');
        const ovnerVideo: HTMLVideoElement = document.querySelector('#ovnerVideo');
        
        if(peercall) {
            peercall.close();
            delete globalThis.peerCall;
            delete ovnerVideo.srcObject;
            delete myVideo.srcObject;
        }
        state.ovner.set({});
    }
    useDidMount(()=> {
        EVENT.on('error', (data)=> {
            showToast('error', 'Ошибка!', data.text);
        });
        EVENT.on('success', (data)=> {
            showToast('success', 'Успешно!', data.text);
        });
        

        peer.on('open', (peerID)=> {
            globalThis.peerId = peerID;

            globalThis.socket = io(globalThis.gurl, {
                transports: ["websocket"],
                withCredentials: false,
                auth: {
                    peerId: peerID
                }
            });

            socket.on('call', (data)=> {
                useCall(data.peerId);
                state.ovner.set(data.userData);
            });
            socket.on('data.ovner', (data)=> {
                state.ovner.set(data.userData);
            });
            socket.on('endCall', (data)=> {
                useEndCall();
            });
            socket.on('autorize.sucess', (data)=> {
                setView('base');
                window.localStorage.setItem('TOKEN', data.token);
                state.user.set(data.user);
            });
            socket.on('refreshed', (data)=> {
                state.user.set((oldState)=> {
                    Object.keys(data).map((key)=> {
                        oldState[key] = data[key];
                    });

                    return oldState;
                });
            });

            chekSessionToken(socket, peerID);
		});

        // нам звонок
        peer.on('call', (call)=> {
            peercall = call;
            callanswer();
        });
    });


    return(
        <React.Fragment>
            <Toast style={{
                    width: '35%',
                    fontSize: window.innerWidth > 1300 ? '13px' : '11px'
                }} 
                ref={toast} 
            />
            { view==='base' && <Base useCall={useCall}/> }
            { view==='load' && <Loader useAuth={useAuth}/> }
        </React.Fragment>
    );
}



//------------------------------------------------------------------------
window.onload =()=> createRoot(document.querySelector(".root")).render(
    <App/>
);
window.addEventListener("beforeunload", ()=> {
    send('exit', {peerId: peerId});
});