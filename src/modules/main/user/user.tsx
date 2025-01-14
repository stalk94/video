import React from 'react';
import { EVENT, send } from '../../../lib/engine';
import globalState, { actions } from "../../../global.state";
import { googleOut } from "../../../function";
import { useHookstate } from '@hookstate/core';
import { Menu } from 'primereact/menu';
import "./style.css";


export default function() { 
    const state = useHookstate(globalState);


    return(
        <div className='UserMain'>
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
                            console.log('XRO')
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