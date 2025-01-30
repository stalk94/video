import React from 'react';
import { actions } from "../../../global.state";
import { useHookstate } from '@hookstate/core';
import "./action-style.css";


export default function() { 
    const state = useHookstate(actions);

    return(
        <div className='NewsContainer'>
            <div style={{margin:'auto', color:'silver',fontSize:'18px'}}>
                В разработке
            </div>
        </div>
    );
}