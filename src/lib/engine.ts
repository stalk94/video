import EventEmiter from "./emiter";


// http://localhost:3000/ https://intimalive.com/
window.gurl = import.meta.env.DEV ? 'http://localhost:3000/' : 'https://intimalive.com/';
window.languages = ['GB', 'RU', 'CN', 'DE'];
export const EVENT = new EventEmiter();

/**
 * 
 * @param {string} url 
 * @param {*} data 
 * @param {'GET'|'POST'} metod 
 * @returns 
 */
export async function send(url, data, metod) {
    let dataServer = {
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