const fs = require('fs');
const express = require('express');
const { db } = require('./server/db');
const stripe = require("stripe")(process.env.STRIPE_SECRET);


process.on('uncaughtException', (err)=> {
    fs.appendFileSync("dead.log", JSON.stringify({
        massage: err.message,
        stack: err.stack
    })+"\n", {encoding:"utf-8"});
});
if(false) app.use((req, res, next)=> {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});



app.post('/webhook', express.raw({type: 'application/json'}), (req, res)=> {
    const sig = req.headers['stripe-signature'];
    let event;
  
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_SECRET_WH);
    } 
    catch (err) {
        console.log('Ошибка валидации вебхука: ', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    switch(event.type) {
        case 'payment_intent.succeeded':            //? Успешный платеж
                const paymentIntent = event.data.object;
                console.log('Платеж успешно обработан! ID:', paymentIntent.id);
            break;
        case 'checkout.session.completed':      // Сессия, завершённая успешно
                const session = event.data.object;  
                console.log('Платёж завершён! Данные сессии:', session);
                // Здесь можно обработать логику подтверждения платежа
            break;
        default:
            console.log(`Неизвестное событие: ${event.type}`);
    }
  
    res.status(200).send('Received Webhook');
});
app.post("/create-checkout-session", async (req, res)=> {
    const baseUrl = req.get('Host');

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: { name: "Товар X" },
                    unit_amount: 5000, // 50.00$
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: `${baseUrl}/paysucess`,
        cancel_url: `${baseUrl}/payfailed`,
    });

    res.send({ url: session.url });
});
app.post("/check-payment", async (req, res)=> {
    const session = await stripe.checkout.sessions.retrieve(req.data.session_id);
    res.json({ status: session.payment_status });
});