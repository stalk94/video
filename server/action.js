const { db } = require('./db');
const { online } = require('./online');
const User = require('./user');


const Actions = {
    /**
     * Создать глобальную новость
     * 🔌 user event: 'add.action'
     * @param {User} userAuthor 
     * @param {{text:string, header:string}} data 
     */
    create(userAuthor, data) {
        if(userAuthor.permision > 0) {
            const action = {
                timeshtamp: Date.now(),
                author: userAuthor.login,
                ...data
            }
            db.push('ACTIONS.GLOBAL', action).then(()=> {
                console.log('Добавлена новость');

                // рассылка всем кто онлайн
                Object.values(online.online).forEach((entity)=> {
                    if(entity.emit) entity.emit('add.action', action);
                });
            });
        }
    },
    /**
     * Создать личное событие
     * 🔌 user event: 'add.action'
     * @param {string} userLogin 
     * @param {{text:string, header:string}} data 
     */
    cteateIndividual(userLogin, data) {
        const action = {
            timeshtamp: Date.now(),
            author: 'SYSTEM',
            ...data
        }

        db.push(`ACTIONS.LS.${userLogin}`, action).then(()=> {
            Object.values(online.online).find((entity)=> {
                if(entity.login === userLogin && entity.emit) {
                    entity.emit('add.action', action);
                }
            });
        });
    },
    /**
     * Проверить и получить все события юзера а так же глобальные
     * 🔌 user event: 'all.actions'
     * @param {User} user 
     */
    async chek(user) {
        const lsActions = await db.get(`ACTIONS.LS.${user.login}`);
        const globalActions = await db.get(`ACTIONS.GLOBAL`);

        if(user?.emit) {
            if(lsActions && globalActions) user.emit('all.actions', [...lsActions, ...globalActions]);
            else if(globalActions) user.emit('all.actions', globalActions);
        }
    }
}



module.exports = Actions;