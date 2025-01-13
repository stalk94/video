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
import rand from "random-percentage"
import "../../css/base.css";
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
    const useSetStart =(type: boolean, constraints?: MediaStreamConstraints)=> {
        const myVideo: HTMLVideoElement = document.querySelector('#myVideo');
        const ovnerVideo: HTMLVideoElement = document.querySelector('#ovnerVideo');
        setStart(type);

        if(type) {
            navigator.mediaDevices.getUserMedia(constraints ?? { audio: true, video: true })
                .then((mediaStream)=> {	
                    myVideo.srcObject = mediaStream;
                })

            socket.emit('start', {
                peerId: globalThis.peerId
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
    const useCall =(peerId: string, constraints?: MediaStreamConstraints)=> {
        const myVideo: HTMLVideoElement = document.querySelector('#myVideo');
        const ovnerVideo: HTMLVideoElement = document.querySelector('#ovnerVideo');
        delete ovnerVideo.src;
        ovnerVideo.src = '';
    
        navigator.mediaDevices.getUserMedia(constraints ?? { audio: true, video: true })
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
                console.log(err.name + ": " + err.message); 
            });
    }
    // вызов бота
    const useCallBot =(data)=> {
        globalState.ovner.set(data);
        const ovnerVideo: HTMLVideoElement = document.querySelector('#ovnerVideo');

        if(data.videos[0]) {
            const curVideoSrc = data.videos[0];
            const src = gurl + `upload/${data.login}/${curVideoSrc}`;
            setStart(true);
            setInput(true);

            delete ovnerVideo.srcObject;
            ovnerVideo.src = src;
            ovnerVideo.loop = true;
        }

        useClearTask();
        const minut = 1000 * 60;
        task = setTimeout(()=> {
            useNext();
        }, rand.getRandom(minut/2, minut * 2));
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
        globalState.ovner.set({});
    }
    const useNext =()=> {
        useEndCall();
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
        socket.on('endCall', (data) => {
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
    useIntervalWhen(()=> socket.emit('chek', {peerId: globalThis.peerId}), 2000, true);
    useIntervalWhen(()=> {
        if(!input) {
            console.log('REFIND!!!');
            socket.emit('start', {peerId: peerId});
        }
    }, 1500, (globalThis.peerCall ? false : true) && start);
    
    
    
    return(
        <div className="Base">
            <Header
                peerId={peerId}
                useCall={useCall}
            />

            <div className="Container">
                <Indicator />
                <div className="ovnerVideo-container" id={start ? "ovnerDark" : ""}>
                    <video id='ovnerVideo'
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
                <Chat />
            </div>

            <Footer
                start={input}
            />
        </div>
    );
}
