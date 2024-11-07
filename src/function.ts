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