import { send } from "./lib/engine";


export function chekSessionToken(socket, peerId) {
    const token = window.localStorage.getItem('TOKEN');

    if(token) {
        // пробуем вытащить сессию
        socket.emit('session', {
            token: token,
            peerId: peerId
        });
    }
    // токена нет в хранилище
    else {
        
    }
}

const useTime =(time: number)=> {
    let hours = 0;
    let min = 0;
    let sec = 0;

    const s = time / 1000;
    min = Math.floor(s / 60);
    sec = s % 60;

    if(min > 59) {
        const fl = min / 60;
        hours = Math.floor(fl);
        min = Math.floor(min % 60);
    }

    if((hours + '').length === 1) hours = `0${hours}`;
    if((min + '').length === 1) min = `0${min}`;
    if((sec + '').length === 1) sec = `0${sec}`;

    if(hours === '00') return(min + ':' + sec);
    else return(hours + ':' + min + ':' + sec);
}