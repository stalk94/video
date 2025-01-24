import React from 'react';
import { PasswordInput, TextInput } from '@mantine/core';
import { Button } from 'primereact/button';
import { useTranslation } from 'react-i18next';


const statusIcon = {
    valid: <i className="pi pi-check" style={{color:'green'}}/>,
    invalid: <i className="pi pi-times" style={{color:'red'}}/>
}


export default function({ useAuth }) {
    const [login, setLogin] = React.useState<string>();
    const [password, setPassword] = React.useState<string>();
    const { t, i18n } = useTranslation();

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
                size="lg"
                placeholder="Login"
                value={login}
                onChange={(event)=> setLogin(event.currentTarget.value)}
                
            />
            <PasswordInput style={{marginTop:'0.7em'}}
                size="lg"
                placeholder="Password"
                value={password}
                onChange={(event)=> setPassword(event.currentTarget.value)}
                
            />
            <Button className='FormButton'
                icon='pi pi-sign-in'
                label={ t('label_auth') }
                onClick={()=> useAuth(login, password)}
            />
        </React.Fragment>
    );
}