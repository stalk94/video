import React from 'react';
import globalState from "../../global.state";
import { Button } from 'primereact/button';
import { ScrollPanel } from 'primereact/scrollpanel';
import { useDidMount, useWillUnmount } from 'rooks';
import "../../css/chat.css";

const test = [
    {login: 'test12', text: 'Сделать это не сложно, достаточно написать следующее свойство!'},
    {login: 'test11', text: '🤮 🤮 🤮 🤮 🤮'},
    {login: 'test12', text: 'xxxxxxxxxxx'},
    {login: 'test11', text: 'xxxxxxxxxxx'},
    {login: 'test12', text: '⌛ ⌛ достаточно написать следующее свойство'},
    {login: 'test11', text: 'Скрыть полосу прокрутки можно как у отдельного элемента на странице, так и у всей страницы целиком. Сделать это не сложно, достаточно написать следующее свойство'},
    {login: 'test12', text: 'xxxxxxxxxxx'},
    {login: 'test11', text: 'xxxxxxxxxxx'},
    {login: 'test12', text: 'xxxxxxxxxxx'},
    {login: 'test11', text: 'xxxxxxxxxxx'},
    {login: 'test11', text: 'xxxxxxxxxxx'},
    {login: 'test12', text: 'xxxxxxxxxxx'},
    {login: 'test11', text: 'xxxxxxxxxxx'},
];


export default function() { 
    const [massages, setMassages] = React.useState(test);
    
    const chek =(login: string)=> {
        const user = globalState.user.get();

        if(login !== user?.login) return true;
    }
    useDidMount(()=> {
        console.log('MOUNT')
        socket.on('call', ()=> setMassages([]));
        socket.on('call.bot', ()=> setMassages([]));
        socket.on('endCall', ()=> setMassages([]));
        socket.on('endCall.bot', ()=> setMassages([]));
        socket.on('massage', (data)=> {
            console.log('new MASSAGE: ', data)
            setMassages((old)=> {
                return [...old, data];
            });
        });
    });
    useWillUnmount(()=> {
        socket.off('call', ()=> setMassages([]));
        socket.off('call.bot', ()=> setMassages([]));
        socket.off('endCall', ()=> setMassages([]));
        socket.off('endCall.bot', ()=> setMassages([]));
        socket.off('massage', (data)=> {
            console.log('new MASSAGE: ', data)
            setMassages((old)=> {
                return [...old, data];
            });
        });
    });


    return(
        <div className='Chat'>
            { massages.map((msg, index)=> 
                <div key={index} className='MassageContainer'>
                    <div className='MassageHeader'
                        style={{color: chek(msg.login) ? 'red' : 'green'}}
                    >
                        { msg.login }:
                    </div>
                    <div className='MassageText'>
                        { msg.text }
                    </div>
                </div>
            )}
        </div>
    );
}