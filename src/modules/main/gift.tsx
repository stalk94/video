import React from 'react';
import globalState from "../../global.state";
import { useHookstate } from '@hookstate/core';
import { EVENT, send } from '../../lib/engine';
import { Button } from 'primereact/button';
import { ScrollPanel } from 'primereact/scrollpanel';
import { useDidMount, useWillUnmount } from 'rooks';
import "../../css/gift.css";




export default function({ input }: {input: boolean}) { 
    const ovnerState = useHookstate(globalState.ovner);

    return(
        <div className='GiftContainer'>
            
        </div>
    );
}
