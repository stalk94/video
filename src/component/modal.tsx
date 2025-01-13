import React from 'react';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Button } from 'primereact/button';

type PropsModal = {
    message: string
    header: string | React.ReactHTMLElement
    accept: Function
    reject: Function
    visible: boolean
    setVisible: (value: boolean)=> void
}


export default function({visible, setVisible, message, header, accept, reject}: PropsModal) {
    return(
        <React.Fragment>
            <ConfirmDialog style={{maxWidth:'50%'}}
                visible={visible} 
                onHide={()=> setVisible(false)} 
                message={message}
                header={header} 
                accept={accept} 
                reject={reject} 
            />
        </React.Fragment>
    );
}