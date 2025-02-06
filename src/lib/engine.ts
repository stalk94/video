import EventEmiter from "./emiter";
import ReactGA from "react-ga4";


window.gurl = import.meta.env.DEV ? 'http://localhost:3000/' : 'https://intimalive.com/';
window.languages = ['GB', 'RU', 'CN', 'DE'];
window.strapi_key = 'pk_test_51QmZViCGiZrOrC2C5RhE52vwW3qqiDTSmRLUYPNTysMfHeykhhwqq9h4BBuGqFaDl4UlUccpQFezJOve2hnIxDj600r0ey3XPa';
ReactGA.initialize('G-RSCTT3EJEQ');
export const EVENT = new EventEmiter();



/**
 * 
 * @param {string} url 
 * @param {*} data 
 * @param {'GET'|'POST'} metod 
 * @returns 
 */
export async function send(url: string, data: any, metod: 'GET'|'POST') {
    const dataServer = {
        method: metod ?? 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    if(metod!=='GET') dataServer.body = JSON.stringify(data);

    const request = await fetch(window.gurl + url, dataServer);
    return request.json();
}