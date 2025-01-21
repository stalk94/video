import React from 'react';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Button } from 'primereact/button';
import { useTranslation } from 'react-i18next';

type PropsModal = {
    message: string
    header: string | React.ReactHTMLElement
    accept: Function
    reject: Function
    visible: boolean
    setVisible: (value: boolean)=> void
}


export default function({visible, setVisible, message, header, accept, reject}: PropsModal) {
    const { t, i18n } = useTranslation();

    return(
        <React.Fragment>
            <ConfirmDialog style={{
                maxWidth: window.innerHeight < 1280 ? '50%' : '80%', 
                fontSize: '1.4vh'
            }}
                visible={visible} 
                onHide={()=> setVisible(false)} 
                message={message}
                header={header} 
                accept={accept} 
                reject={reject}
                acceptLabel={ t('modal_acept') }
                rejectClassName="rejectButtonModal"
                acceptClassName="aceptButtonModal p-button-outlined p-button-success"
                acceptIcon="pi pi-check"
            />
        </React.Fragment>
    );
}