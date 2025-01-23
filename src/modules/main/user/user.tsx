import React from 'react';
import { EVENT, send } from '../../../lib/engine';
import globalState from "../../../global.state";
import { googleOut } from "../../../function";
import { useHookstate } from '@hookstate/core';
import { Menu } from 'primereact/menu';
import Modal from "../../../component/modal";
import Settings from "./settings";
import { Button } from 'primereact/button';
import { useTranslation } from 'react-i18next';
import "./style.css";


const UserCard =()=> {
    const user = useHookstate(globalState.user);

    const useSize =()=> {
        if(window.innerWidth < 1280) return ['90px', '120px'];
        else return ['55px', '75px']
    }
    const useAvatar =()=> {
        const userState = user.get({ noproxy: true });

        if(userState.avatar) return gurl + userState.avatar;
        else if(userState?.googleData?.img) return userState.googleData.img;
        else return gurl + '/img/non-avatar.jpg';
    }
    const useChekLogin =(userData)=> {
        if(userData.googleData) {
            return `${userData.googleData.name} ${userData.googleData.familyName}`;
        }
        else return userData.login;
    }


    return(
        <div className='UserCartWraper'>
            <div style={{display:'flex', flexDirection: 'row'}}>
                <img style={{borderRadius: '5px', border:'1px solid gray'}}
                    src={useAvatar()}
                    onError={(e)=> e.target.src = gurl + '/img/non-avatar.jpg'}
                    width={useSize()[0]}
                    height={useSize()[1]}
                />
                <div className='UserCartInfo'>
                    <div className='UserCartLogin'>
                        { useChekLogin(user.get()) }
                    </div>
                    <div className='UserCartLike'>
                        ❤️: &ensp;{ user.get().likes }
                    </div>
                    <div className='UserCartLike'>
                        🎉: &ensp;{ user.get().superLikes }
                    </div>
                </div>
            </div>
            <Button className='PremiumInfoButton'
                style={{marginTop:'15px', background:'gray'}}
                label={user.get().status}
            />
        </div>
    );
}


export default function({ setModal }) {
    const { t, i18n } = useTranslation();

    const useConfirm = (header, message, accept, reject) => {
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

    return(
        <div className='UserMain'>
            <div style={{paddingLeft: '1rem'}}>
                <UserCard />
            </div>
            <Menu 
                model={[
                    {
                        label: t('menu_profile'),
                        icon: 'pi pi-user',
                        command: ()=> {
                            useConfirm(
                                t('menu_profile'), 
                                <div>В разработке</div>, 
                                ()=> EVENT.emit('inputChange', {})
                            );
                        }
                    },
                    {
                        label: t('menu_pay'),
                        icon: 'pi pi-wallet',
                        command: ()=> {
                            useConfirm(
                                t('menu_pay'), 
                                <div>В разработке</div>, 
                                ()=> EVENT.emit('inputChange', {})
                            );
                        }
                    },
                    {
                        label: t('menu_settings'),
                        icon: 'pi pi-cog',
                        command: ()=> {
                            useConfirm(
                                t('menu_settings'), 
                                <Settings/>, 
                                ()=> EVENT.emit('inputChange', {})
                            );
                        }
                    },
                    {
                        label: t('menu_info'),
                        icon: 'pi pi-info-circle',
                        command: ()=> {
                            useConfirm(
                                t('menu_info'), 
                                <div>В разработке</div>, 
                                ()=> EVENT.emit('inputChange', {})
                            );
                        }
                    },
                    {
                        separator:true
                    },
                    {
                        label: <div style={{}}>
                            { t('menu_exit') }
                        </div>,
                        icon: 'pi pi-power-off',
                        command: ()=> {
                            send('exit', {peerId:globalThis.peerId}, 'POST');
                            googleOut();
                            EVENT.emit('exit', {});
                        }
                    }
                ]} 
            />
        </div>
    );
}

