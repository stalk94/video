import './lib/i18n';
import "./global.d.ts";
import "./css/theme.css";
import "primereact/resources/primereact.min.css";
import '@mantine/core/styles.css';
import 'primeicons/primeicons.css';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { MantineProvider } from '@mantine/core';
import React from 'react';
import ReactGA from 'react-ga4';
import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import { errorMedia, getIp, translateText } from "./function";
import { io, Socket } from "socket.io-client";
import { EVENT, send } from "./lib/engine";
import globalState from "./global.state";
import { createRoot } from 'react-dom/client';
import { useHookstate } from '@hookstate/core';
import { Peer, MediaConnection } from "peerjs";
import { SuccessPage, CancelPage } from "./modules/pays/stripe";
import { useDidMount, useIntervalWhen } from "rooks";
import { Toast } from 'primereact/toast';
import Modal from "./component/modal";
import Base from "./modules/main/index";
import Loader from "./modules/load";
import Admin from "./modules/admin/index";
import { useTranslation, I18nextProvider } from 'react-i18next';
import "./css/index.css";
import "./css/hearts.css";
import "./css/button.css";
import "./sw.js";


globalThis.peer = new Peer({
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'turn:turnserver.example.com', username: 'user', credential: 'password' },
        ],
    },
});
globalThis.creditionals = { audio: true, video: true };


function App() {
    const state = useHookstate(globalState);
    const toast = React.useRef<Toast | null>(null);
    const [peerID, setPeerId] = React.useState<string>();
    const [isClearSystem, setClearSystem] = React.useState(false);
    const [view, setView] = React.useState<'base'|'load'|'admin'>('base');
    const { t, i18n } = useTranslation();
    

    const init =()=> {
        const useDefaultLang =()=> {
            getIp((ipData)=> {
                if(ipData.country && languages.find((elem)=> elem===ipData.country)) {
                    i18n.changeLanguage(ipData.country);
                    localStorage.setItem('LANGUAGE', ipData.country);
                    globalThis.lang = ipData.country;
                }
                else if(ipData?.country === 'UA') {
                    i18n.changeLanguage('RU');
                    localStorage.setItem('LANGUAGE', 'RU');
                    ipData.country = 'RU';
                }
                else {
                    i18n.changeLanguage('GB');
                    localStorage.setItem('LANGUAGE', 'GB');
                    ipData.country = 'GB';
                }
            });
        }
        const constructConfig =(deviceId: string, type: 'video'|'audio')=> {
            if(type === 'video') globalThis.creditionals.video = { deviceId: { exact: deviceId } };
            else globalThis.creditionals.audio = { deviceId: { exact: deviceId } };
        }

        const lang = localStorage.getItem('LANGUAGE');
        const videos = localStorage.getItem('video');
        const audios = localStorage.getItem('audio');
        
        if(videos) constructConfig(JSON.parse(videos).code, 'video');
        if(audios) constructConfig(JSON.parse(audios).code, 'audio');
        if(lang) {
            globalThis.lang = lang;
            i18n.changeLanguage(lang);
        }
        else useDefaultLang();
    }
    const showToast =(type:'error'|'success'|'warn', title:string, text:string)=> {
        const icon = {
            sucess: "✔️",
            error: "🛑",
            warn: "💡"
        }

        toast.current.clear();
        toast.current.show({
            severity: type, 
            summary: <>{ icon[type] }{ title }</>, 
            detail: text, 
            life: 3000
        });
    }
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
    // прием входящего
    const callanswer =(call: MediaConnection)=> {
        console.log('📞 CALL ANSWER!!!');
        const ovnerVideo: HTMLVideoElement = document.querySelector('#ovnerVideo');
        delete ovnerVideo.src;
        ovnerVideo.src = '';
        globalThis.peercall = call;

        EVENT.emit('startStream', (mediaStream)=> {
            peercall.answer(mediaStream);

            setTimeout(()=> {
                //входящий стрим помещаем в объект видео для отображения
                ovnerVideo.srcObject = peercall.remoteStream;
                EVENT.emit('input.start', undefined);
                globalThis?.twoLine?.dataConnection?.send({curCall: peercall?.peer});
            }, 500);
        });
    }
    const answerTwoLine =(call: MediaConnection)=> {
        // только для админов пока
        if(call.metadata?.isAdmin && globalThis.mediaStream) {
            globalThis.twoLine = call;
            globalThis.twoLine.answer(globalThis.mediaStream);
            globalThis.twoLine?.dataConnection?.send({curCall: (peercall?.peer ?? false)});
            
            globalThis.twoLine.on('close', ()=> {
                globalThis.twoLine?.dataConnection?.close();
                globalThis.twoLine?.close();
                delete globalThis.twoLine;
            });
        }
        // соединений активных нет
        else if(call.metadata?.isAdmin) {
            if(false) navigator.mediaDevices.getUserMedia(globalThis.creditionals)
                .then((mediaStream)=> {
                    globalThis.twoLine = call;
                    globalThis.twoLine.answer(mediaStream);
                    globalThis.twoLine?.dataConnection?.send({curCall: false});
                    
                    globalThis.twoLine.on('close', ()=> {
                        globalThis.twoLine?.dataConnection?.close();
                        globalThis.twoLine?.close();
                        delete globalThis.twoLine;
                    });
                })
        }
    }
    
    useDidMount(()=> {
        EVENT.on('error', (data)=> {
            translateText(data.text, globalThis.lang)
                .then((text)=> 
                    showToast('error', t('error'), text)
                )
                .catch(()=> showToast('error', t('error'), data.text));
                
            ReactGA.event({
                label: 'Ошибка',
                category: 'События',
                action: 'Error massage toast'
            });
        });
        EVENT.on('success', (data)=> {
            translateText(data.text, globalThis.lang)
                .then((text)=> 
                    showToast('success', t('info_label'), text)
                )
                .catch(()=> showToast('success', t('info_label'), data.text));
        });
        EVENT.on('exit', (data)=> {
            setView('load');
            localStorage.removeItem('TOKEN');
            state.set({});

            ReactGA.event({
                action: 'Выход',
                category: 'Основное'
            });
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
            setClearSystem(false);

            socket.emit('chek', {
                peerId: globalThis.peerId, 
                actionsGetAll: true
            });
            ReactGA.set({ userId: data.user.login });
        });
        // сессия не совпадает
        socket.on('autorize.filed', (data)=> {
            setView('load');
            localStorage.removeItem('TOKEN');
            setClearSystem(false);
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
            if(data.type) showToast('success', t('info_label'), t(data.type));
            else {
                translateText(data.text, globalThis.lang)
                    .then((text)=> 
                        showToast('success', t('info_label'), text)
                    )
                    .catch(()=> showToast('success', t('info_label'), data.text));
            }
        });
        // оповещения от сервера warning
        socket.on('warn', (data)=> {
            if(data.type) showToast('warn', t('warn_label'), t(data.type));
            else {
                translateText(data.text, globalThis.lang)
                    .then((text)=> 
                        showToast('warn', t('warn_label'), text)
                    )
                    .catch(()=> showToast('warn', t('warn_label'), data.text));
            }
        });
        // сервер разьединил [исключил из онлайн списка]
        socket.on('system.clear', ()=> {
            console.log('Сервер исключил из online list');
            setClearSystem(true);
        });
        // сервер разьединил [система безопасности]
        socket.on('kikc', (data)=> {
            console.log('KICK SERVER');
            setView('load');
            localStorage.removeItem('TOKEN');
        });

        peer.on('open', (peerID)=> {
            console.log(`%cPEERID: %c${peerID}`, "color: gray", "color: green");
            globalThis.peerId = peerID;
            setPeerId(peerID);
            chekSessionToken(socket, peerID);
		});
        //! нам звонок
        peer.on('call', (call)=> {
            if(view === 'base' && globalThis.peercall) {
                console.log('Вторая линия!');
                //answerTwoLine(call);
            }
            else if(view === 'base' && call.metadata?.isAdmin) {
                console.log('admin connect');
                //answerTwoLine(call);
            }

            if(view === 'base') {
                EVENT.emit('callanswer', call);
                callanswer(call);

                ReactGA.event('CALL_ANSWER');
            }
        });
        // соединение с дата каналом установлено
        peer.on('connection', (conn)=> {
            conn.on('data', (data) => {
                console.log("datachanel: ", data);
                if(globalThis.twoLine) globalThis.twoLine.dataConnection = conn;

                if(data && data?.comand==='get') {
                    getIp((ipData)=> {
                        conn.send({
                            ipData: ipData, 
                            chat: globalThis.chatCopy ?? []
                        });
                    })
                }
            });
        });

        // проверка на сворачивание вкладки
        document.addEventListener('visibilitychange', ()=> {
            if(document.visibilityState === 'hidden') {
                console.log('Вкладка свернута');
                
            } 
            else if(document.visibilityState === 'visible') {
                console.log('Вкладка активна');
            }
        });
        // кнопка админки
        window.addEventListener("keydown", (e)=> {
            const permision = state?.user?.permision?.get();
            
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
        <React.Fragment>
            <HelmetProvider>
                <I18nextProvider i18n={i18n}>
                    <Helmet>
                        <html lang={i18n.language.toLowerCase()==='gb' ? 'en' : i18n.language.toLowerCase()} />
                        <title>{ t('title') }</title>
                        <meta name="description" content={t('description')} />
                    </Helmet>
                </I18nextProvider>
            </HelmetProvider>
            <MantineProvider theme={{}}>
                <div className="rootTop">
                <Toast className='Toast' ref={toast} />
                { isClearSystem &&
                    <Modal 
                        header={ t('clear_system_label') }
                        visible={true}
                        setVisible={console.log}
                        message={ t('clear_system_text') }
                        accept={()=> chekSessionToken(socket, globalThis.peerId)}
                    />
                }
                <BrowserRouter>
                    <Routes>   
                        <Route path="/" element={
                            <React.Fragment>
                                { view==='admin' && <Admin />}
                                { view==='base' && <Base peerId={peerID} /> }
                                { view==='load' && <Loader /> }
                            </React.Fragment>
                        }/>
                        <Route path="/paysucess" element={ <SuccessPage /> }/>
                        <Route path="/payfailed" element={ <CancelPage /> }/>
                        <Route path="*" element={<Navigate to='/' replace/>} />
                    </Routes>
                </BrowserRouter>
                </div>
                <div id="heart-container"></div>
            </MantineProvider>
        </React.Fragment>
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
window.addEventListener('beforeinstallprompt', (event)=> {
    console.log('beforeinstallprompt захвачено.');
    event.preventDefault();
    globalThis.deferredPrompt = event;
});