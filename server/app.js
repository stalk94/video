const { online } = require('./online');
const rand = require('random-percentage');


const APP = {
    call(myPeerId, ovnerPeerId) {
        const user = online.online[myPeerId];
        const ovner = online.online[ovnerPeerId];

        if(user && ovner && !ovner.curentCall) {
            user.curentCall = ovner.peerId;
            ovner.curentCall = user.peerId;
            // инициация вызова на стороне клиента
            user.emit('call', {
                peerId: ovner.peerId,
                userData: ovner.get()
            });
            // второй стороне отправим наши данные
            ovner.emit('data.ovner', {
                userData: user.get()
            });
        }
    },
    start(myPeerId) {
        const user = online.online[myPeerId];

        if(user) {
            const filter = Object.keys(online.online).filter((elem)=> elem !== myPeerId);

            if(filter.length > 1) {
                const ovnerId = rand.getRandom(0, filter.length - 1);
                const ovner = online.online[ovnerId];

                if(!ovner.curentCall && ovner.sex !== user.sex) {
                    this.call(myPeerId, ovnerId);
                }
            }
        }
    },
    finish(myPeerId) {
        const user = online.online[myPeerId];

        if(user) {
            const ovner = online.online[user.curentCall];
            user.emit('endCall', {});
            delete user.curentCall;

            if(ovner) {
                ovner.emit('endCall', {});
                delete ovner.curentCall;
            }
        }
    },
    forvard(myPeerId, login) {
        const user = online.online[myPeerId];

        if(user) {
            if(!user.forvards.find((elem)=> elem===login)) user.forvards.push(login);
            else {
                const findIndex = user.forvards.findIndex((elem)=> elem===login);
                user.forvards.splice(findIndex, 1);
            }

            user.emit('refreshed', {
                forvards: user.forvards
            });
        }
    },
    sendMassage(myPeerId, text) {
        const user = online.online[myPeerId];

        if(user && user.curentCall) {
            const ovner = online.online[user.curentCall];

            if(ovner) {
                ovner.emit('massage', {
                    login: user.login,
                    text: text
                });
                user.emit('massage', {
                    login: user.login,
                    text: text
                });
            }
        }
    }
}


module.exports = APP;