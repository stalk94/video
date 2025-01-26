import React from 'react';
import globalState from "../../global.state";
import { EVENT } from "../../lib/engine";
import { useHookstate } from '@hookstate/core';
import { useDidMount, useWillUnmount } from 'rooks';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Popover } from '@mantine/core';
import { FiUser } from "react-icons/fi";
import { TbMessageDots } from "react-icons/tb";
import User from "./user/index";
import Action from "./user/action";
import { useTranslation } from 'react-i18next';
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
const Avatar =({ setModal })=> {
    const user = useHookstate(globalState.user);
    const [opened, setOpened] = React.useState(false);
    
    const useAvatar =()=> {
        const userState = user.get({ noproxy: true });

        if(userState.avatar) return gurl + userState.avatar;
        else if(userState?.googleData?.img) return userState.googleData.img;
    }
    // вывалить предложение установить pwa
    const useInstallPwa =()=> {
        if(globalThis.deferredPrompt && !deferredPromptCanceled) {
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice
                .then((choiceResult)=> {
                    if(choiceResult.outcome === 'accepted') {
                        console.log('Приянто');
                    } 
                    else {
                        deferredPromptCanceled = true;
                        EVENT.emit('deferredPrompt.disable', undefined);
                    }
                    deferredPrompt = null;
                });
        }
    }
    useDidMount(()=> {
        EVENT.on('hidenModal', ()=> setModal());
    });
    useWillUnmount(()=> {
        EVENT.off('hidenModal', ()=> setModal());
    });
    

    return(
        <Popover
            opened={opened}
            onChange={setOpened}
            position="bottom-end"
            offset={{ mainAxis: 15, crossAxis: -70 }}
            withArrow
            arrowPosition="side"
            arrowOffset={80}
            arrowSize={12}
            id="UserMainDropDown"
        >
            <Popover.Target>
                <Button className="button userButton" id="user"
                    icon={
                        useAvatar()
                            ? <img style={{objectFit: 'cover'}}
                                src={ useAvatar() }
                                onError={(e)=> e.target.src = gurl + '/img/non-avatar.jpg'}
                                width='50px'
                                height='50px'
                            />
                            : <FiUser />
                    }
                    onClick={()=> setOpened(true)}
                />
            </Popover.Target>
            <Popover.Dropdown>
                <User setModal={setModal} />
            </Popover.Dropdown>
        </Popover>
    );
}


export default function({ useCall, peerId }: { useCall: (peerId: string)=> void, peerId: string }) { 
    const [curent, setCurent] = React.useState<'ls'|'beta'>();
    const op = React.useRef<OverlayPanel | null>(null);
    const userState = useHookstate(globalState.user);
    const [modal, setModal] = React.useState();
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
            { modal }
            <OverlayPanel ref={op}>
                { curent !== 'beta'
                    ? <Action />
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
                    setModal={setModal}
                />
            </section>
        </header>
    );
}