import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { EVENT, send } from "../../lib/engine";
import { useNavigate } from "react-router-dom";
let task;


export const SuccessPage =()=> {
    const navigate = useNavigate();
    const [sec, setSec] = React.useState(5);

    React.useEffect(()=> {
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
                    <div>

                    </div>
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
                    <div>

                    </div>
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