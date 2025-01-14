import React from 'react';
import { EVENT, send } from '../../../lib/engine';
import globalState, { actions } from "../../../global.state";
import { googleOut } from "../../../function";
import { useHookstate } from '@hookstate/core';
import { Menu } from 'primereact/menu';
import Modal from "../../../component/modal";
import Settings from "./settings";
import "./style.css";
import { useDidMount } from 'rooks';


export default function() {
    const [modal, setModal] = React.useState();
    const state = useHookstate(globalState);

    const useConfirm = (header, message, accept, reject) => {
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
    


    return(
        <div className='UserMain'>
            { modal }
            <Menu 
                model={[
                    {
                        label: 'Update',
                        icon: 'pi pi-refresh',
                        command: ()=> {
                            console.log('XRO')
                        }
                    },
                    {
                        label: 'Настройки',
                        icon: 'pi pi-wrench',
                        command: ()=> {
                            useConfirm(
                                'Настройки', 
                                <Settings/>, 
                                ()=> EVENT.emit('inputChange', {})
                            );
                        }
                    },
                    {
                        separator:true
                    },
                    {
                        label: <div style={{color:'#f58080'}}>Выход</div>,
                        icon: 'pi pi-power-off',
                        command: ()=> {
                            send('exit', {peerId:globalThis.peerId}, 'POST');
                            googleOut();
                            EVENT.emit('exit', {});
                        }
                    }
                ]} 
            />
        </div>
    );
}