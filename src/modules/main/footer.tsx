import React from 'react';
import { Button } from 'primereact/button';
import globalState from "../../global.state";
import { useHookstate } from '@hookstate/core';
import { InputText } from 'primereact/inputtext';
import "../../css/footer.css";



export default function({ start }: {start: boolean}) {
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
    const useClickGift =()=> {
        
    }


    return(
        <footer>
            <div className='FooterWraper'>
            <div className='PanelFooter'>
                <Button className="button" id="like"
                    icon="pi pi-heart"
                    onClick={useClickLike}
                />
                <Button className="button" id="gift"
                    icon="pi pi-gift"
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
                    disabled={!start}
                    onClick={useSend}
                />
            </div>
            </div>
        </footer>
    );
}