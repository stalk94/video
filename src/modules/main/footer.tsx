import "../../global.d.ts";
import React from 'react';
import { EVENT } from '../../lib/engine';
import { Button } from 'primereact/button';
import globalState from "../../global.state";
import { useHookstate } from '@hookstate/core';
import { InputText } from 'primereact/inputtext';
import { FaRegHeart } from "react-icons/fa";
import { IoGiftSharp } from "react-icons/io5";
import { OverlayPanel } from 'primereact/overlaypanel';
import { useDidMount, useWillUnmount } from "rooks";
import Gift, { Likes } from "./gift";
import { Popover } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { SetLikeEvent, GiftData } from "./type";
import "../../css/footer.css";



export default function({ input }: {input: boolean}) {
    const likeRef = React.useRef<OverlayPanel | null>(null);
    const ovnerState = useHookstate(globalState.ovner);
    const [text, setText] = React.useState<string>();
    const [opened, setOpened] = React.useState(false);
    const { t, i18n } = useTranslation();

    const useSend =()=> {
        if(text?.length >= 2 && text?.length < 100 && ovnerState?.peerId?.get() !== undefined) {
            socket.emit('send.massage', {
                peerId: globalThis.peerId,
                text: text
            });
            setText('');
        }
    }
    const useGift =(anim: string)=> {
        switch(anim) {
            case 'fall.petal':
                EVENT.emit('anim', {type: 'fall', image: 'petal'});
            break;
            case 'fall.rose':
                EVENT.emit('anim', {type: 'fall', image: 'rose'});
            break;
            case 'rocket':
                EVENT.emit('anim', {type: 'rocket', count: 24});
            break;
        }
    }
    const useLike =(type: 'heart'|'fire'|'lips'|'rose')=> {
        if(type === 'lips') EVENT.emit('anim', {type: 'kiss'});
        else if(type === 'fire') EVENT.emit('anim', {type: 'fier', count: 5});
        else if(type === 'rose') EVENT.emit('anim', {type: 'specRocket', count: 16});

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
    const useClickLike =(e: React.MouseEvent<HTMLElement, MouseEvent>, type: 'heart'|'fire'|'lips'|'rose')=> {
        useLike(type);
        if(ovnerState?.peerId?.get() !== undefined) socket.emit('like', {
            peerId: globalThis.peerId,
            peerIdLike: ovnerState.peerId.get(),
            type: type
        });
    }
    const useClickGift =(e: React.MouseEvent<HTMLElement, MouseEvent>)=> {
        //if(window.innerWidth < 1280) setVisible(true);
        setOpened(true)
    }
    useDidMount(()=> {
        socket.on('set.like', (data: SetLikeEvent)=> {
            useLike(data.type);
            globalState.user.likes.set(data.likes);
        });
        socket.on('gift.add', (data: GiftData)=> {
            if(data.anim) useGift(data.anim);
        });
        socket.on('gift.pay', (data: GiftData)=> {
            if(data.anim) useGift(data.anim);
        });
    });
    useWillUnmount(()=> {
        socket.off('set.like', (data)=> {
            useLike(data.type);
            globalState.user.likes.set(data.likes);
        });
        socket.off('gift.add', (data: GiftData)=> {
            if(data.anim) useGift(data.anim);
        });
        socket.off('gift.pay', (data: GiftData)=> {
            if(data.anim) useGift(data.anim);
        });
    });


    return(
        <footer>
            <OverlayPanel 
                breakpoints={{'960px': '70vw', '400px': '80vw'}}
                ref={likeRef}
                className='LikesOverlay'
            >
                <Likes useClickLike={useClickLike} />
            </OverlayPanel>
            <div className='FooterWraper'>
                <div className='PanelFooter'>
                    <Button className="button" id="like"
                        icon={ <FaRegHeart /> }
                        onClick={(e)=> likeRef.current.toggle(e)}
                    />
                    <Popover 
                        opened={opened} 
                        onChange={setOpened } 
                        position="top-start" 
                        offset={{ mainAxis: 15, crossAxis: -70 }}
                        withArrow 
                        arrowPosition="side"
                        arrowOffset={80} 
                        arrowSize={12}
                    >
                        <Popover.Target>
                            <Button className="button giftButton"
                                icon={ <IoGiftSharp /> }
                                onClick={useClickGift}
                            />
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Gift input={input} />
                        </Popover.Dropdown>
                    </Popover>
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
                        label={ window.innerWidth < 1280 ? '' : t('label_btn_send') }
                        onClick={useSend}
                    />
                </div>
            </div>
        </footer>
    );
}