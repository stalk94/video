const { db } = require('../server/db');


/**
 * Количество регистраций за промежуток
 * @param {number|'today'} range дни
 * @returns {Promise<number>}
 */
async function getUsersCountInRange(range) {
    const now = Date.now();
    let startDate;

    if(range === 'today') startDate = now - 86400000;
    else if(typeof range === 'number') startDate = now - (86400000 * range);

    // Получаем все пользователей из базы данных
    const users = await db.get('USERS');
    const result = Object.values(users).filter((entry)=> entry.timeshtampRegistration >= startDate);

    return result.length;
}
/**
 * количество событий за промежуток всех, либо type (если указан)
 * @param {number|'today'} range дни
 * @param {'add_money'|'pay_premium'|'superfind'} type тип user action
 * @returns {Promise<Record<string, number>>}
 */
async function getActionsCountInRange(range, type) {
    const now = Date.now();
    let startDate;

    if(range === 'today') startDate = now - 86400000;
    else if(typeof range === 'number') startDate = now - (86400000 * range);

    const result = {};
    const usersActions = await db.get('ACTIONS.LS');
    const filtration =(arr)=> {
        if(!type) return arr.filter((entry)=> entry.timeshtamp >= startDate);
        else return arr.filter((entry)=> entry.timeshtamp >= startDate && entry.type === type);
    }
    Object.keys(usersActions).map((login)=> {
        result[login] = filtration(usersActions[login])?.length;
    });

    return result;
}
// ! experemental
async function getActionsCountInRangeAll(range) {
    const events = ['add_money', 'pay_premium', 'superfind'];

    return events.map((type)=> {
        const res = getActionsCountInRange(range, type);

        return Object.keys(res).map((login)=> ({
            login,
            type,
            count: res[login]
        }));
    });
}
async function getPays(range) {
    const now = Date.now();
    let startDate;

    if(range === 'today') startDate = now - 86400000;
    else if(typeof range === 'number') startDate = now - (86400000 * range);

    const pays = await db.get('PAYS');
    const result = Object.values(pays ?? {}).filter((entry)=> entry.timeshtamp >= startDate);

    return result;
}


module.exports = {
    getUsersCountInRange,
    getActionsCountInRange,
    getPays
}