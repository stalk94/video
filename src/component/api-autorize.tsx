import React from 'react';
import { EVENT, send } from "../lib/engine";
import { Button } from 'primereact/button';
import { googleAuthorize, getIp } from "../function";



export default function({ sex }) {
    const useChekReferal =()=> {
        const params = new URLSearchParams(location.search); 
        return params.get("ref");
    }
    const useFaceBook =()=> {
        window.FB.login((response)=> {
            if(response.authResponse) {  
                window.FB.api('/me', { fields: 'id,first_name,last_name,picture' }, (data)=> {
                    const fbData = {
                        id: data.id,
                        name: data.first_name,
                        familyName: data.last_name,
                        img: data.picture.data.url,
                        email: null,
                        type: 'facebook'
                    }
                    
                    getIp((ipData) => {
                        socket.emit('authFb', {
                            fbData: fbData,
                            peerId: globalThis.peerId,
                            ipData: ipData,
                            sex: sex,
                            ref: useChekReferal()
                        });
                    });
                });
            } 
            else {
                console.log('Ошибка авторизации');
            }
        },
            { scope: 'public_profile' }
        );
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
            <Button className='SocButton' style={{background:'#92f6cd'}}
                icon='pi pi-google'
                label='Sign in Google'
                onClick={useGoogle}
            />
            <Button className='SocButton'
                icon='pi pi-facebook'
                label='Sign in Facebook'
                onClick={useFaceBook}
            />
        </React.Fragment>
    );
}