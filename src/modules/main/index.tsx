import "../../global.d.ts";
import { BotDataState } from "../../global.d.ts";
import React from 'react';
import { EVENT, send } from '../../lib/engine';
import globalState, { actions } from "../../global.state";
import Footer from "./footer";
import Header from "./header";
import Chat from "./chat";
import { useDidMount, useIntervalWhen } from 'rooks';
import ButtonsPanel from "./buttons";
import BlurCanvas, { Spiner } from "./canvas";
import Indicator from "./left-panel";
import rand from "random-percentage";
import { checkCameraPermission, errorMedia } from "../../function";
import "../../css/base.css";
import Animations from "./animations";
let task;



export default function({ peerId }) {
    const [input, setInput] = React.useState(false);        // получен ли поток от собеседника
    const [start, setStart] = React.useState(false);        // нажата мной кнопка старт


    const useClearTask =()=> {
        if(task) {
            clearTimeout(task);
            task = undefined;
        }
    }
    // мы запускаем поиск
    const useSetStart =(type: boolean)=> {
        const myVideo: HTMLVideoElement = document.querySelector('#myVideo');
        const ovnerVideo: HTMLVideoElement = document.querySelector('#ovnerVideo');
        setStart(type);

        if(type) {
            navigator.mediaDevices.getUserMedia(globalThis.creditionals)
                .then((mediaStream)=> {	
                    myVideo.srcObject = mediaStream;
                    myVideo.volume = 0;
                    socket.emit('start', {
                        peerId: globalThis.peerId
                    });
                })
                .catch((err)=> {
                    errorMedia(err);
                    setStart(false);
                });
        }
        // отключаемся
        else {
            setInput(false);
            myVideo.srcObject = undefined;
            ovnerVideo.srcObject = undefined;
            ovnerVideo.src = '';
            globalState.ovner.set({});

            socket.emit('finish', {
                peerId: globalThis.peerId
            });
        }
    }
    // вызов мы совершаем
    const useCall =(peerId: string)=> {
        const myVideo: HTMLVideoElement = document.querySelector('#myVideo');
        const ovnerVideo: HTMLVideoElement = document.querySelector('#ovnerVideo');
        delete ovnerVideo.src;
        ovnerVideo.src = '';
    
        navigator.mediaDevices.getUserMedia(globalThis.creditionals)
            .then((mediaStream)=> {	
                //звоним, указав peerId-партнера и передав свой mediaStream		  
                globalThis.peercall = peer.call(peerId, mediaStream);
                peercall.on('stream', (stream)=> {
                    //нам ответили, получим стрим
                    setTimeout(()=> {
                        ovnerVideo.srcObject = peercall.remoteStream;
                    }, 1000);	
                });
                //  peercall.on('close', onCallClose);
                if(!myVideo.srcObject) {
                    myVideo.volume = 0;
                    myVideo.srcObject = mediaStream;
                }
            })
            .catch((err)=> {
                errorMedia(err);
                setStart(false);
            });
    }
    // вызов бота
    const useCallBot =(data: BotDataState)=> {
        const myVideo: HTMLVideoElement = document.querySelector('#myVideo');
        const ovnerVideo: HTMLVideoElement = document.querySelector('#ovnerVideo');
        useClearTask();
        
        if(data.videos[0] && !data.isEmpty) {
            setStart(true);
            setInput(true);
            globalState.ovner.set(data);
            const curVideoSrc = data.videos[0];
            const src = gurl + `upload/${data.login}/${curVideoSrc}`;

            delete ovnerVideo.srcObject;
            ovnerVideo.src = src;
            ovnerVideo.loop = true;
            myVideo.volume = 0;

            task = setTimeout(()=> {
                socket.emit('next', {
                    peerId: globalThis.peerId
                });
            }, data.timerNext * 1000);
        }
        else if(data.isEmpty) {
            setStart(true);
            setInput(true);
            globalState.ovner.set(data);

            delete ovnerVideo.srcObject;
            ovnerVideo.src = '';
            ovnerVideo.loop = true;
            myVideo.volume = 0;
        }
    }
    // завершить вызов
    const useEndCall =()=> {
        const myVideo: HTMLVideoElement = document.querySelector('#myVideo');
        const ovnerVideo: HTMLVideoElement = document.querySelector('#ovnerVideo');
        
        if(globalThis.peercall) {
            setInput(false);
            globalThis.peercall.close();
            delete globalThis.peercall;
            delete myVideo.srcObject;
        }
        else {
            setInput(false);
            delete myVideo.srcObject;
        }

        useClearTask();
        delete ovnerVideo.src;
        ovnerVideo.src = '';
        delete ovnerVideo.srcObject;
        ovnerVideo.srcObject = null;
        globalState.ovner.set({});
    }
    const useNext =()=> {
        //useEndCall();
        
        if(start) socket.emit('next', {
            peerId: globalThis.peerId
        });
    }

    useDidMount(()=> {
        // нам найден собеседник (вызываем его)
        socket.on('call', (data) => {
            console.log('SERVER SEARCH CLIENT');
            useClearTask();
            useCall(data.peerId);
            globalState.ovner.set(data.userData);
        });
        // ботяра показывает свои видео
        socket.on('call.bot', (data)=> {
            if(data.userData) useCallBot(data.userData);
        });
        // обновились данные собеседника
        socket.on('ovner.refresh', (data)=> {
            console.log('OVNER REFRESH');
            
            globalState.ovner.set((old)=> {
                Object.keys(data).forEach((key)=> {
                    old[key] = data[key];
                });

                return old;
            });
        });
        // кто то разорвал звонок
        socket.on('endCall', (data)=> {
            console.log('END CALL');
            useEndCall();
        });
        // ботяра разрыв соединения
        socket.on('endCall.bot', (data)=> {
            console.log('END CALL BOT');
            useEndCall();
        });

        // все события юзера
        socket.on('all.actions', (data)=> {
            actions.set(data.reverse());
        });
        // новое событие
        socket.on('add.action', (data)=> {
            actions.set((old)=> {
                old.unshift(data);
                return old;
            });
        });
        // видеопоток собеседника получен
        EVENT.on('input.start', ()=> {
            console.log('VIDEO INPUT SUCESS');
            useClearTask();
            setStart(true);
            setInput(true);
        });
        
    });
    useIntervalWhen(()=> {
        if(!input && !globalThis.peercall) {
            console.log('REFIND!!!');
            socket.emit('start', {peerId: peerId});
        }
    }, 1500, (globalThis.peercall ? false : true) && start);
    
    
    
    return(
        <div className="Base">
            <Header
                peerId={peerId}
                useCall={useCall}
            />
            <div className="Container">
                <Indicator />
                <div className="ovnerVideo-container" id={start ? "ovnerDark" : ""}>
                    <Animations />
                    <video id='ovnerVideo'
                        playsInline
                        controls={false}
                        width={'100%'}
                        height={'100%'}
                        autoPlay={true}
                    >

                    </video>
                    <Spiner
                        start={start}
                        input={input}
                    />
                    <BlurCanvas
                        start={start}
                    />
                </div>
                
                <div className="myVideo-container">
                    <video id='myVideo'
                        playsInline
                        controls={false}
                        width={'100%'}
                        height={'100%'}
                        autoPlay={true}
                    >

                    </video>
                </div>

                <ButtonsPanel 
                    start={start}
                    useStart={useSetStart}
                    useNext={useNext}
                />
                <Chat start={start} />
            </div>
            <Footer input={input} />
        </div>
    );
}
