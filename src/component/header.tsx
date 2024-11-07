import React from 'react';
import globalState from "../global.state";
import { useHookstate } from '@hookstate/core';
import { Button } from 'primereact/button';
import "../css/header.css";
import { useIntervalWhen } from 'rooks';

const Test =({val, setVal, useCall})=> (
    <React.Fragment>
        <input
            value={val}
            onChange={(e)=> setVal(e.target.value)}
        />
        <button onClick={()=> useCall(val)}>Call</button>
    </React.Fragment>
);


//* сделать расчет времени
export default function({useCall}) { 
    const userState = useHookstate(globalState.user);
    const [val, setVal] = React.useState();

    const useTime =(time: number)=> {
        let hours = 0;
        let min = 0;
        let sec = 0;

        const s = time / 1000;
        min = Math.floor(s / 60);
        sec = s % 60;

        if(min > 59) {
            const fl = min / 60;
            hours = Math.floor(fl);
            min = Math.floor(min % 60);
        }

        if((hours + '').length === 1) hours = `0${hours}`;
        if((min + '').length === 1) min = `0${min}`;
        if((sec + '').length === 1) sec = `0${sec}`;

        if(hours === '00') return(min + ':' + sec);
        else return(hours + ':' + min + ':' + sec);
    }
    useIntervalWhen(()=> {

    }, 1000, globalThis.peerCall ? true : false);

    
    return(
        <React.Fragment>
            <div className='AvatarContainer'>
                <img className='Avatar'
                    height={window.innerHeight * 0.05}
                    src={userState.avatar.get()}
                    onError={(e)=> e.target.src = 'img/non-avatar.jpg'}
                />
            </div>
            <div className='TimeContainer'>
                <div className='Time'>
                    Время: 
                </div>
                <div className='Time' style={{color: 'red'}}>
                    { userState.time.get() 
                        ? useTime(userState.time.get()) 
                        : useTime(userState.bonusTime.get()) ?? `00:00`
                    }
                </div>
            </div>
        </React.Fragment>
    );
}