const { online } = require('./online');
const rand = require('random-percentage');


const APP = {
    call(myPeerId, ovnerPeerId) {
        const user = online.online[myPeerId];
        const ovner = online.online[ovnerPeerId];

        if(user && ovner && !ovner.curentCall) {
            user.curentCall = ovner.peerId;
            ovner.curentCall = user.peerId;
            user.start();
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
            const revality = user.getRevality();
            const chekSex = user._chekSexActivate();
            user?.stop();
            const filter = Object.values(online.online).filter((elem)=> elem.peerId !== myPeerId);
            
            if(filter.length >= 1) {
                const ovnerId = rand.getRandom(0, filter.length - 1);
                const ovner = Object.values(filter)[ovnerId];

                if(!ovner.curentCall) {
                    this.call(myPeerId, ovner.peerId);
                }
            }
        }
    },
    finish(myPeerId) {
        const user = online.online[myPeerId];

        if(user) {
            const ovner = online.online[user.curentCall];
            user.emit('endCall', {});
            user.stop();

            if(ovner) {
                ovner.emit('endCall', {});
                delete ovner.curentCall;
            }
            
            delete user.curentCall;
        }
    },
    // deprecate
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
    like(myPeerId, peerIdLike) {
        const user = online.online[myPeerId];
        const ovner = online.online[peerIdLike];

        if(user && ovner) {
            const find = user.story.find((login)=> login === ovner.login);

            if(!find) {
                ovner.likes++;
            }
            
            return ovner.likes;
        }
    },
    /**
     * активация кнопки на панели слева
     * @param {number} myPeerId 
     * @param {'search'|'m'|'f'|'mf'} type 
     */
    activate(myPeerId, type) {
        const user = online.online[myPeerId];

        if(user) {

            user.emit('refreshed', {activate: user.activate});
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
    },
    exit(myPeerId) {
        this.finish(myPeerId);
        online.exit(myPeerId)
    }
}


module.exports = APP;