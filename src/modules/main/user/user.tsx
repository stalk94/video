import React from 'react';
import { EVENT, send } from '../../../lib/engine';
import globalState, { actions } from "../../../global.state";
import { googleOut } from "../../../function";
import { useHookstate } from '@hookstate/core';
import { Menu } from 'primereact/menu';
import Modal from "../../../component/modal";
import Settings from "./settings";
import { useTranslation } from 'react-i18next';
import "./style.css";



export default function() {
    const [modal, setModal] = React.useState();
    const { t, i18n } = useTranslation();
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
                        label: t('menu_settings'),
                        icon: 'pi pi-wrench',
                        command: ()=> {
                            useConfirm(
                                t('menu_settings'), 
                                <Settings/>, 
                                ()=> EVENT.emit('inputChange', {})
                            );
                        }
                    },
                    {
                        separator:true
                    },
                    {
                        label: <div style={{color:'#f58080'}}>
                            { t('menu_exit') }
                        </div>,
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