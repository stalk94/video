import React from 'react';
import globalState from "../../global.state";
import { useHookstate } from '@hookstate/core';
import { Button } from 'primereact/button';
import { IoMaleFemale } from "react-icons/io5";
import { IoMdFemale, IoMdMale } from "react-icons/io";
import { FaSearchengin } from "react-icons/fa6";
import Modal from "../../component/modal";
import { useOrientation, useWindowSize } from "react-use";
import { useDidMount, useWillUnmount } from 'rooks';


function Buttons({ useClickButton }) {
    const activate = useHookstate(globalState.user.activate);
    const styleActiv = {
        color: '#4dcdf5',
        backgroundColor: '#2b253a7a'
    }

    return(
        <div className='RightPanelButtons'>
            <Button className="button"
                style={activate?.m?.get() ? styleActiv : {}}
                disabled={activate?.m?.get()}
                icon={
                    <IoMdMale />
                }
                onClick={()=> useClickButton('m')}
            />
            <Button className="button"
                style={activate?.f?.get() ? styleActiv : {}}
                disabled={activate?.f?.get()}
                icon={
                    <IoMdFemale />
                }
                onClick={()=> useClickButton('f')}
            />
            <Button className="button"
                style={activate?.mf?.get() ? styleActiv : {}}
                disabled={activate?.mf?.get()}
                icon={
                    <IoMaleFemale />
                }
                onClick={()=> useClickButton('mf')}
            />
            <Button className="button"
                style={globalState?.user?.timeSuperFind?.get() ? styleActiv : {}}
                disabled={globalState?.user?.timeSuperFind?.get()}
                icon={
                    <FaSearchengin />
                }
                onClick={()=> useClickButton('search')}
            />
        </div>
    );
}
function ButtonsPlay({ start, useStart, useNext }) {
    const ovnerState = useHookstate(globalState.ovner);


    return(
        <div className='PanelButtons'>
            {!start &&
                <div style={{ marginLeft: '46%', display: 'flex', flexDirection: 'row' }}>
                    <Button className="button" id="start"
                        icon="pi pi-play"
                        onClick={()=> useStart(true)}
                    />
                </div>
            }
            { start &&
                <div style={{ marginLeft: '46%', display: 'flex', flexDirection: 'row' }}>
                    <Button className="button"
                        style={{ marginRight: '10px', paddingLeft: '12px' }}
                        icon="pi pi-stop-circle"
                        onClick={()=> useStart(false)}
                    />
                    <Button className="button"
                        style={{ marginLeft: '10px', paddingLeft: '12px' }}
                        icon="pi pi-forward"
                        onClick={()=> useNext()}
                    />
                </div>
            }
        </div>
    );
}
function ButtonsMobail({ useClickButton, start, useStart, useNext }) {
    const activate = useHookstate(globalState.user.activate);
    const styleActiv = {
        color: '#4dcdf5',
        backgroundColor: '#2b253a7a'
    }


    return(
        <div className='PanelButtonsMobail'>
            <div className='ButtonsMobailLeft'>
                <Button className="button"
                    style={globalState?.user?.timeSuperFind?.get() ? {...styleActiv, marginRight: '10px'} :{marginRight: '10px'}}
                    disabled={globalState?.user?.timeSuperFind?.get()}
                    icon={
                        <FaSearchengin />
                    }
                    onClick={()=> useClickButton('search')}
                />
                <Button className="button"
                    style={activate?.mf?.get() ? styleActiv : {}}
                    disabled={activate?.mf?.get()}
                    icon={
                        <IoMaleFemale />
                    }
                    onClick={()=> useClickButton('mf')}
                />
            </div>
            { !start &&
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Button className="button" id="start"
                        icon="pi pi-play"
                        onClick={()=> useStart(true)}
                    />
                </div>
            }
            { start &&
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Button className="button"
                        style={{ marginRight: '10px', paddingLeft: '12px' }}
                        icon="pi pi-stop-circle"
                        onClick={()=> useStart(false)}
                    />
                    <Button className="button"
                        style={{ marginLeft: '10px', paddingLeft: '12px' }}
                        icon="pi pi-forward"
                        onClick={()=> useNext()}
                    />
                </div>
            }
            <div className='ButtonsMobailRight'>
                <Button className="button"
                    style={activate?.m?.get() ? {...styleActiv, marginRight: '10px'} : {marginRight: '10px'}}
                    disabled={activate?.m?.get()}
                    icon={
                        <IoMdMale />
                    }
                    onClick={()=> useClickButton('m')}
                />
                <Button className="button"
                    style={activate?.f?.get() ? styleActiv : {}}
                    disabled={activate?.f?.get()}
                    icon={
                        <IoMdFemale />
                    }
                    onClick={()=> useClickButton('f')}
                />
            </div>
        </div>
    );
}



export default function({start, useStart, useNext}) {
    const [modal, setModal] = React.useState();
    const resize = useWindowSize();

    const useConfirm =(header, message, accept, reject)=> {
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