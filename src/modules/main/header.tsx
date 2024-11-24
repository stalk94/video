import React from 'react';
import globalState from "../../global.state";
import { useHookstate } from '@hookstate/core';
import { useDidMount, useIntervalWhen } from 'rooks';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
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
const Coins =({money})=> {
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


export default function({useCall, peerId}) { 
    const userState = useHookstate(globalState.user);


    return(
        <header>
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
                <div id="ls" >
                    <i className="pi pi-envelope" 
                        style={{
                            fontSize: '1.6rem', 
                            marginTop: '1.5px',
                            marginLeft: '1px'
                        }}
                    />
                </div>
                <div id="user" >
                    <i className="pi pi-user" 
                        style={{
                            fontSize: '1.9rem', 
                            marginTop: '3px',
                            marginLeft: '4px'
                        }}
                    />
                </div>
            </section>
        </header>
    );
}



/**
 * <Test 
                peerId={peerId}
                useCall={useCall}
            />
 */