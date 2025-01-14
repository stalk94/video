import React from 'react';
import { Button } from 'primereact/button';
import globalState from "../../global.state";
import { useHookstate } from '@hookstate/core';
import { InputText } from 'primereact/inputtext';
import { FaRegHeart } from "react-icons/fa";
import { IoGiftSharp } from "react-icons/io5";
import { OverlayPanel } from 'primereact/overlaypanel';
import "../../css/footer.css";



export default function({ start }: {start: boolean}) {
    const op = React.useRef(null);
    const ovnerState = useHookstate(globalState.ovner);
    const [text, setText] = React.useState<string>();

    const useSend =()=> {
        if(text.length >= 2 && text.length < 100) {
            socket.emit('send.massage', {
                peerId: globalThis.peerId,
                text: text
            });
            setText('');
        }
    }
    const useClickLike =()=> {
        if(ovnerState?.peerId?.get() !== undefined) socket.emit('like', {
            peerId: globalThis.peerId,
            peerIdLike: ovnerState.peerId.get()
        });
    }
    const useClickGift =(e)=> {
        op.current.toggle(e);
    }


    return(
        <footer>
            <OverlayPanel ref={op}>
                В разработке!
            </OverlayPanel>
            <div className='FooterWraper'>
            <div className='PanelFooter'>
                <Button className="button" id="like"
                    icon={
                        <FaRegHeart />
                    }
                    onClick={useClickLike}
                    disabled={!start}
                />
                <Button className="button" id="gift"
                    icon={
                        <IoGiftSharp />
                    }
                    onClick={useClickGift}
                    disabled={!start}
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
                    disabled={!start}
                    onClick={useSend}
                />
            </div>
            </div>
        </footer>
    );
}