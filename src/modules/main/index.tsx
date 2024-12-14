import React from 'react';
import { EVENT, send } from '../../lib/engine';
import globalState from "../../global.state";
import Footer from "./footer";
import Header from "./header";
import Chat from "./chat";
import { useDidMount, useIntervalWhen } from 'rooks';
import ButtonsPanel from "./buttons";
import BlurCanvas, { Spiner } from "./canvas";
import Indicator from "./left-panel";
import rand from "random-percentage"
import "../../css/base.css";




export default function({ peerId }) {
    const [input, setInput] = React.useState(false);        // получен ли поток от собеседника
    const [start, setStart] = React.useState(false);        // нажата мной кнопка старт


    // мы запускаем поиск
    const useSetStart =(type: boolean)=> {
        const myVideo: HTMLVideoElement = document.querySelector('#myVideo');
        const ovnerVideo: HTMLVideoElement = document.querySelector('#ovnerVideo');
        setStart(type);

        if(type) {
            navigator.mediaDevices.getUserMedia({ audio: true, video: true })
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
    // вызов бота
    const useCallBot =(data)=> {
        globalState.ovner.set(data);
        const ovnerVideo: HTMLVideoElement = document.querySelector('#ovnerVideo');

        if(data.videos[0]) {
            const curVideoSrc = data.videos[0];
            const src = gurl + `upload/${data.login}/${curVideoSrc}`;
            setStart(true);
            setInput(true);

            ovnerVideo.src = src;
            ovnerVideo.loop = true;
        }

        const minut = 1000 * 60;
        //! это будет обсераться иногда
        setTimeout(()=> {
            useNext();
        }, rand.getRandom(minut/2, minut * 2));
    }
    // вызов мы совершаем
    const useCall =(peerId: string)=> {
        const myVideo: HTMLVideoElement = document.querySelector('#myVideo');
        const ovnerVideo: HTMLVideoElement = document.querySelector('#ovnerVideo');
        delete ovnerVideo.src;
        ovnerVideo.src = '';

        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then((mediaStream)=> {	
                //звоним, указав peerId-партнера и передав свой mediaStream		  
                globalThis.peercall = peer.call(peerId, mediaStream);
                peercall.on('stream', (stream)=> {
                    //нам ответили, получим стрим
                    setTimeout(()=> {
                        ovnerVideo.srcObject = peercall.remoteStream;
                    }, 500);	
                });
                //  peercall.on('close', onCallClose);
                if(!myVideo.srcObject) {
                    myVideo.srcObject = mediaStream;
                }
            })
            .catch((err)=> { 
                console.log(err.name + ": " + err.message); 
            });
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

        delete ovnerVideo.src;
        ovnerVideo.src = '';
        delete ovnerVideo.srcObject;
        globalState.ovner.set({});
    }
    const useNext =()=> {
        if(start) socket.emit('next', {
            peerId: globalThis.peerId
        });
    }
    useDidMount(()=> {
        // нам найден собеседник (вызываем его)
        socket.on('call', (data) => {
            console.log('SERVER SEARCH CLIENT');
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
            console.log('END BOT CALL');
            useEndCall();
        });
        // видеопоток собеседника получен
        EVENT.on('input.start', ()=> {
            console.log('VIDEO INPUT SUCESS');
            setStart(true);
            setInput(true);
        });
    });
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
