import React from 'react';
import globalState from "../../global.state";
import { useHookstate } from '@hookstate/core';
import { Button } from 'primereact/button';
import { IoMaleFemale } from "react-icons/io5";
import { IoMdFemale, IoMdMale } from "react-icons/io";
import { FaSearchengin } from "react-icons/fa6";


/**
 * Правая панель с иконками
 * 
 */
export default function() {


    return(
        <div className='RightPanelButtons'>
            <Button className="button"
                icon={
                    <IoMdMale />
                }
                
            />
            <Button className="button"
                icon={
                    <IoMdFemale />
                }
                
            />
            <Button className="button"
                icon={
                    <IoMaleFemale />
                }
                
            />
            <Button className="button"
                icon={
                    <FaSearchengin />
                }
                
            />
        </div>
    );
}