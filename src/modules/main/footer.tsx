import React from 'react';
import { Button } from 'primereact/button';
import globalState from "../../global.state";
import { useHookstate } from '@hookstate/core';
import { InputText } from 'primereact/inputtext';
import "../../css/footer.css";



export default function({start}: {start: boolean}) {
    const [text, setText] = React.useState<string>();

    const useSend =()=> {
        if(text.length >= 2 && text.length < 100) {
            socket.emit('send.massage', {
                peerId: globalThis.peerId,
                massage: text
            });
            setText();
        }
    }
    const useClickLike =()=> {

    }
    const useClickGift =()=> {
        
    }


    return(
        <footer>
            <div className='PanelFooter'>
                <Button className="button" id="like"
                    icon="pi pi-heart"
                    onClick={useClickLike}
                />
                <Button className="button" id="gift"
                    icon="pi pi-gift"
                />
            </div>
            <div className='InputChatContainer'>
                <InputText className='InputChat'
                    value={text} 
                    onChange={(e)=> setText(e.target.value)}
                    placeholder='max 100 simbol'
                />
                <Button style={{marginLeft: '10px', width: '11%'}}
                    icon="pi pi-send"
                    label='Отправить'
                    disabled={!start}
                    onClick={useSend}
                />
            </div>
        </footer>
    );
}