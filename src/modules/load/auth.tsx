import React from 'react';
import { PasswordInput, TextInput } from '@mantine/core';
import { Button } from 'primereact/button';


const statusIcon = {
    valid: <i className="pi pi-check" style={{color:'green'}}/>,
    invalid: <i className="pi pi-times" style={{color:'red'}}/>
}


export default function({ useAuth }) {
    const [login, setLogin] = React.useState<string>();
    const [password, setPassword] = React.useState<string>();

    const chekLogin =()=> {
        if(login && login.length > 5) return statusIcon.valid;
        else return statusIcon.invalid;
    }
    const chekPassword =()=> {
        if(password && password.length > 5) return statusIcon.valid;
        else return statusIcon.invalid;
    }
    

    return(
        <React.Fragment>
            <TextInput
                size="xl"
                placeholder="Логин"
                value={login}
                onChange={(event)=> setLogin(event.currentTarget.value)}
                
            />
            <PasswordInput style={{marginTop:'20px'}}
                size="xl"
                placeholder="Пароль"
                value={password}
                onChange={(event)=> setPassword(event.currentTarget.value)}
                
            />
            <Button className='FormButton'
                icon='pi pi-sign-in'
                label='Авторизоваться'
                onClick={()=> useAuth(login, password)}
            />
        </React.Fragment>
    );
}