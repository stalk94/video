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
import "../../css/base.css";


const Buttons =({start, useStart})=> {
    const forvards = useHookstate(globalState.user.forvards);
    const ovnerState = useHookstate(globalState.ovner);

    const chek =(ovnerState)=> {
        const curForv = forvards?.get({noproxy: true});
        const find = curForv.find((elem)=> elem = ovnerState.login);

        return find;
    }
    const useForvard =()=> {
        const curState = ovnerState.get({noproxy: true});

        if(curState?.login) socket.emit('favorite', {
            peerId: globalThis.peerId,
            forvardLogin: curState.login
        });
    }


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
                <div style={{ marginLeft: '40%', display: 'flex', flexDirection: 'row' }}>
                    <Button className="button"
                        style={{ marginRight: '10px' }}
                        label='EXIT'
                        icon="pi pi-sign-out"
                        onClick={()=> useStart(false)}
                    />
                    <Button className="button"
                        icon={`pi ${chek(ovnerState.get()) ? 'pi-minus' : 'pi-plus'}`}
                        onClick={()=> useForvard()}
                    />
                    <Button className="button"
                        style={{ marginLeft: '10px' }}
                        label='NEXT'
                        icon="pi pi-forward"
                        onClick={()=> useStart(true)}
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
                <div className="VideoContainer">
                    <div className="ovnerVideo-container">
                        <video id='ovnerVideo'
                            width={'100%'}
                            height={'100%'}
                        >

                        </video>
                        <BlurCanvas
                            start={input}
                        />
                    </div>
                    <div className="myVideo-container">
                        <video id='myVideo'
                            width={'100%'}
                            height={'100%'}
                        >

                        </video>
                    </div>
                </div>
                <RightButtonsPanel />
                <Buttons 
                    start={start}
                    useStart={useSetStart}
                />
                <Chat />
            </div>
            
            <Footer
                start={start}
                useStart={useSetStart}
            />
        </div>
    );
}