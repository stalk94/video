import React from 'react';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useTranslation } from 'react-i18next';
import { useDidMount, useWillUnmount } from 'rooks';


type PropsModal = {
    message: string
    header: string | React.ReactHTMLElement
    accept: Function
    reject: Function
    visible: boolean
    setVisible: (value: boolean)=> void
    footer?: React.ReactHTMLElement
    id?: string
}


export default function({visible, setVisible, message, header, accept, reject, footer, id}: PropsModal) {
    const { t, i18n } = useTranslation();

    const handleClickOutside =(event)=> {
        const container = document.querySelector('#' + id);
        
        if(container && !container.contains(event.target)) {
            setVisible(false);
            if(reject) reject();
        }
    }
    useDidMount(()=> {
        if(id!==false) document.addEventListener('mousedown', handleClickOutside);
    });
    useWillUnmount(()=> {
        document.removeEventListener('mousedown', handleClickOutside);
    });


    return(
        <React.Fragment>
            <ConfirmDialog id={id} style={{
                maxWidth: window.innerHeight < 1280 ? '90%' : '80%', 
                fontSize: '1.4vh'
            }}
                visible={visible} 
                onHide={()=> {
                    setVisible(false);
                    if(reject) reject();
                }} 
                message={message}
                header={header} 
                accept={accept} 
                reject={reject}
                acceptLabel={ t('modal_acept') }
                rejectClassName="rejectButtonModal"
                acceptClassName={footer ? "rejectButtonModal" : "aceptButtonModal p-button-outlined p-button-success"}
                acceptIcon="pi pi-check"
                footer={footer}
            />
        </React.Fragment>
    );
}