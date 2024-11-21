import React from 'react';
import { EVENT } from "../../lib/engine";
import { PasswordInput, TextInput } from '@mantine/core';
import { Button } from 'primereact/button';

const statusIcon = {
    valid: <i className="pi pi-check" style={{color:'green'}}/>,
    invalid: <i className="pi pi-times" style={{color:'red'}}/>
}


export default function({ useReg }) {
    const [login, setLogin] = React.useState<string>();
    const [email, setEmail] = React.useState<string>();
    const [password, setPassword] = React.useState<string>();

    const useSetReg =()=> {
        if(login && login.length > 5) {
            if(password && password.length > 5) useReg({
                email: email,
                login: login,
                password: password,
            });
            else EVENT.emit('error', {text: 'В пароле минимум 6 символов!'});
        }
        else EVENT.emit('error', {text: 'В логине минимум 6 символов'});
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


    return(
        <React.Fragment>
            <TextInput
                placeholder="Логин"
                value={login}
                onChange={(event)=> setLogin(event.currentTarget.value)}
                rightSection={chekLogin()}
            />
            <TextInput style={{marginTop:'20px'}}
                placeholder="E-mail"
                value={email}
                onChange={(event)=> setEmail(event.currentTarget.value)}
                rightSection={chekEmail()}
            />
            <PasswordInput style={{ marginTop: '20px' }}
                placeholder="Пароль"
                rightSection={chekPassword()}
                value={password}
                onChange={(event)=> setPassword(event.currentTarget.value)}
            />
            <Button className='FormButton'
                icon='pi pi-check-square'
                label='Регистрация'
                onClick={useSetReg}
            />
        </React.Fragment>
    );
}