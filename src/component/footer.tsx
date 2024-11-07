import React from 'react';
import { Button } from 'primereact/button';
import globalState from "../global.state";
import { useHookstate } from '@hookstate/core';
import { InputText } from 'primereact/inputtext';
import "../css/footer.css";


const ChatInput =({start})=> {
    const [text, setText] = React.useState('');

    const useSend =()=> {
        if(text.length >= 2 && text.length < 100) {
            socket.emit('send.massage', {
                peerId: globalThis.peerId,
                massage: text
            });
            setText();
        }
    }

    return(
        <React.Fragment>
            <InputText
                value={text} 
                onChange={(e)=> setText(e.target.value)}
                placeholder='max 100 simbol'
                style={{width: '80%'}}
            />
            <Button style={{marginLeft: '10px'}}
                icon="pi pi-send"
                label='Отправить'
                disabled={!start}
                onClick={useSend}
            />
        </React.Fragment>
    );
}


export default function({start, useStart}) {
    const forvards = useHookstate(globalState.user.forvards);
    const ovnerState = useHookstate(globalState.ovner);

    const chek =(ovnerState)=> {
        const curForv = forvards?.get({noproxy: true});
        const find = curForv.find((elem)=> elem = ovnerState.login);

        return find;
    }
    const useForvard =()=> {
        const curState = ovnerState.get({noproxy: true});

        if(curState?.login) socket.emit('favorite', {
            peerId: globalThis.peerId,
            forvardLogin: curState.login
        });
    }


    return(
        <React.Fragment>
            <div className='Footer-1'>
                <Button className="p-button-info"
                    icon="pi pi-cog"
                />
                { start &&
                    <div style={{ marginLeft: '40%', display: 'flex', flexDirection: 'row' }}>
                        <Button className="p-button-danger"
                            style={{ marginRight: '10px' }}
                            label='EXIT'
                            icon="pi pi-sign-out"
                            onClick={()=> useStart(false)}
                        />
                        <Button className="p-button-success"
                            icon={`pi ${chek(ovnerState.get()) ? 'pi-minus' : 'pi-plus'}`}
                            onClick={()=> useForvard()}
                        />
                        <Button style={{ marginLeft: '10px' }}
                            label='NEXT'
                            icon="pi pi-forward"
                            onClick={()=> useStart(true)}
                        />
                    </div>
                }
                { !start &&
                    <div style={{ marginLeft: '40%', display: 'flex', flexDirection: 'row' }}>
                        <Button className="p-button-success"
                            label='START'
                            icon="pi pi-play"
                            onClick={()=> useStart(true)}
                        />
                    </div>
                }
            </div>
            <div className='Footer-2'>
                <ChatInput
                    start={start}
                />
            </div>
        </React.Fragment>
    );
}