import React from 'react';
import { Button } from 'primereact/button';
import globalState from "../../global.state";
import { useHookstate } from '@hookstate/core';
import { InputText } from 'primereact/inputtext';
import { FaRegHeart } from "react-icons/fa";
import { IoGiftSharp } from "react-icons/io5";
import { OverlayPanel } from 'primereact/overlaypanel';
import { useDidMount, useWillUnmount } from "rooks";
import Gift from "./gift";
import "../../css/footer.css";



export default function({ input }: {input: boolean}) {
    const op = React.useRef(null);
    const ovnerState = useHookstate(globalState.ovner);
    const [text, setText] = React.useState<string>();

    const useSend =()=> {
        if(text.length >= 2 && text.length < 100 && ovnerState?.peerId?.get() !== undefined) {
            socket.emit('send.massage', {
                peerId: globalThis.peerId,
                text: text
            });
            setText('');
        }
    }
    const useLike =()=> {
        const heartContainer = document.getElementById('heart-container');
        const button = document.getElementById('like');
        const heart = document.createElement('div');
        heart.className = 'heart';
        const left = window.innerWidth < 1280 ? 60 : 30;
        const top = window.innerWidth < 1280 ? window.innerHeight - 100 : button.offsetTop;

        // Устанавливаем позицию сердечка
        heart.style.left = `${left}px`;
        heart.style.top = `${top}px`;
        //heart.style.transform = `rotate(${rand.getRandom(45, 180)}deg)`;

        // Добавляем элемент в контейнер
        heartContainer.appendChild(heart);

        // Удаляем сердечко после завершения анимации
        heart.addEventListener('animationend', ()=> {
            heart.remove();
        });
    }
    const useClickLike =(e)=> {
        useLike(e);
        if(ovnerState?.peerId?.get() !== undefined) socket.emit('like', {
            peerId: globalThis.peerId,
            peerIdLike: ovnerState.peerId.get()
        });
    }
    const useClickGift =(e)=> {
        op.current.toggle(e);
    }
    useDidMount(()=> {
        socket.on('set.like', (data)=> {
            useLike();
            globalState.user.likes.set(data.likes);
        });
    });
    useWillUnmount(()=> {
        socket.off('set.like', (data)=> {
            useLike();
            globalState.user.likes.set(data.likes);
        });
    });


    return(
        <footer>
            <OverlayPanel ref={op}>
                { import.meta.env.DEV 
                    ? <Gift input={input} />
                    : <div style={{padding:'2%'}}>В разработке!</div>
                }
            </OverlayPanel>
            <div className='FooterWraper'>
            <div className='PanelFooter'>
                <Button className="button" id="like"
                    icon={
                        <FaRegHeart />
                    }
                    onClick={useClickLike}
                />
                <Button className="button" id="gift"
                    icon={
                        <IoGiftSharp />
                    }
                    onClick={useClickGift}
                />
            </div>
            <div className='InputChatContainer'>
                <InputText className='InputChat'
                    value={text} 
                    onChange={(e)=> setText(e.target.value)}
                    placeholder='max 100 simbol'
                />
            </div>
            <div className='PanelFooterRight'>
                <Button className='ButtonInputChat'
                    icon="pi pi-send"
                    label='Отправить'
                    onClick={useSend}
                />
            </div>
            </div>
        </footer>
    );
}