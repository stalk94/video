import "../../global.d.ts";
import { BotDataState } from "../../global.d.ts";
import React from 'react';
import { EVENT } from '../../lib/engine';
import globalState, { actions } from "../../global.state";
import Footer from "./footer";
import Header from "./header";
import Chat from "./chat";
import { useDidMount, useIntervalWhen } from 'rooks';
import ButtonsPanel from "./buttons";
import BlurCanvas, { Spiner } from "./canvas";
import Indicator from "./left-panel";
import { errorMedia } from "../../function";
import "../../css/base.css";
import Animations from "./animations";
import VisualCanvas from "./canvas-v";
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
    // смена настроек ввода
    const handlerSwitchMediaStream =(cfg: {reason: ()=> void, reject: ()=> void})=> {
        const myVideo: HTMLVideoElement = document.querySelector('#myVideo');

        navigator.mediaDevices.getUserMedia(globalThis.creditionals)
            .then((newStream)=> {
                if(cfg && cfg.reason) cfg.reason();
                const videoTrack = newStream.getVideoTracks()[0];
                const audioTrack = newStream.getAudioTracks()[0];
                myVideo.srcObject = newStream;

                if(globalThis.peercall) {
                    const senders = globalThis.peercall.peerConnection.getSenders();
                    const videoSender = senders.find(sender => sender.track?.kind === 'video');
                    const audioSender = senders.find(sender => sender.track?.kind === 'audio');
                    if(videoSender) videoSender.replaceTrack(videoTrack);
                    if(audioSender) audioSender.replaceTrack(audioTrack);

                    globalThis.mediaStream = newStream;
                }
            })
            .catch((res)=> {
                errorMedia(res);
                if(cfg && cfg.reject) cfg.reject();
            });
        
    }
    // мы запускаем поиск
    const useSetStart =(type: boolean)=> {
        const ovnerVideo: HTMLVideoElement = document.querySelector('#ovnerVideo');
        setStart(type);

        if(type) {
            EVENT.emit('startStream', (mediaStream)=> {

            });
        }
        // отключаемся
        else {
            setInput(false);
            ovnerVideo.srcObject = null;
            ovnerVideo.src = '';            //!
            globalState.ovner.set({});

            socket.emit('finish', {
                peerId: globalThis.peerId
            });
        }
    }
    //? вызов мы совершаем
    const useCall =(peerId: string)=> {
        const ovnerVideo: HTMLVideoElement = document.querySelector('#ovnerVideo');
        delete ovnerVideo.src;
        ovnerVideo.src = '';
    
        EVENT.emit('startStream', (mediaStream: MediaStream)=> {
            const conn = peer.connect(peerId);
            globalThis.peercall = peer.call(peerId, mediaStream);

            globalThis.peercall.on('stream', (stream) => {
                ovnerVideo.srcObject = stream;
            });
            //  peercall.on('close', onCallClose);
        });
    }
    // вызов бота
    const useCallBot =(data: BotDataState)=> {
        const ovnerVideo: HTMLVideoElement = document.querySelector('#ovnerVideo');
        useClearTask();
        //console.log('🤖 CALL BOT');
        
        if(data.videos[0] && !data.isEmpty) {
            setStart(true);
            setInput(true);
            globalState.ovner.set(data);
            const curVideoSrc = data.videos[0];
            const src = gurl + `upload/${data.login}/${curVideoSrc}`;

            delete ovnerVideo.srcObject;
            ovnerVideo.src = src;
            ovnerVideo.loop = true;

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
        }
    }
    //? завершить вызов
    const useEndCall =()=> {
        const ovnerVideo: HTMLVideoElement = document.querySelector('#ovnerVideo');
        
        if(globalThis.peercall) {
            setInput(false);
            globalThis.peercall.close();
            delete globalThis.peercall;
        }
        else {
            setInput(false);
        }

        useClearTask();
        delete ovnerVideo.src;
        ovnerVideo.src = '';
        delete ovnerVideo.srcObject;
        ovnerVideo.srcObject = null;
        globalState.ovner.set({});
    }
    //? next 
    const useNext =()=> {
        //useEndCall();
        
        if(start) socket.emit('next', {
            peerId: globalThis.peerId
        });
    }
    
    React.useEffect(()=> {
        setTimeout(()=> {
            const d = document.querySelector('.root');
            d.height = window.innerHeight - 200
        }, 1000);

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
        //EVENT.on('switchMediaStream', handlerSwitchMediaStream);
        
        return ()=> {
            socket.off('call', (data) => {
                console.log('SERVER SEARCH CLIENT');
                useClearTask();
                useCall(data.peerId);
                globalState.ovner.set(data.userData);
            });
            socket.off('call.bot', (data)=> {
                if(data.userData) useCallBot(data.userData);
            });
            socket.off('ovner.refresh', (data)=> {
                console.log('OVNER REFRESH');
                
                globalState.ovner.set((old)=> {
                    Object.keys(data).forEach((key)=> {
                        old[key] = data[key];
                    });
    
                    return old;
                });
            });
            socket.off('endCall', (data)=> {
                console.log('END CALL');
                useEndCall();
            });
            socket.off('endCall.bot', (data)=> {
                console.log('END CALL BOT');
                useEndCall();
            });
            socket.off('all.actions', (data)=> {
                actions.set(data.reverse());
            });
            socket.off('add.action', (data)=> {
                actions.set((old)=> {
                    old.unshift(data);
                    return old;
                });
            });
            EVENT.off('input.start', ()=> {
                console.log('VIDEO INPUT SUCESS');
                useClearTask();
                setStart(true);
                setInput(true);
            });
            //EVENT.off('switchMediaStream', handlerSwitchMediaStream);
        }
    }, []);
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
                    />
                    <Spiner
                        start={start}
                        input={input}
                    />
                    <BlurCanvas
                        start={start}
                    />
                </div>
                
                <div className="myVideo-container">
                    <VisualCanvas setStart={setStart} />
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


/**
 * <video id='myVideo'
                        playsInline
                        controls={false}
                        width={'100%'}
                        height={'100%'}
                        autoPlay={true}
                    />
 */