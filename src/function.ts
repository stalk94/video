import { useState } from "react";
import { loadGapiInsideDOM } from 'gapi-script';
import axios from "axios";


export function getSizeElement(selector?: string) {
    const container = document.querySelector(selector ?? ".ovnerVideo-container");
    return {
        height: container.clientHeight, 
        width: container.clientWidth
    }
}
/**
 * Получает информацию о стране, ip и прочее
 */
export function getIp(clb: Function) {
    fetch("https://ipinfo.io/json?token=1e6873fa773047").then(
        (response)=> response.json()
    ).then(
        (jsonResponse)=> clb(jsonResponse)
    );
}
export function googleAuthorize(clbError, clbSucces) {
    loadGapiInsideDOM().then((gapi)=> {
        gapi.load('auth2', ()=> {
            gapi.auth2.init({
                client_id: '1077937530822-v8dusvvavm6uoofqfjv24pcs7f90o9of.apps.googleusercontent.com',
            }).then(()=> {
                    const auth2 = gapi.auth2.getAuthInstance();
                    globalThis.googleAuth2 = auth2;

                    auth2.signIn().then((data)=> {
                        const profile = data.getBasicProfile();
                        const target = {
                            id: profile.getId(),
                            name: profile.getGivenName(),
                            familyName: profile.getFamilyName(),
                            img: profile.getImageUrl(),
                            email: profile.getEmail(),
                        }
                        // token: data.getAuthResponse().id_token
                        clbSucces(target);
                    });
                }, 
                clbError
            );
        });
    });
}
export function googleOut() {
    if(globalThis.googleAuth2) {
        globalThis.googleAuth2.signOut().then(()=> {
            console.log('User signed out.')
        });
    }
}


/**
 * 
 * @param time 
 * @returns 
 */
export const useTime =(time: number)=> {
    let hours = 0;
    let min = 0;
    let sec = 0;

    const s = time / 1000;
    min = Math.floor(s / 60);
    sec = s % 60;

    if(min > 59) {
        const fl = min / 60;
        hours = Math.floor(fl);
        min = Math.floor(min % 60);
    }

    if((hours + '').length === 1) hours = `0${hours}`;
    if((min + '').length === 1) min = `0${min}`;
    if((sec + '').length === 1) sec = `0${sec}`;

    if(hours === '00') return(min + ':' + sec);
    else return(hours + ':' + min + ':' + sec);
}
export const useUploadForm =(url: string)=> {
    const [isSuccess, setIsSuccess] = useState(false);
    const [progress, setProgress] = useState(0);
  
    const uploadForm = async(formData: FormData)=> {
        await axios.post(url, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent)=> {
                const progress = (progressEvent.loaded / progressEvent.total) * 50;
                setProgress(progress);
            },
            onDownloadProgress: (progressEvent)=> {
                const progress = 50 + (progressEvent.loaded / progressEvent.total) * 50;
                console.log(progress);
                setProgress(progress);
            },
        });
        setIsSuccess(true);
    };
  
    return { uploadForm, isSuccess, progress };
}

// -------------------------------------MEDIASTREAM-------------------------------------------
/**
 * Вернет массив устройств
 */
async function getDevices(type: 'audioinput'|'audiooutput'|'videoinput') {
    const devices = await navigator.mediaDevices.enumerateDevices();

    return devices.filter((elem)=> elem.kind === type);
}