import React from 'react';
import globalState, { actions } from "../../../global.state";
import { useHookstate } from '@hookstate/core';
import { ScrollPanel } from 'primereact/scrollpanel';
import "./style.css";


export default function() { 
    const state = useHookstate(actions);

    const useTimeFormat =(timeshtamp: number)=> {
        const time = new Date(timeshtamp);
        const dmy = `${time.getDay()}.${time.getMonth()}.${time.getFullYear()} `;
        const hm = `${time.getHours()}:${time.getMinutes()}`;

        return(
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <var>
                    { dmy }
                </var>
                <var style={{color:'gray', marginLeft:'5px'}}>
                    ({ hm })
                </var>
            </div>
        );
    }
    const useColor =(elem)=> {
        if(elem.author === 'SYSTEM') return 'white';
        else return '#ffcccc';
    }


    return(
        <ScrollPanel style={{width: '100%', height: '60%'}}>
            { state.get({noproxy:true}).map((elem, index)=> 
                <div className='ActionRow' key={index}>
                    <div className='ActionTitle'>
                        <var className='ActionTime'>
                            { useTimeFormat(elem.timeshtamp) }
                        </var>
                        <div className='ActionHeader'>
                            { elem.header }
                        </div>
                    </div>
                    <ScrollPanel className='ActionText' 
                        style={{height:'10vh', color: useColor(elem)}}
                    >
                        { elem.text }
                    </ScrollPanel>
                </div>
            )}
        </ScrollPanel>
    );
}