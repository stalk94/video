import React from 'react';
import { Button } from 'primereact/button';
import Footer from "./footer";
import Header from "./header";
import Chat from "./chat";
import "../css/base.css";
import { useIntervalWhen } from 'rooks';


export default function({useCall}) {
    const [start, setStart] = React.useState(false);


    const useSetStart =(type: boolean)=> {
        setStart(type);

        // начинаем смотреть
        if(type) {
            socket.emit('start', {
                peerId: globalThis.peerId
            });
        }
        // отключаемся
        else {
            socket.emit('finish', {
                peerId: globalThis.peerId
            });
        }
    }
    useIntervalWhen(()=> {
        console.log('REFIND CHAT');
        socket.emit('start', {peerId: globalThis.peerId});
    }, 1500, (globalThis.peerCall ? false : true) && start);


    return(
        <React.Fragment>
            <header>
                <Header
                    useCall={useCall}
                />
            </header>
            <div className="chat-container">
                <Chat />
            </div>

            <div className="ovnerVideo-container">
                <video id='ovnerVideo'
                    width={'90%'}
                    height={'100%'}
                >

                </video>
            </div>
            <div className="myVideo-container">
                <video id='myVideo'
                    width={'100%'}
                    height={'100%'}
                >

                </video>
            </div>
            
            <footer>
                <Footer 
                    start={start}
                    useStart={useSetStart}
                />
            </footer>
        </React.Fragment>
    );
}