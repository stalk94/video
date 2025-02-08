import { Message } from "./modules/main/type";
import { Socket } from "socket.io-client";
import { Peer, MediaConnection } from "peerjs";
import stripe from "stripe";


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
    var strapi_key: string;
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
type IpData = {
    ip: string
    loc: string         //"54.1121,13.0405"
    city: string
    country: string
    hostname: string 
    region: string
    postal: string
    org: string
    timezone: string
}
type StripeProductCatalogItem = {
    currency: "usd" | string
    product_data: { 
        name: string
        description: string
        images: string[]
    }
    unit_amount: number
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
    info: IpData
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
    info: IpData
    curentCall?: string                      // peerId текушего сеанса
    avatar: string | 'img/non-avatar.jpg'
    sex: 'm'|'fem'
}

interface AdminPanesUserState {
    ipData?: IpData
    chat?: Message[]
}
interface ProductCatalog {
    coins: number
    cost: number
    amount: "usd" | string
    badge?: ("new" | "hot" | "premium")[]
    stripe: StripeProductCatalogItem
}

//? интерфейс будет менятся
interface Purchase {
    login: string
    idProduct: string
    timeshtamp: number
    paymantService: 'stripe'
    status: 'no_payment_required' | 'paid' | 'unpaid'
    detail: {
        id: string
        amount_total: number
        payment_status: 'no_payment_required' | 'paid' | 'unpaid'
        total_details: any
        livemode: boolean
        customer_details: any
        currency: string
    }
}