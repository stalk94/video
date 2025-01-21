import React from 'react';
import { EVENT } from "../../lib/engine";
import { getIp } from "../../function";
import { PasswordInput, TextInput } from '@mantine/core';
import { Button } from 'primereact/button';
import { useDidMount } from 'rooks';
import { useTranslation } from 'react-i18next';


const statusIcon = {
    valid: <i className="pi pi-check" style={{color:'green'}}/>,
    invalid: <i className="pi pi-times" style={{color:'red'}}/>
}


export default function({ useReg }) {
    const [ipData, setIpData] = React.useState<any>();                  // данные по ip клиента
    const [login, setLogin] = React.useState<string>();
    const [email, setEmail] = React.useState<string>();
    const [password, setPassword] = React.useState<string>();
    const { t, i18n } = useTranslation();

    const useSetReg =()=> {
        if(login && login.length > 5) {
            if(password && password.length > 5) useReg({
                email: email,
                login: login,
                password: password,
                ipData: ipData
            });
            else EVENT.emit('error', {text: 'password min 6 simbol!'});
        }
        else EVENT.emit('error', {text: 'login min 6 simbol'});
    }
    const chekLogin =()=> {
        if(login && login.length > 5) return statusIcon.valid;
        else return statusIcon.invalid;
    }
    const chekPassword =()=> {
        if(password && password.length > 5) return statusIcon.valid;
        else return statusIcon.invalid;
    }
    const chekEmail =()=> {
        if(email && email.length > 5) return statusIcon.valid;
        else return statusIcon.invalid;
    }
    useDidMount(()=> {
        getIp((dataResponce)=> {
            console.log(dataResponce);
            if(dataResponce) setIpData(dataResponce);
        });
    });


    return(
        <React.Fragment>
            <TextInput
                size={window.innerWidth > 1280 ? "lg" : "xl"}
                placeholder="Login"
                value={login}
                onChange={(event)=> setLogin(event.currentTarget.value)}
                rightSection={chekLogin()}
            />
            <TextInput style={{marginTop:'20px'}}
                size={window.innerWidth > 1280 ? "lg" : "xl"}
                placeholder="E-mail"
                value={email}
                onChange={(event)=> setEmail(event.currentTarget.value)}
                rightSection={chekEmail()}
            />
            <PasswordInput style={{ marginTop: '20px' }}
                size={window.innerWidth > 1280 ? "lg" : "xl"}
                placeholder="Password"
                rightSection={chekPassword()}
                value={password}
                onChange={(event)=> setPassword(event.currentTarget.value)}
            />
            <Button className='FormButton'
                icon='pi pi-check-square'
                label={ t('label_reg') }
                onClick={useSetReg}
            />
        </React.Fragment>
    );
}