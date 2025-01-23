import "../../global.d.ts";
import React from 'react';
import globalState from "../../global.state";
import { useHookstate } from '@hookstate/core';
import { Button } from 'primereact/button';
import giftsConfig from "../../../config/prices.json";
import { TbCoins } from "react-icons/tb";
import { GiftData } from "./type";
import "../../css/gift.css";



export const Likes =({ useClickLike })=> {
    return(
        <div className='LikesContainer'>
            <Button className="buttonLike"
                label={ '❤️' }
                onClick={(e)=> useClickLike(e, 'heart')}
            />
            <Button className="buttonLike"
                label={ '💋' }
                onClick={(e)=> useClickLike(e, 'lips')}
            />
            <Button className="buttonLike"
                label={ '🔥' }
                onClick={(e)=> useClickLike(e, 'fire')}
            />
            <Button className="buttonLike specialLike"
                label={ '🎉' }
                onClick={(e)=> useClickLike(e, 'rose')}
            />
        </div>
    );
}
const Gift =({ data, useClick }: { data:GiftData, useClick:(data:GiftData)=> void})=> {
    const chekText =(text: string)=> {
        if(text.length > 11) return(
            <div className='GiftLabel marquee-container'>
                <div className="marquee-text">
                    { text }
                </div>
            </div>
        );
        else return(
            <div className='GiftLabel'>
                { text }
            </div>
        );
    }

    return(
        <div key={data.id} className='GiftContainer'>
            <div className='GiftImageContainer'>
                <div className='GiftPrice'>
                    { data.cost } 
                    <TbCoins />
                </div>
                <img className='GiftImage'
                    src={gurl+data.src}
                />
            </div>
            { chekText(data.name??data.label) }
            <Button className='p-button-outlined p-button-success GiftButtonPay'
                label='Подарить'
                onClick={()=> useClick(data)}
            />
        </div>
    );
}


export default function({ input }: {input: boolean}) { 
    const ovnerState = useHookstate(globalState.ovner);
   
    const usePayGift =(data: GiftData)=> {
        if(import.meta.env.DEV) socket.emit('gift', {
            peerId: globalThis.peerId,
            peerIdOvner: globalThis.peerId,
            data: data
        });
        else if(ovnerState?.peerId?.get() !== undefined && globalState.user.get().money > 0) {
            socket.emit('gift', {
                peerId: globalThis.peerId,
                peerIdOvner: ovnerState.peerId.get(),
                data: data
            });
        }
    }

    return(
        <div className='GiftWraper'>
            {giftsConfig.map((elem, index)=>
                <Gift key={index}
                    data={elem} 
                    useClick={usePayGift} 
                />
            )}
        </div>
    );
}
