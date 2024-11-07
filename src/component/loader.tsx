import React from 'react';
import { EVENT, send } from "../lib/engine";
import { Card } from 'primereact/card';
import { SelectButton } from 'primereact/selectbutton';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { PiGenderFemaleDuotone, PiGenderMaleDuotone } from "react-icons/pi";
import "../css/loader.css";


const Auth =({useAuth})=> {
    const [login, setLogin] = React.useState();
    const [password, setPassword] = React.useState();


    return(
        <div className='Forms'>
            <var className='FormLabel'>
                Логин или e-mail:
            </var>
            <InputText
                placeholder='min 6 simbol'
                value={login} 
                onChange={(e)=> setLogin(e.target.value)}
            />
            <var className='FormLabel' style={{marginTop:'15px'}}>
                Пароль:
            </var>
            <input className='p-inputtext p-component'
                placeholder='min 6 simbol'
                type='password'
                value={password}
                onChange={(e)=> setPassword(e.target.value)}
            />
            <Button className='p-button-success FormButton'
                icon='pi pi-sign-in'
                label='Авторизоваться'
                onClick={()=> useAuth(login, password)}
            />
        </div>
    );
}
const Reg =({useMod, sex})=> {
    const [login, setLogin] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState();

    const useReg =()=> {
        const useSend =()=> {
            send('reg', {
                login: login,
                email: email,
                password: password,
                sex: sex
            }).then((res)=> {
                if(res?.error) EVENT.emit('error', {text: res.error});
                else if(!res?.error && res?.login) {
                    EVENT.emit('success', {text: 'Успешно. Теперь авторизуйтесь!'});
                    useMod('auth');
                }
            });
        }

        if(login && login.length > 5) {
            if(password && password.length > 5) useSend();
            else EVENT.emit('error', {text: 'В пароле минимум 6 символов!'});
        }
        else EVENT.emit('error', {text: 'В логине минимум 6 символов'});
    }

    return(
        <div className='Forms'>
            <var className='FormLabel'>
                Логин:
            </var>
            <InputText
                placeholder='min 6 simbol'
                value={login} 
                onChange={(e)=> setLogin(e.target.value)}
            />
            <var className='FormLabel' style={{marginTop:'5px'}}>
                e-mail:
            </var>
            <InputText
                placeholder='@'
                value={email} 
                onChange={(e)=> setEmail(e.target.value)}
            />
            <var className='FormLabel' style={{marginTop:'15px'}}>
                Пароль:
            </var>
            <input className='p-inputtext p-component'
                type='password'
                placeholder='min 6 simbol'
                value={password}
                onChange={(e)=> setPassword(e.target.value)}
            />
            <Button className='p-button-success FormButton'
                icon='pi pi-check-square'
                label='Регистрация'
                onClick={()=> useReg()}
            />
        </div>
    );
}
const Init =({useInitSex, sex})=> {

    return(
        <div className='Forms'>
            <Card className='LoaderCard'
                header={
                    <h2>
                        Кто вы?
                    </h2>
                }
            >
                <div className='SexCard' onClick={()=> useInitSex('fem')}>
                    <button className='SexButton'>
                        <PiGenderFemaleDuotone style={{color:'red', fontSize:'150px'}}/>
                        <div>
                            Женшина
                        </div>
                    </button>
                    <button className='SexButton' onClick={()=> useInitSex('m')}>
                        <PiGenderMaleDuotone style={{color:'orange', fontSize:'150px'}}/>
                        <div>
                            Мужчина
                        </div>
                    </button>
                </div>
            </Card>
        </div>
    );
}


export default function({useAuth}) {
    const [sex, setSex] = React.useState('m');
    const [mod, setMod] = React.useState<'auth'|'reg'|'init'>('init');

    const useSetSex =(type: 'm'|'fem')=> {
        setSex(type);
        setMod('auth');
    }
    
    return(
        <div className='Loader'>
            { mod !== 'init' &&
                <Card className='LoaderCard'
                    header={
                        <div>
                            <SelectButton 
                                value={mod} 
                                options={[
                                    {label: 'Авторизация', value: 'auth'},
                                    {label: 'Регистрация', value: 'reg'}
                                ]} 
                                onChange={(e)=> setMod(e.value)}
                            />
                        </div>
                    }
                >
                    { mod==='auth' && <Auth useAuth={useAuth} /> }
                    { mod==='reg' && <Reg sex={sex} useMod={setMod} /> }
                </Card>
            }
            { mod === 'init' && 
                <Init 
                    sex={sex} 
                    useInitSex={useSetSex} 
                /> 
            }
        </div>
    );
}