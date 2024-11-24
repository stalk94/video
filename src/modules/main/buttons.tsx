import React from 'react';
import globalState from "../../global.state";
import { useHookstate } from '@hookstate/core';
import { Button } from 'primereact/button';
import { IoMaleFemale } from "react-icons/io5";
import { IoMdFemale, IoMdMale } from "react-icons/io";
import { FaSearchengin } from "react-icons/fa6";
import Modal from "../../component/modal";
import { useDidMount, useWillUnmount } from 'rooks';


/**
 * Правая панель с иконками
 * 
 */
export default function() {
    const [modal, setModal] = React.useState();
    const activate = useHookstate(globalState.user.activate);

    const useConfirm =(header, message, accept, reject)=> {
        setModal(
            <Modal
                visible={true}
                setVisible={()=> setModal()}
                message={message}
                header={header}
                accept={accept}
                reject={reject}
            />
        );
    }
    const useClickButton =(type: 'search'|'m'|'f'|'mf')=> {

    }
    

    return(
        <div className='RightPanelButtons'>
            { modal }
            <Button className="button"
                disabled={activate?.m?.get()}
                icon={
                    <IoMdMale />
                }
                onClick={()=> useClickButton('m')}
            />
            <Button className="button"
                disabled={activate?.f?.get()}
                icon={
                    <IoMdFemale />
                }
                onClick={()=> useClickButton('f')}
            />
            <Button className="button"
                disabled={activate?.mf?.get()}
                icon={
                    <IoMaleFemale />
                }
                onClick={()=> useClickButton('mf')}
            />
            <Button className="button"
                disabled={activate?.search?.get()}
                icon={
                    <FaSearchengin />
                }
                onClick={()=> useClickButton('search')}
            />
        </div>
    );
}