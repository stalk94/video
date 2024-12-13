const { online } = require('./online');
const actions = require('./action');
const rand = require('random-percentage');


const APP = {
    call(myPeerId, ovnerPeerId) {
        const user = online.online[myPeerId];
        const ovner = online.online[ovnerPeerId];

        if(user && ovner && !ovner.curentCall) {
            // собеседник человек
            if(!ovner._bot) {
                user.curentCall = ovner.peerId;
                ovner.curentCall = user.peerId;
                user.addStory(ovner.login);
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
            // ботяра
            else {
                //user.curentCall = ovner.peerId;
                //ovner.curentCall = user.peerId;
                user.addStory(ovner.login);

                user.emit('call.bot', {
                    userData: ovner.get()
                });
            }
        }
    },
    start(myPeerId) {
        const user = online.online[myPeerId];
        

        if(user) {
            const revality = user.getRevality();
            const chekSex = user._chekSexActivate();        //? осталось тут сделать
            user.start();
            const filter = [];

            // * алгоритм поиска
            Object.values(online.online).forEach((elem)=> {
                if(elem.peerId !== myPeerId && elem.onStart) {
                    const data = {
                        revality: 100,
                        data: elem
                    }
                    // базовые кооэфициенты
                    if(elem._bot) data.revality = 50;
                    else data.revality = 100;

                    // супер поск активен
                    if(revality === 100) {
                        if(elem._bot) data.revality = 10;
                        else {
                            if(elem.sex === 'fem') data.revality = 90;
                        }
                    }
                    // статус премиум
                    else if(revality === 60) {
                        if(elem._bot) data.revality = 10;
                        else {
                            if(elem.sex === 'fem') data.revality = 60;
                            else data.revality = 40;
                        }
                    }
                    // нет ничего
                    else if(revality === 20) {
                        if(elem._bot) data.revality = 50;
                        else {
                            if(elem.sex === 'fem') data.revality = 20;
                            else data.revality = 80;
                        }
                    }

                    filter.push(data);
                }
            });
            

            if(filter.length >= 1) {
                const ranging =()=> {
                    // тестируемый акк (random)
                    const ovnerIdFilter = rand.getRandom(0, filter.length - 1);
                    const randomProcent = rand.getRandom(0, 100);

                    if(filter[ovnerIdFilter].revality <= randomProcent) {
                        return filter[ovnerIdFilter].data;
                    }
                }
                const ovner = ranging();


                if(ovner && !ovner.curentCall) {
                    this.call(myPeerId, ovner.peerId);
                }
            }
        }
    },
    next(myPeerId) {
        const user = online.online[myPeerId];


        if(user) {
            const ovner = online.online[user.curentCall];

            // человек
            if(ovner && !ovner._bot) {
                user.emit('endCall', {});
                ovner.emit('endCall', {});

                delete ovner.curentCall;
                delete user.curentCall;
            }
            // ни с кем не говорили либо с ботом
            else {
                user.emit('endCall.bot', {});
                delete user.curentCall;
            }
        }
    },
    finish(myPeerId) {
        const user = online.online[myPeerId];

        if(user) {
            const ovner = online.online[user.curentCall];

            // человек
            if(ovner && !ovner._bot) {
                user.emit('endCall', {});
                user.stop();
                ovner.emit('endCall', {});

                delete ovner.curentCall;
                delete user.curentCall;
            }
            // ботяра
            else if(ovner && ovner._bot) {
                user.stop();
                user.emit('endCall.bot', {});
                //delete ovner.curentCall;
                delete user.curentCall;
            }
            // ни с кем не говорили
            else {
                user.stop();
                delete user.curentCall;
            }
        }
    },
    like(myPeerId, peerIdLike) {
        const user = online.online[myPeerId];
        const ovner = online.online[peerIdLike];

        if(user && ovner) {
            const find = user.story.find((elem)=> {
                if(elem[ovner.login]) return true;
            });

            //console.log(find)
            if(!find) {
                ovner.likes++;
                user.story.forEach((elem)=> elem[ovner.login] = true);
                ovner.dump();
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

        if(user) {
            const ovner = online.online[user.curentCall];
        
            if(ovner) {
                if(!ovner._bot) ovner.emit('massage', {
                    login: user.login,
                    text: text
                });
                user.emit('massage', {
                    login: user.login,
                    text: text
                });
            }
            // ботинок
            else {
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



/**
 * // deprecate
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
 */