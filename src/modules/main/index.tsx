import React from 'react';
import { EVENT } from '../../lib/engine';
import { Peer, MediaConnection } from "peerjs";
import globalState from "../../global.state";
import { useHookstate } from '@hookstate/core';
import { Button } from 'primereact/button';
import Footer from "./footer";
import Header from "./header";
import Chat from "./chat";
import { useDidMount, useIntervalWhen } from 'rooks';
import RightButtonsPanel from "./buttons";
import BlurCanvas from "./canvas";
import Indicator from "./left-panel";
import "../../css/base.css";


const Buttons =({start, useStart})=> {
    const ovnerState = useHookstate(globalState.ovner);



    return(
        <div className='PanelButtons'>
            {!start &&
                <div style={{ marginLeft: '46%', display: 'flex', flexDirection: 'row' }}>
                    <Button className="button" id="start"
                        icon="pi pi-play"
                        onClick={()=> useStart(true)}
                    />
                </div>
            }
            { start &&
                <div style={{ marginLeft: '46%', display: 'flex', flexDirection: 'row' }}>
                    <Button className="button"
                        style={{ marginRight: '10px', paddingLeft: '12px' }}
                        icon="pi pi-stop-circle"
                        onClick={()=> useStart(false)}
                    />
                </div>
            }
        </div>
    );
}




export default function({peerId}) {
    const [input, setInput] = React.useState(false);
    const [start, setStart] = React.useState(false);

    
    const useSetStart =(type: boolean)=> {
        const myVideo: HTMLVideoElement = document.querySelector('#myVideo');
        const ovnerVideo: HTMLVideoElement = document.querySelector('#ovnerVideo');
        setStart(type);

        // начинаем смотреть
        if(type) {
            navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                .then((mediaStream)=> {	
                    ovnerVideo.srcObject = mediaStream;
                    ovnerVideo.onloadedmetadata =(e)=> {
                        ovnerVideo.play();
                    };
                })

            socket.emit('start', {
                peerId: globalThis.peerId
            });
        }
        // отключаемся
        else {
            myVideo.srcObject = undefined;
            ovnerVideo.srcObject = undefined;

            socket.emit('finish', {
                peerId: globalThis.peerId
            });
        }
    }
    // вызов мы совершаем
    const useCall =(peerId)=> {
        const myVideo: HTMLVideoElement = document.querySelector('#myVideo');
        const ovnerVideo: HTMLVideoElement = document.querySelector('#ovnerVideo');

        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then((mediaStream)=> {	
                //звоним, указав peerId-партнера и передав свой mediaStream		  
                globalThis.peercall = peer.call(peerId, mediaStream);
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
        
        if(globalThis.peercall) {
            setInput(false);
            globalThis.peercall.close();
            delete globalThis.peercall;
            delete ovnerVideo.srcObject;
            delete myVideo.srcObject;
        }
        globalState.ovner.set({});
    }
    useDidMount(()=> {
        // нам найден собеседник (вызываем его)
        socket.on('call', (data) => {
            console.log('SERVER SEARCH CLIENT');
            useCall(data.peerId);
            state.ovner.set(data.userData);
        });
        // обновились данные собеседника
        socket.on('ovner.refresh', (data)=> {
            state.ovner.set((old)=> {
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
        // видеопоток собеседника получен
        EVENT.on('input.start', ()=> {
            console.log('INPUT START');
            setInput(true);
        });
    });
    useIntervalWhen(()=> {
        console.log('REFIND CHAT');
        socket.emit('start', {peerId: peerId});
    }, 1500, (globalThis.peerCall ? false : true) && start);
    

    return(
        <div className="Base">
            <Header
                peerId={peerId}
                useCall={useCall}
            />

            <div className="Container">
                <Indicator />
                <div className="ovnerVideo-container">
                    <video id='ovnerVideo'
                        width={'100%'}
                        height={'100%'}
                    >

                    </video>
                    <BlurCanvas
                        start={start}
                    />
                </div>
                <div className="myVideo-container">
                    <video id='myVideo'
                        width={'100%'}
                        height={'100%'}
                    >

                    </video>
                </div>
                <RightButtonsPanel />
                <Buttons 
                    start={start}
                    useStart={useSetStart}
                />
                <Chat />
            </div>
            
            <Footer
                start={input}
            />
        </div>
    );
}


/**
 * <Button className="button"
                        style={{ marginLeft: '10px' }}
                        icon="pi pi-forward"
                        onClick={()=> useStart(true)}
                    />
 */