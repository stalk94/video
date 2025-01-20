import React from 'react';
import globalState from "../../global.state";
import { useHookstate } from '@hookstate/core';
import { Button } from 'primereact/button';
import { IoMaleFemale } from "react-icons/io5";
import { IoMdFemale, IoMdMale } from "react-icons/io";
import { FaSearchengin } from "react-icons/fa6";
import { FaPlay, FaAngleDoubleRight } from "react-icons/fa";
import { FaRegCircleStop } from "react-icons/fa6";
import { FaStop } from "react-icons/fa6";
import Modal from "../../component/modal";
import { useOrientation, useWindowSize } from "react-use";
import { PropsButtonsPanel, PropsButtonsPanelMobail } from "./type";


function Buttons({ useClickButton }: { useClickButton: (type: 'search'|'m'|'f'|'mf')=> void }) {
    const activate = useHookstate(globalState.user.activate);
    const styleActiv = {
        border:'2px solid gold'
    }

    return(
        <div className='RightPanelButtons'>
            <Button className="button"
                style={activate?.m?.get() ? styleActiv : {}}
                disabled={activate?.m?.get()}
                icon={
                    <IoMdMale style={{color: activate.m.get() ? 'gold' : ''}} />
                }
                onClick={()=> useClickButton('m')}
            />
            <Button className="button"
                style={activate?.f?.get() ? styleActiv : {}}
                disabled={activate?.f?.get()}
                icon={
                    <IoMdFemale style={{color: activate.f.get() ? 'gold' : ''}} />
                }
                onClick={()=> useClickButton('f')}
            />
            <Button className="button"
                style={activate?.mf?.get() ? styleActiv : {}}
                disabled={activate?.mf?.get()}
                icon={
                    <IoMaleFemale style={{marginTop:'0.2rem', color: activate.mf.get() ? 'gold' : ''}} />
                }
                onClick={()=> useClickButton('mf')}
            />
            <Button className="button"
                style={activate.search.get() ? styleActiv : {}}
                disabled={activate.search.get()}
                icon={
                    <FaSearchengin style={{color: activate.search.get() ? 'gold' : ''}} />
                }
                onClick={()=> useClickButton('search')}
            />
        </div>
    );
}
function ButtonsPlay({ start, useStart, useNext }: PropsButtonsPanel) {
    const ovnerState = useHookstate(globalState.ovner);


    return(
        <div className='PanelButtons'>
            {!start &&
                <div style={{ marginLeft: '46%', display: 'flex', flexDirection: 'row' }}>
                    <Button className="button" id="start"
                        icon={ <FaPlay /> }
                        onClick={()=> useStart(true)}
                    />
                </div>
            }
            { start &&
                <div style={{ marginLeft: '46%', display: 'flex', flexDirection: 'row' }}>
                    <Button className="button" id="stop"
                        icon={ <FaStop /> }
                        onClick={()=> useStart(false)}
                    />
                    <Button className="button" id="next"
                        icon={
                            <FaAngleDoubleRight />
                        }
                        onClick={()=> useNext()}
                    />
                </div>
            }
        </div>
    );
}
function ButtonsMobail({ useClickButton, start, useStart, useNext }: PropsButtonsPanelMobail) {
    const activate = useHookstate(globalState.user.activate);
    const styleActiv = {
        border:'2px solid gold'
    }


    return(
        <div className='PanelButtonsMobail'>
            <div className='ButtonsMobailLeft'>
                <Button className="button functionButton"
                    style={activate.search.get() ? {...styleActiv, marginRight: '10px'} :{marginRight: '10px'}}
                    disabled={activate.search.get()}
                    icon={
                        <FaSearchengin style={{color: activate.search.get() ? 'gold' : ''}} />
                    }
                    onClick={()=> useClickButton('search')}
                />
                <Button className="button functionButton" 
                    style={activate?.mf?.get() ? styleActiv : {}}
                    disabled={activate?.mf?.get()}
                    icon={
                        <IoMaleFemale style={{marginTop:'0.5rem', color: activate.mf.get() ? 'gold' : ''}} />
                    }
                    onClick={()=> useClickButton('mf')}
                />
            </div>

            { !start &&
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Button className="button" id="start"
                        icon={ <FaPlay /> }
                        onClick={()=> useStart(true)}
                    />
                </div>
            }
            { start &&
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Button className="button" id="stop"
                        icon={ <FaStop /> }
                        onClick={()=> useStart(false)}
                    />
                    <Button className="button" id="next"
                        style={{ marginLeft: '10px' }}
                        icon={ <FaAngleDoubleRight /> }
                        onClick={()=> useNext()}
                    />
                </div>
            }

            <div className='ButtonsMobailRight'>
                <Button className="button functionButton"
                    style={activate?.m?.get() ? {...styleActiv, marginRight: '10px'} : {marginRight: '10px'}}
                    disabled={activate?.m?.get()}
                    icon={
                        <IoMdMale style={{color: activate.m.get() ? 'gold' : ''}} />
                    }
                    onClick={()=> useClickButton('m')}
                />
                <Button className="button functionButton"
                    style={activate?.f?.get() ? styleActiv : {}}
                    disabled={activate?.f?.get()}
                    icon={
                        <IoMdFemale style={{color: activate.f.get() ? 'gold' : ''}} />
                    }
                    onClick={()=> useClickButton('f')}
                />
            </div>
        </div>
    );
}



export default function({start, useStart, useNext}: PropsButtonsPanel) {
    const [modal, setModal] = React.useState<React.ReactElement | undefined>();
    const resize = useWindowSize();
    
    const texts = {
        m: 'Выбор пола доступен при балансе выше 50 COINS. Вы хотите активировать поиск по мужскому полу. ',
        f: 'Выбор пола доступен при балансе выше 50 COINS. Вы хотите активировать поиск по женскому полу. ',
        mf: 'Выбор пола доступен при балансе выше 50 COINS. Вы хотите активировать поиск по М/Ж полу. ',
        search: 'Активация супер поиска стоит 10 COINS на 60 минут. '
    }
    const useConfirm =(header:React.ReactNode, message:React.ReactNode, accept:()=> void, reject:()=> void)=> {
        setModal(
            <Modal
                visible={true}
                setVisible={()=> setModal()}
                message={message}
                header={header}
                accept={accept}
                reject={reject}
            />
        );
    }
    const useClickButton =(type: 'search'|'m'|'f'|'mf')=> {
        const ps = `P.S: активация данной способности увеличивает шанс!`;

        useConfirm('Активация способности', 
            'В beta версии данная функция не доступна!',
            ()=> console.log('cancel'),
            ()=> console.log('cancel')
        );
        return true;

        if(type !== 'search') {
            useConfirm('Активация способности', 
                texts[type] + ps,
                ()=> socket.emit('activate', {peerId: globalThis.peerId, type: type}),
                ()=> console.log('cancel')
            );
        }
        else {
            useConfirm('Активация способности', 
                texts[type] + ps,
                ()=> socket.emit('activate', {peerId: globalThis.peerId, type: type}),
                ()=> console.log('cancel')
            );
        }
    }
    

    return(
        <div className='PanelButtonsAll'>
            { modal }
            { resize.width > 1280
                ? <React.Fragment>
                    <ButtonsPlay 
                        start={start}
                        useStart={useStart}
                        useNext={useNext}
                    />
                    <Buttons
                        useClickButton={useClickButton}
                    />
                 </React.Fragment>
                : <React.Fragment>
                    <ButtonsMobail
                        start={start}
                        useStart={useStart}
                        useNext={useNext}
                        useClickButton={useClickButton}
                    />
                </React.Fragment>
            }
        </div>
    );
}