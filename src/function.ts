import { useState } from "react";
import { EVENT } from './lib/engine';
import * as faceapi from 'face-api.js';
import { loadGapiInsideDOM } from 'gapi-script';
import axios from "axios";


/**
 * Вычисляет размеры элемента
 * @param {string} selector
 * @returns {height:number, width:number}
 */
export function getSizeElement(selector?: string) {
    const container = document.querySelector(selector ?? ".ovnerVideo-container");
    return {
        height: container.clientHeight, 
        width: container.clientWidth
    }
}
/**
 * Получает информацию о стране, ip и прочее
 * @param {(data: GoogleData)=> void} clb 
 */
export function getIp(clb: (data: {
    ip: string
    country: string
})=> void) {
    fetch("https://ipinfo.io/json?token=1e6873fa773047").then(
        (response)=> response.json()
    ).then(
        (jsonResponse)=> clb(jsonResponse)
    );
}
/**
 * 
 * @param err 
 */
export function errorMedia(err) { 
    console.log(err.name + ": " + err.message);
    if(err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        EVENT.emit('error', { text: 'Не подключена веб камера!' });
    }
    else if(err.name === 'NotAllowedError') {
        EVENT.emit('error', { text: 'Вы не дали разрешения на доступ к камере или микрофону!' });
    }
}
/**
 * Телефон или не телефон
 * @returns {boolean}
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
}
export async function checkCameraPermission() {
    try {
        const status = await navigator.permissions.query({ name: 'camera' });

        if(status.state === 'granted') {
            console.log('Доступ к камере предоставлен');
            return true;
        } 
        else if (status.state === 'prompt') {
            console.log('Пользователь ещё не дал разрешение, требуется запрос');
            return false;
        } 
        else if (status.state === 'denied') {
            console.log('Доступ к камере отклонён');
            return false;
        }
    } catch (error) {
        console.error('Ошибка проверки разрешений:', error);
        return false;
    }
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
export async function translateText(text: string, targetLang = 'ru') {
    if(targetLang === 'CN') targetLang = 'zh-CN';
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  
    const response = await fetch(url);
    const result = await response.json();
  
    return result[0][0][0];  // Получение переведённого текста
}
export async function detectFaces(video: HTMLVideoElement, clb?:(countFace: number)=> void) {
    await faceapi.nets.tinyFaceDetector.loadFromUri(gurl + '/models');

    setInterval(async()=> {
        const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions()
        );
    console.log('Лиц:', detections.length);
    if(clb) clb(detections.length);
    }, 1000);
}


export function convertTime(timestamp: number, format?:'TD'|'T'|'D') {
    const date = new Date(timestamp);

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear(); 

    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const formattedDate = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;

    if(!format || format==='TD') return {time:formattedTime, date:formattedDate};
    else if(format==='T') return formattedTime;
    else return formattedDate;
}
export function convertMilliseconds(ms: number) {
    const hours = Math.floor(ms / (1000 * 60 * 60)); // Получаем часы
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)); // Получаем минуты
    const seconds = Math.floor((ms % (1000 * 60)) / 1000); // Получаем секунды
  
    return `${hours} час(ов) ${minutes} минут(ы) ${seconds} секунд(ы)`;
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