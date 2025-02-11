//require('dotenv').config();
const fs = require('fs');
const express = require('express');
const payManager = require('./server/pays-manager');
const striperequire = require("stripe");
/** @type {striperequire.default} */
const stripe = striperequire(process.env.STRIPE_SECRET);


process.on('uncaughtException', (err)=> {
    fs.appendFileSync("dead.log", JSON.stringify({
        massage: err.message,
        stack: err.stack
    })+"\n", {encoding:"utf-8"});
});
const chekUrl =(url)=> {
    if(url === 'localhost:3000') return 'http://localhost:3000';
    else return `https://${url}`;
}


//-------------------------------------------------------------- [stripe]
app.get('/getStripeCatalog', (req, res)=> {
    res.send(payManager.prices);
});
// ! что то не работает webhook (не полный сертификат ssl)
app.post('/webhook', express.raw({type: 'application/json'}), (req, res)=> {
    const sig = req.headers['stripe-signature'];
  
    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_SECRET_WH);
        console.log('WEBHOOK: ', event);
        
        switch(event.type) {
            case 'payment_intent.succeeded':            //? Успешный платеж
                    const paymentIntent = event.data.object;
                    console.log('Платеж успешно обработан! ID:', paymentIntent.id);
                break;
            case 'checkout.session.completed':      // Сессия, завершённая успешно
                    const session = event.data.object;  
                    console.log('Платёж завершён! Данные сессии:', session);
                    
                    payManager.stripePayCompleted(session);
                break;
            default:
                console.warn(`Неизвестное событие: ${event.type}`);
        }
      
        res.status(200).send('Received Webhook');
    } 
    catch (err) {
        console.error('Ошибка валидации вебхука: ', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
});
app.post("/create-checkout-session", async(req, res)=> {
    const baseUrl = req.get('Host');
    const { id, login } = req.body;                 // id товара, login
    

    if(payManager.prices[id] && login) {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],         //* разобраться 
            line_items: [{
                price_data: payManager.prices[id].stripe,
                quantity: 1,
            }],
            mode: "payment",
            metadata: { userLogin: login },
            success_url: `${chekUrl(baseUrl)}/paysucess`,
            cancel_url: `${chekUrl(baseUrl)}/payfailed`,
        });

        await payManager.createNewStripeSession(login, id, session);
        res.send({ url: session.url });
    }
    else {
        res.send({error: 'not valid index products or login user'});
    }
});
app.post("/check-payment", async (req, res)=> {
    const session = await stripe.checkout.sessions.retrieve(req.data.session_id);
    res.json({ status: session.payment_status });
});