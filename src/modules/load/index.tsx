import React from 'react';
import ReactGA from "react-ga4";
import { EVENT, send } from "../../lib/engine";
import SelectSex from "./select-sex";
import Toogler from "../../component/toogler";
import SocialRegs from "../../component/api-autorize";
import Auth from "./auth";
import Reg from "./reg";
import Alarm from "./alarm";
import "../../css/loader.css";



export default function() {
    const [sex, setSex] = React.useState('m');
    const [alarms, setAlarm] = React.useState(false);
    const [mod, setMod] = React.useState<'auth'|'reg'|'init'|'alarm'>('init');

    const useSetSex =(type: 'm'|'fem')=> {
        setSex(type);
        setMod('alarm');
    }
    const useSetAlarm =()=> {
        setAlarm(true);
        setMod('auth');
    }
    const useAuth =(login: string, password: string)=> {
        if (socket) socket.emit('auth', {
            login: login,
            password: password,
            peerId: globalThis.peerId
        });
        else console.error('socket not connect');

        ReactGA.event({
            label: 'Авторизация',
            category: 'Основное',
            action: 'Клик по кнопке'
        });
    }
    const useReg =(data: any)=> {
        send('reg', {...data, sex: sex}, 'POST').then((res) => {
            if(res?.error) EVENT.emit('error', { text: res.error });
            else if (!res?.error && res?.login) {
                EVENT.emit('success', { text: 'Успешно. Теперь авторизуйтесь!' });
                setMod('auth');
            }
        });
    }
    

    return(
        <div className='Loader'>
            { (mod === 'auth' ||  mod === 'reg') &&
                <div className='Form'>
                    <div className='LabelAuth'>
                        INTIMALIVE
                    </div>
                    <Toogler 
                        mod={mod}
                        useMod={setMod}
                    />
                    { mod === 'auth' && 
                        <Auth 
                            useAuth={useAuth} 
                        /> 
                    }
                    { mod === 'reg' && 
                        <Reg 
                            useReg={useReg} 
                        /> 
                    }
                    <SocialRegs sex={sex} />
                </div>
            }
            { mod === 'init' && 
                <SelectSex 
                    useInitSex={useSetSex} 
                /> 
            }
            { mod === 'alarm' &&
                <Alarm 
                    value={alarms}
                    useInitALarm={useSetAlarm}
                />
            }
        </div>
    );
}