import React from 'react';
import globalState from "../../global.state";
import { Button } from 'primereact/button';
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
const test2 = [
    {login: 'test12', text: 'Сделать это не сложно, достаточно написать следующее свойство!'},
    {login: 'test11', text: '🤮 🤮 🤮 🤮 🤮'},
];


export default function({ start }) { 
    const [massages, setMassages] = React.useState([]);
    const messagesContainerRef = React.useRef(null);

    
    const chek =(login: string)=> {
        const user = globalState.user.get();

        if(login !== user?.login) return true;
    }
    useDidMount(()=> {
        const placehold = import.meta.env.DEV ? test2 : [];

        socket.on('call', ()=> setMassages(placehold));
        socket.on('call.bot', ()=> setMassages(placehold));
        socket.on('endCall', ()=> setMassages([]));
        socket.on('endCall.bot', ()=> setMassages([]));

        socket.on('massage', (data)=> {
            setMassages((old)=> {
                return [data, ...old];
            });
        });
    });
    useWillUnmount(()=> {
        const placehold = import.meta.env.DEV ? test2 : [];

        socket.off('call', ()=> setMassages(placehold));
        socket.off('call.bot', ()=> setMassages(placehold));
        socket.off('endCall', ()=> setMassages([]));
        socket.off('endCall.bot', ()=> setMassages([]));
        
        socket.off('massage', (data)=> {
            setMassages((old)=> {
                return [data, ...old];
            });
        });
    });
    React.useEffect(()=> {
        const container = messagesContainerRef.current;

        container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
        });
    }, [massages]);
    React.useEffect(()=> {
        setMassages([]);
    }, [start]);


    return(
        <div className='Chat'>
            <div className='ChatContainer' 
                ref={messagesContainerRef} 
            >
                { massages.map((msg, index)=> 
                    <div key={index} className='MassageContainer'>
                        <div className='MassageHeader'
                            style={{color: chek(msg.login) ? '#e63228' : '#89ed7e'}}
                        >
                            { msg.login }:
                        </div>
                        <div className='MassageText'>
                            { msg.text }
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}