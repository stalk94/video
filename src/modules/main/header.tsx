import React from 'react';
import globalState from "../../global.state";
import { useHookstate } from '@hookstate/core';
import { useDidMount, useIntervalWhen } from 'rooks';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { FiUser } from "react-icons/fi";
import { TbMessageDots } from "react-icons/tb";
import DropMain from "./user/index";
import "../../css/header.css";



const Test =({useCall, peerId})=> {
    const ref = React.useRef(null);
    const [val, setVal] = React.useState();

    useDidMount(()=> {
        document.addEventListener('keydown', (event)=> {
            if(event.key == '/') {
                ref.current.toggle(document.querySelector('.Left'));
            }
        });
    });
    

    return(
        <OverlayPanel ref={ref}>
            <div className='TestCallOverlay'>
                <div style={{fontSize:'14px', marginTop:'auto', marginBottom:'auto'}}>
                    { peerId }
                </div>
                <input style={{marginLeft:'5px'}}
                    value={val}
                    onChange={(e)=> setVal(e.target.value)}
                />
                <button onClick={()=> useCall(val)}>Call</button>
            </div>
        </OverlayPanel>
    );
}
const Coins =({ money })=> {
    return(
        <div className='CoinsContainer'>
            <div style={{}}>
                COINS:
            </div>
            <div style={{marginLeft:'5px'}}>
                { money }
            </div>
        </div>
    );
}


export default function({useCall, peerId}: {useCall:(peerId:string)=> void, peerId:string}) { 
    const [curent, setCurent] = React.useState<'ls'|'user'>();
    const op = React.useRef(null);
    const userState = useHookstate(globalState.user);


    const useClickUser =(e)=> {
        setCurent('user');
        op.current.toggle(e);
    }
    const useClickLs =(e)=> {
        setCurent('ls');
        op.current.toggle(e);
    }


    return(
        <header>
            <OverlayPanel ref={op}>
                <DropMain 
                    type={curent} 
                />
            </OverlayPanel>
            <Test 
                peerId={peerId}
                useCall={useCall}
            />

            <section className='Left'>
                <div className='Logo'>
                    INTIMALIVE
                </div>
            </section>
            <section className='Right'>
                <Coins 
                    money={userState.money.get()} 
                />
                <Button className="button" id="ls"
                    icon={
                        <TbMessageDots />
                    }
                    onClick={useClickLs}
                />
                <Button className="button" id="user"
                    icon={
                        <FiUser />
                    }
                    onClick={useClickUser}
                />
            </section>
        </header>
    );
}