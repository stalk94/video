const fs = require('fs');
const { online } = require('./online');
const actions = require('./action');
const User = require('./user');
const { chekUserLogin } = require('./function');
const rand = require('random-percentage');
const pricesConfig = JSON.parse(fs.readFileSync('config/prices.json'));



const APP = {
    _init() {
        setInterval(()=> online.init(), 30000);
    },
    /**
     * Инициация вызова сторонами
     * 🔌 user event: 'call' && 'data.ovner' || 'call.bot'
     * @param {string} myPeerId 
     * @param {string} ovnerPeerId 
     */
    call(myPeerId, ovnerPeerId) {
        const user = online.online[myPeerId];
        const ovner = online.online[ovnerPeerId];

        if(user && ovner && !ovner.curentCall) {
            // собеседник человек
            if(!ovner._bot) {
                user.curentCall = ovner.peerId;
                ovner.curentCall = user.peerId;
                user.addStory(ovner.login);
                ovner.addStory(user.login);
                // инициация вызова на стороне клиента
                user.emit('call', {
                    peerId: ovner.peerId,
                    userData: ovner.get(true)
                });
                // второй стороне отправим наши данные
                ovner.emit('data.ovner', {
                    userData: user.get(true)
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
    /**
     * Старт поиска собеседника, кнопка 'START'
     * ! здесь алгоритм поиска
     * @param {string} myPeerId 
     */
    start(myPeerId) {
        /**@type {User} */
        const user = online.online[myPeerId];

        if(user) {
            const revality = user.getRevality();
            const activateSex = user.getSexActivate();
            const countsOnline = online.getCountsOnline();
            user.start();

            const filtresBase = Object.values(online.online).filter((elem)=> 
                elem.peerId !== myPeerId && elem.onStart && !user.story[elem.login]
            );
            const filtresFem = filtresBase.filter((elem)=> elem.sex === 'fem');
            const filtresM = filtresBase.filter((elem)=> elem.sex === 'm');
            
            
            const ovnerIdFilter = rand.getRandom(0, filtresBase.length - 1);
            if(filtresBase[ovnerIdFilter]) {
                this.call(myPeerId, filtresBase[ovnerIdFilter].peerId);
            }
        }
    },
    /**
     * Нажата кнопка 'NEXT'
     * 🔌 user event: 'endCall' || 'endCall.bot'
     * @param {string} myPeerId 
     */
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
    /**
     * Нажата кнопка 'STOP'
     * 🔌 user event: 'endCall' || 'endCall.bot'
     * @param {string} myPeerId 
     */
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
    /**
     * Поставлен лайк
     * @param {*} myPeerId 
     * @param {*} peerIdLike 
     * @param {'heart'|'fire'|'lips'|'rose'} type
     * @returns {number | undefined}
     */
    like(myPeerId, peerIdLike, type) {
        const user = online.online[myPeerId];
        const ovner = online.online[peerIdLike];

        if(user && ovner) {
            if(type === 'rose') {
                if(user.money > 0) {
                    ovner.superLikes++;
                    user.money--
                    ovner.dump();
                    user.dump();

                    if(ovner.emit) ovner.emit('refreshed', {superLikes: ovner.superLikes});
                    if(ovner.emit) ovner.emit('set.like', {likes: ovner.likes, type: type});
                }
                else user.emit('warn', {
                    title: `Warning!`,
                    text: 'Not enough 1 COINS.',
                    type: 'warn_coins_like'
                });
            }
            else {
                if(!user.story[ovner.login]) {
                    ovner.likes++;
                    user.story.forEach((elem)=> elem[ovner.login] = true);
                    ovner.dump();
                }

                if(ovner.emit) ovner.emit('set.like', {likes: ovner.likes, type: type});
            }

            return ovner.likes;
        }
    },
    /**
     * дарим подарок
     * @param {*} myPeerId 
     * @param {*} peerIdOvner 
     * @param {{
     *  id: number
     *  name: string
     *  cost: number
     *  src: string
     *  anim?: 'fall.petal'|'rocket'
     *  text?: string
     * }} data
     */
    gift(myPeerId, peerIdOvner, data) {
        const user = online.online[myPeerId];
        const ovner = online.online[peerIdOvner];
        const gift = pricesConfig.find((elem)=> elem.id === data.id);

        if(user && ovner && gift) {
            if(user.money >= gift.cost) {
                user.money -= gift.cost;

                const giftData = {
                    timeshtamp: Date.now(),
                    from: chekUserLogin(user),
                    ...gift
                }
                
                if(giftData.text && data.text) giftData.text = data.text;
                ovner.addGift(giftData);
                user.emit('gift.pay', gift);
            }
            else user.emit('warn', {
                title: `Warning!`,
                text: 'Not enough COINS.',
                type: 'warn_coins'
            });
        }
    },
    /**
     *  Aктивация кнопки на панели справа
     * 🔌 user event: 'refreshed'
     * @param {number} myPeerId 
     * @param {'search'|'m'|'f'|'mf'} type 
     */
    activate(myPeerId, type) {
        const user = online.online[myPeerId];

        if(user) {
            if(type === 'search') user.activateSuperFind();
            else user.activateSex(type);

            user.emit('refreshed', {activate: user.activate});
        }
    },
    /**
     * Сообщение в чат
     * 🔌 user event: 'massage'
     * @param {string} myPeerId 
     * @param {string} text 
     */
    sendMassage(myPeerId, text) {
        const chek =(userData)=> {
            if(userData.googleData) {
                return `${userData.googleData.name}`;
            }
            else return userData.login;
        }
        const user = online.online[myPeerId];
        
        if(user) {
            const ovner = online.online[user.curentCall];
        
            if(ovner) {
                if(ovner.emit) ovner.emit('massage', {
                    login: chek(user),
                    text: text
                });
                user.emit('massage', {
                    login: chek(user),
                    text: text
                });
            }
            // ботинок
            else {
                user.emit('massage', {
                    login: chek(user),
                    text: text
                });
            }
        }
    },
    createIndividualAction(login, data, type) {
        actions.cteateIndividual(login, data, type);
    },
    /**
     * Юзер вышел
     * @param {string} myPeerId 
     */
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