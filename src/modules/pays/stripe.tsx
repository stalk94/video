import { ProductCatalog } from "../../global.d.ts";
import React from 'react';
import ReactGA from 'react-ga4';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import globalState from "../../global.state";
import { EVENT, send } from "../../lib/engine";
import { useNavigate } from "react-router-dom";
import success from "../../img/pay_success.png";
import cancel from "../../img/pay_cancel.png";
import "./style.css";
let task;


export const SuccessPage =()=> {
    const navigate = useNavigate();
    const [sec, setSec] = React.useState(5);

    React.useEffect(()=> {
        ReactGA.event({
            label: 'Пополнение',
            category: 'Платежи',
            action: 'Платеж успешен',
        });

        task = setInterval(()=> {
            setSec((sec)=> {
                if(sec <= 0) navigate('/');
                return sec - 1;
            });
        }, 1000);

        return ()=> {
            clearInterval(task);
        }
    }, []);

    
    return(
        <div style={{display:'flex', width:'100%', height:'100%'}}>
            <Card title="Платеж в обработке"
                style={{ width: '25em', margin: 'auto' }} 
                header={
                    <img src={success}
                        style={{padding:'1rem', borderRadius:'15px'}}
                    />
                }
                footer={
                    <Button 
                        label="На главную" 
                        icon="pi pi-check" 
                        onClick={()=> {
                            clearInterval(task);
                            navigate('/');
                        }}
                    />
                }
            >
                <p className="m-0" style={{lineHeight: '1.5'}}>
                    Вы получите оповещение после завершения.
                    💋 Спасибо за покупку!
                    Через {sec} вы будете перенаправлены на главную страницу. 
                </p>
            </Card>
        </div>
    );
}
export const CancelPage =()=> {
    const navigate = useNavigate();
    const [sec, setSec] = React.useState(5);

    React.useEffect(()=> {
        task = setInterval(()=> {
            ReactGA.event({
                label: 'Платеж отмена',
                category: 'Платежи',
                action: 'Платеж отмена',
            });

            setSec((sec)=> {
                if(sec <= 0) navigate('/');
                return sec - 1;
            });
        }, 1000);

        return ()=> {
            clearInterval(task);
        }
    }, []);


    return(
        <div style={{display:'flex', width:'100%', height:'100%'}}>
            <Card title="Платеж был отменен!"
                style={{ width: '25em', margin: 'auto' }} 
                header={
                    <img src={cancel}
                        style={{padding:'1rem', borderRadius:'15px'}}
                    />
                }
                footer={
                    <Button 
                        label="На главную" 
                        icon="pi pi-check" 
                        onClick={()=> {
                            clearInterval(task);
                            navigate('/');
                        }}
                    />
                }
            >
                <p className="m-0" style={{lineHeight: '1.5'}}>
                    Через {sec} вы будете перенаправлены на главную страницу. 
                </p>
            </Card>
        </div>
    );
}
const PayMethods =({ product, usePay }: {product:ProductCatalog, usePay:(type:'stripe')=> void})=> {
    return(
        <div className="PaysMethodsContainer">
            { product.stripe &&
                <Button className="p-button-primary" id="stripe"
                    icon= {
                        <img id="img_button"
                            src={'https://cdn.iconscout.com/icon/free/png-256/free-stripe-logo-icon-download-in-svg-png-gif-file-formats--flat-social-media-branding-pack-logos-icons-498440.png'}
                        />
                    }
                    title="stripe"
                    onClick={()=> usePay('stripe')}
                />
            }
        </div>
    );
}



/**
 * Элемент поплнялок счета
 * ! на данный момент только stripe реализовано
 */
export function PayComponent() {
    const [curent, setCurent] = React.useState<string>();
    const [products, setProducts] = React.useState<Record<string, ProductCatalog>>();

    //* расширить до разных методов
    const payCreateSession =(type: 'stripe')=> {
        if(curent) {
            send('create-checkout-session', {
                id: curent,
                login: globalState.user.login.get()
            }, 'POST').then((res)=> {
                if(res.error) EVENT.emit('error', {text: res.error});
                else if(res.url) {
                    window.location.href = res.url;
                }
            });
        }

        if(type==='stripe') ReactGA.event({
            label: 'stripe go to pay',
            category: 'Платежи',
            action: 'Переход к оплате',
            value: products[curent]?.coins
        });
    }
    const chekValueArray =(arrChek: string[], arr: string[])=> {
        return arr.some(el => arrChek.includes(el));
    }
    React.useEffect(()=> {
        send('getStripeCatalog', null, 'GET')
            .then(setProducts);
    }, []);
    
    
    return(
        <div className="PayContainer">
            <div className="PayMethodWraper">
                { products && Object.keys(products).map((key, index)=> {
                    const product = products[key];
                    
                    return(
                        <div key={index} 
                            className='ProductCard'
                            onClick={()=> setCurent(key)}
                            id={curent === key && 'curent'}
                        >
                            <div className="Badge">
                                { chekValueArray(product.badge, ['premium']) &&
                                    <div className="ProductBadgePremium">
                                        + premium
                                    </div>
                                }
                                { chekValueArray(product.badge, ['new', 'hot']) &&
                                    <div className="ProductBadge">
                                        { product.badge.map((elem, index)=> 
                                            <React.Fragment key={`badge-${index}`}>
                                                { elem === 'hot' &&  '🔥' }
                                                { elem === 'new' &&  '🆕' }
                                            </React.Fragment>
                                        )}
                                    </div>
                                }
                            </div>
                            <img className="ProductImage"
                                src={product.stripe.product_data.images[0]}
                                onError={(e)=> e.target.src = gurl + 'img/coins.png'}
                            />
                            <div className="ProductCoins">
                                { product.coins } COINS
                            </div>
                            <div className="ProductCost">
                                { product.cost/100 } { product.amount }
                            </div>
                        </div>
                    );
                })}
            </div>
            { curent &&
                <PayMethods
                    product={products[curent]}
                    usePay={payCreateSession}
                />
            }
        </div>
    );
}