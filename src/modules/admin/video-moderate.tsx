import { AdminPanesUserState, UserDataState } from "../../global.d.ts";
import React from 'react';
import { convertTime } from "../../function";
import Flag from "../../component/flag";
import { Row } from "../../component/fragments";
import { Button } from 'primereact/button';
import { Peer, MediaConnection, DataConnection } from "peerjs";
import "./video.css";
let peerAdmin: Peer, call: MediaConnection, conn: DataConnection;

type VideoModerateProps = { 
    userData: UserDataState
    useFindUserFromPeerId: (peerId: string)=> UserDataState
    onExit: ()=> void
}


export default function({ userData, onExit, useFindUserFromPeerId }: VideoModerateProps) {
    const [userCurentCall, setCurentCall] = React.useState<string>();
    const [dataUser, setDataUser] = React.useState<AdminPanesUserState>({chat:[],ipData:{}});
    const ref = React.useRef<HTMLVideoElement | null>(null);
    const [isFullWiew, setFullWiew] = React.useState(true);


    // прилетело что то от юзера по дата каналу, обработаем
    const handlerDataConnection =(data: any)=> {
        if(data.chat) setDataUser((old)=> {
            old.chat = data.chat;
            return {...old};
        });
        if(data.ipData) setDataUser((old)=> {
            old.ipData = data.ipData;
            return {...old};
        });
        if(data.curCall !== undefined) {
            if(data.curCall) setCurentCall(data.curCall);
            else setCurentCall();
        }
    }
    const useRemoteComand =(comand: 'get')=> {
        conn.send({comand: comand});
    }
    const endConnect =()=> {
        call?.close();
        conn?.close();
        call = undefined;
        conn = undefined;
        delete ref.current.srcObject;
        ref.current.srcObject = null;
    }
    const connect =(userPeerId: string)=> {
        if(!peerAdmin) {
            peerAdmin = new Peer(undefined, {
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'turn:turnserver.example.com', username: 'user', credential: 'password' },
                    ],
                },
            });
        }

        navigator.mediaDevices.getUserMedia({video:true})
            .then((media)=> {
                call = peerAdmin.call(userPeerId, media, {metadata:{isAdmin:true}});
                conn = peerAdmin.connect(userPeerId, {metadata:{isAdmin:true}});

                conn.on('data', handlerDataConnection); 
                conn.on('open', ()=> {
                    console.log('CONNECTED');
                    useRemoteComand('get');
                });  
                call.on('stream', (stream)=> {
                    ref.current.srcObject = stream;
                });
            })
    }
    React.useEffect(()=> {
        return ()=> {
            peerAdmin?.destroy();
            peerAdmin = undefined;
        }
    }, []);
    

    return(
        <div className={`WindowUserModerate ${isFullWiew ? 'fullView' : 'frameView'}`}>
            <section className="SectionLeft">
                <div className="UserModerateToolPanel">
                    <Button className="p-button-outlined p-button-help"
                        style={{marginRight: '0.5rem'}}
                        icon="pi pi-sync"
                        disabled={call?false:true}
                        onClick={()=> useRemoteComand('get')}
                    />
                    { (call && userData?.isOnline)
                        ? <Button className="p-button-outlined p-button-danger"
                            style={{marginRight: '0.5rem'}}
                            icon="pi pi-times"
                            onClick={()=> endConnect()}
                         />
                        : <Button className="p-button-outlined p-button-succes"
                            style={{marginRight: '0.5rem'}}
                            icon="pi pi-video"
                            disabled={userData?.isOnline ? false : true}
                            onClick={()=> connect(userData.peerId)}
                        />
                    }
                </div>
                <div className='UserModerateVideoContainer'>
                    <video style={{height:'100%'}}
                        width={'100%'}
                        height={'100%'}
                        controls={false}
                        autoPlay={true}
                        ref={ref}
                    />
                </div>
            </section>
            <section className="SectionRight">
                    <Button className="p-button-outlined p-button-danger"
                        icon="pi pi-power-off"
                        style={{position:'absolute', right:'0'}}
                        onClick={onExit}
                    />
                <div className="InfoBlok">
                    <Row label='Логин' value={userData?.login}/>
                    <Row label='Регистрация' value={ convertTime(userData?.timeshtampRegistration, 'D') }/>
                    <Row label='Страна' value={ 
                        <Flag margin="0px" code={dataUser.ipData?.country ?? userData?.info?.country} /> 
                    }/>
                    <Row label='Город' value={dataUser.ipData?.city}/>
                    <Row label='IP' value={dataUser.ipData?.ip}/>
                    <Row label='Координаты' value={dataUser.ipData?.loc}/>
                    <div className='IoRow' style={{ marginBottom: '0.5rem' }}>
                        <div className="RowLabel" style={{color: userCurentCall ? 'greenyellow' : '#f55656'}}>
                            Соединен:
                        </div>
                        <div style={{ marginLeft: '0.5rem', color:'white'}}>
                            { userCurentCall 
                                ? useFindUserFromPeerId(userCurentCall)?.login
                                : 'Нет' 
                            }
                        </div>
                    </div>
                </div>
                <div className="ChatBlok">
                    { dataUser.chat.map((msg, index)=> 
                        <div key={index} className='MassageContainer'>
                            <div className='MassageHeader'
                                style={{color: '#e63228'}}
                            >
                                { msg.login }:
                            </div>
                            <div className='MassageText'>
                                { msg.text }
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}