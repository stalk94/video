import { Socket } from "socket.io-client";
import { Peer, MediaConnection } from "peerjs";


declare global {
    var socket: Socket;
    var peer: Peer;
    var peercall: MediaConnection | undefined;
    var peerId: string;
    var gurl: 'http://localhost:3000/' | 'https://intimalive.com/';
    var languages: ['GB', 'RU', 'CN', 'DE'];
    var lang: 'GB' | 'RU' | 'CN' | 'DE';
    var mediaStream: MediaStream | undefined;
    var twoLine: MediaConnection | undefined;
    var deferredPrompt: Event;
    var deferredPromptCanceled: any;
}


type GiftData = {
    id: number
    name: string
    cost: number
    src: string
    from?: string
    anim?: 'fall.petal'|'rocket'|'fall.rose'
    text?: string
}
type GoogleData = {
    id: number
    name: string
    familyName: string
    img: string
    email: string
}

interface UserDataState {
    login: string
    timeshtampRegistration: number     
    timeshtamp: number                      // last online
    timeSuperFind: number                   // если активирован супер поиск
    timeNewUser: number                     // время до окончания режима "Новичек"
    onStart: boolean                        // нажата кнопка поиска
    permision: 0|1|2                        // 0 - 2
    money: number 
    status: 'free'
    token: string                           // для сессий
    peerId: string                          // идентификатор для связи
    likes: number                           // лайкм от юзеров
    superLikes: number                      // спец
    galery: []                              // файлы пользователя
    story: { [key: string]: number }        // история просмотра
    gifts?: GiftData[]                      // подаренные подарки
    info: {
        country: string
    }
    activate: {
        m: boolean
        f: boolean
        mf: boolean
        search: boolean
    }                                       // уточнить модель
    settings: {
        translate: boolean
        hideCountry: boolean
    }
    googleData?: GoogleData
    curentCall: string                      // peerId текушего сеанса
    avatar?: string
    sex: 'm'|'fem'
}

interface BotDataState {
    login: string
    _bot: true
    isEmpty: boolean
    isOnline: boolean
    time: {
        startDay: number | 0
        endDay: number | 6
        start: number | 12
        end: number | 1
    }
    timerNext: number                       // секунд до переключения
    videos: string[] 
    timeshtamp: number                      // last online
    onStart: boolean                        // нажата кнопка поиска
    money: number 
    status: 'free'
    peerId: string                          // идентификатор для связи
    likes: number                           // лайкм от юзеров
    superLikes: number                      // спец
    galery: []                              // файлы пользователя
    story: { [key: string]: number }        // история просмотра
    gifts?: GiftData[]                      // подаренные подарки
    info: {
        country: string
    }
    curentCall?: string                      // peerId текушего сеанса
    avatar: string | 'img/non-avatar.jpg'
    sex: 'm'|'fem'
}