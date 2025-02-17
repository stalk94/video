import React from 'react';
import { useNavigate } from "react-router-dom";
import { EVENT } from '../../../lib/engine';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { useTranslation } from 'react-i18next';


export default function() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [value, setValue] = React.useState();

    const useReject =()=> {
        EVENT.emit('hidenModal', undefined);
    }
    const useSend =()=> {
        if(value?.length >= 10 && value?.length < 300) {
            socket.emit('send.support', {
                peerId: globalThis.peerId,
                text: value
            });
            setValue('');
        }
        else EVENT.emit('error', {text: 'Слишком короткий либо слишком длинный текст'});
    }


    return(
        <div style={{display:'flex', flexDirection:'column'}}>
            <div className='agreement-link'
                onClick={()=> navigate('/agreement')}
            >
                📄{ " "+ t('label_agreement') }
            </div>
            <InputTextarea 
                placeholder='min 12 max 300 simbol'
                rows={5} 
                cols={window.innerWidth > 1280 ? 50 : 30} 
                value={value} 
                onChange={(e)=> setValue(e.target.value)} 
            />
            <div style={{display:'flex', flexDirection:'row', marginTop:'1rem'}}>
                <Button
                    className='p-button-outlined p-button-success'
                    label={t('label_btn_send')}
                    onClick={useSend}
                />
                <Button style={{marginLeft:'1rem'}}
                    className="p-button-outlined p-button-secondary"
                    label={t('modal_reject')}
                    onClick={useReject}
                />
            </div>
        </div>
    );
}