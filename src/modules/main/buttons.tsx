import React from 'react';
import globalState from "../../global.state";
import { useHookstate } from '@hookstate/core';
import { Button } from 'primereact/button';
import { IoMaleFemale } from "react-icons/io5";
import { IoMdFemale, IoMdMale } from "react-icons/io";
import { FaSearchengin } from "react-icons/fa6";
import { FaPlay, FaAngleDoubleRight } from "react-icons/fa";
import { RiTimerFlashLine } from "react-icons/ri";
import { FaStop } from "react-icons/fa6";
import Modal from "../../component/modal";
import { useWindowSize } from "react-use";
import { useTranslation } from 'react-i18next';
import { PropsButtonsPanel, PropsButtonsPanelMobail } from "./type";

const Timer =({ time }: { time: number })=> {
    const convertMilliseconds =(ms: number)=> {
        //const hours = Math.floor(ms / (1000 * 60 * 60)); // Получаем часы
        let minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)); // Получаем минуты
        let seconds = Math.floor((ms % (1000 * 60)) / 1000); // Получаем секунды
        if(minutes < 10) minutes = '0' + minutes;
        if(seconds < 10) seconds = '0' + seconds;
      
        return `${minutes}:${seconds}`;
    }
    

    return(
        <div className='Timer'>
            { time && time < 2 && convertMilliseconds(time) }
        </div>
    );
}
function Buttons({ useClickButton }: { useClickButton: (type: 'search'|'m'|'f'|'mf')=> void }) {
    const activate = useHookstate(globalState.user.activate);
    const styleActiv = {
        
    }

    return(
        <div className='RightPanelButtons'>
            <Button className="button"
                style={activate?.m?.get() ? styleActiv : {}}
                disabled={activate?.m?.get()}
                icon={ <IoMdMale /> }
                onClick={()=> useClickButton('m')}
            />
            <Button className="button"
                style={activate?.f?.get() ? styleActiv : {}}
                disabled={activate?.f?.get()}
                icon={ <IoMdFemale /> }
                onClick={()=> useClickButton('f')}
            />
            <Button className="button"
                style={activate?.mf?.get() ? styleActiv : {}}
                disabled={activate.mf.get()}
                icon={ <IoMaleFemale style={{marginTop:'0.2rem'}} /> }
                onClick={()=> useClickButton('mf')}
            />
            <div style={{position:'relative'}}>
                <Timer time={globalState.user.timeSuperFind.get()}/>
                <Button className="button"
                    style={activate.search.get() ? styleActiv : {}}
                    disabled={activate.search.get()}
                    icon={
                        activate.search.get()
                            ? <RiTimerFlashLine style={{fontSize:'2rem'}} />
                            : <FaSearchengin />
                    }
                    onClick={()=> useClickButton('search')}
                />
            </div>
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

    }


    return(
        <div className='PanelButtonsMobail'>
            <div className='ButtonsMobailLeft'>
                <div style={{position:'relative'}}>
                    <Timer time={globalState.user.timeSuperFind.get()}/>
                    <Button className="button functionButton"
                        style={activate.search.get() ? {...styleActiv, marginRight: '10px'} :{marginRight: '10px'}}
                        disabled={activate.search.get()}
                        icon={
                            activate.search.get()
                                ? <RiTimerFlashLine style={{fontSize:'4.7rem'}} />
                                : <FaSearchengin />
                        }
                        onClick={()=> useClickButton('search')}
                    />
                </div>
                <Button className="button functionButton" 
                    style={activate?.mf?.get() ? styleActiv : {}}
                    disabled={activate?.mf?.get()}
                    icon={ <IoMaleFemale style={{marginTop:'0.5rem'}} /> }
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
                    icon={ <IoMdMale /> }
                    onClick={()=> useClickButton('m')}
                />
                <Button className="button functionButton"
                    style={activate?.f?.get() ? styleActiv : {}}
                    disabled={activate?.f?.get()}
                    icon={ <IoMdFemale /> }
                    onClick={()=> useClickButton('f')}
                />
            </div>
        </div>
    );
}



export default function({start, useStart, useNext}: PropsButtonsPanel) {
    const [modal, setModal] = React.useState<React.ReactElement | undefined>();
    const { t, i18n } = useTranslation();
    const resize = useWindowSize();
    
    const texts = {
        m: t('modal_m'),
        f: t('modal_fem'),
        mf: t('modal_mf'),
        search: t('modal_search')
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
        if(import.meta.env.DEV) {
            if(type !== 'search') {
                useConfirm(t('label_modal'), 
                    texts[type],
                    ()=> socket.emit('activate', {peerId: globalThis.peerId, type: type}),
                    ()=> console.log('cancel')
                );
            }
            else {
                useConfirm(t('label_modal'), 
                    texts[type],
                    ()=> socket.emit('activate', {peerId: globalThis.peerId, type: type}),
                    ()=> console.log('cancel')
                );
            }
        }
        else useConfirm(t('label_modal'), 
            t('beta_modal'),
            ()=> console.log('cancel'),
            ()=> console.log('cancel')
        );
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