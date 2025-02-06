const fs = require('fs');
const { db } = require('./db');
const { online } = require('./online');
const User = require('./user');
const stripe = require("stripe");


module.exports = {
    prices: JSON.parse(fs.readFileSync('config/pays.json', {encoding:'utf-8'})),

    /**
     * Создана платежная сессия stripe
     * @param {string} login user login
     * @param {string} idProduct id продукта в каталоге
     * @param {stripe.default.Checkout.Session} session object stripe session
     */
    async createNewStripeSession(login, idProduct, session) {
        const { 
            id,
            amount_total,
            payment_status, 
            total_details, 
            livemode, 
            customer_details,
            currency
        } = session;
        
        //! задекларировать
        await db.set(`PAYS.${id}`, {
            login: login,
            idProduct: idProduct,
            timeshtamp: Date.now(),
            paymantService: 'stripe',
            status: payment_status,
            detail: {
                id,
                amount_total,
                payment_status, 
                total_details, 
                livemode, 
                customer_details,
                currency
            }
        });
    },
    /**
     * Зачисляет платеж юзеру
     * @param {stripe.default.Checkout.Session} stripeSession
     */
    async stripePayCompleted(stripeSession) {
        const session = await db.get(`PAYS.${stripeSession.id}`);
        
        if(session) {
            const price = this.prices[session.idProduct];
            const findOnline = Object.values(online.online).find(user => user.login === session.login);
            session.status = stripeSession.payment_status;
            session.detail = {
                id: stripeSession.id,
                amount_total: stripeSession.amount_total,
                payment_status: stripeSession.payment_status, 
                total_details: stripeSession.total_details, 
                livemode: stripeSession.livemode, 
                customer_details: stripeSession.customer_details,
                currency: stripeSession.currency,
            };
            await db.set(`PAYS.${stripeSession.id}`, session);
            // пошлем эвент
            process.emit('pay.completed', {
                login: session.login,
                cost: stripeSession.amount_total
            });


            if(findOnline) {
                findOnline.addMoney(price.coins);
            }
            else {
                const userData = await db.get(`USERS.${session.login}`);

                if(userData) {
                    const user = new User(userData.login, userData.password);
                    user._update(userData);
                    user.addMoney(price.coins);
                }
            }
        }
    }
}