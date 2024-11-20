import React from 'react';
import globalState from "../../global.state";
import { Button } from 'primereact/button';


/**
 * Правая панель с иконками
 * 
 */
export default function() {
    return(
        <div className='RightPanelButtons'>
            <Button className="button" id="start"
                icon="pi pi-play"
                
            />
            <Button className="button" id="start"
                icon="pi pi-play"
                
            />
            <Button className="button" id="start"
                icon="pi pi-play"
                
            />
            <Button className="button" id="start"
                icon="pi pi-play"
                
            />
        </div>
    );
}