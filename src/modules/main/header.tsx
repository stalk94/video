import React from 'react';
import globalState from "../../global.state";
import { useHookstate } from '@hookstate/core';
import { useDidMount, useIntervalWhen } from 'rooks';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { FiUser } from "react-icons/fi";
import { TbMessageDots } from "react-icons/tb";
import DropMain from "./user/index";
import { useTranslation } from 'react-i18next';
import { PropsClick } from "./type";
import "../../css/header.css";



const Test =({ useCall, peerId })=> {
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
const Coins =({ money }: { money: number})=> {
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
const Avatar =({ useClickUser }: PropsClick)=> {
    const user = useHookstate(globalState.user);
    
    const useSize =()=> {
        if(window.innerHeight < 1280) return '50px';
        else return '90px'
    }

    return(
        <Button className="button" id="user"
            icon={
                user.get({ noproxy: true })?.googleData?.img
                    ? <img style={{}}
                        src={user.get({ noproxy: true }).googleData.img}
                        width={useSize()}
                        width={useSize()}
                    />
                    : <FiUser />
            }
            onClick={useClickUser}
        />
    );
}


export default function({ useCall, peerId }: { useCall: (peerId: string)=> void, peerId: string }) { 
    const [curent, setCurent] = React.useState<'ls'|'user'|'beta'>();
    const op = React.useRef<OverlayPanel | null>(null);
    const userState = useHookstate(globalState.user);
    const { t, i18n } = useTranslation();

    const useClickBeta =(e: React.MouseEvent<HTMLElement, MouseEvent>)=> {
        setCurent('beta');
        op.current.toggle(e);
    }
    const useClickUser =(e: React.MouseEvent<HTMLElement, MouseEvent>)=> {
        setCurent('user');
        op.current.toggle(e);
    }
    const useClickLs =(e: React.MouseEvent<HTMLElement, MouseEvent>)=> {
        setCurent('ls');
        op.current.toggle(e);
    }


    return(
        <header>
            <OverlayPanel ref={op} style={{maxWidth:'50vw'}}>
                { curent !== 'beta'
                    ? <DropMain 
                        type={curent} 
                     />
                    : <div style={{padding:'2vh'}}>
                        { t('beta_logo_info') }
                     </div>
                }
            </OverlayPanel>
            <Test 
                peerId={peerId}
                useCall={useCall}
            />

            <section className='Left' onClick={useClickBeta}>
                <div className='Logo'>
                    INTIMALIVE
                </div>
                <div className='BetaLabel'>
                    beta
                </div>
            </section>
            <section className='Right'>
                <Coins 
                    money={userState.money.get()} 
                />
                <Button className="button" id="ls"
                    icon={ <TbMessageDots /> }
                    onClick={useClickLs}
                />
                <Avatar
                    useClickUser={useClickUser}
                />
            </section>
        </header>
    );
}