import React from 'react';
import { EVENT, send } from "../lib/engine";
import { Button } from 'primereact/button';
import { googleAuthorize, getIp } from "../function";



export default function({ sex }) {
    const useChekReferal =()=> {
        const params = new URLSearchParams(location.search); 
        return params.get("ref");
    }
    const useGoogle =()=> {
        googleAuthorize(()=> {
            EVENT.emit('error', { text: 'Ошибка авторизации!' });
        },
        (data)=> {
            getIp((ipData)=> {
                socket.emit('authGoogle', {
                    googleData: data,
                    peerId: globalThis.peerId,
                    ipData: ipData,
                    sex: sex,
                    ref: useChekReferal()
                });
            });
        });
    }


    return(
        <React.Fragment>
            <Button className='SocButton'
                icon='pi pi-google'
                label='Sign in Google'
                onClick={useGoogle}
            />
        </React.Fragment>
    );
}