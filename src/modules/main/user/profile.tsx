import { GiftData } from "../../../global.d.ts";
import axios from 'axios';
import React from 'react';
import globalState from "../../../global.state";
import { useHookstate } from '@hookstate/core';
import { SelectButton } from 'primereact/selectbutton';
import { Button } from 'primereact/button';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { OverlayPanel } from 'primereact/overlaypanel';
import Modal from "../../../component/modal";
import { useTranslation } from 'react-i18next';
import { TbCoins } from "react-icons/tb";
import { LuPartyPopper } from "react-icons/lu";
import { FaRegHeart } from "react-icons/fa";
import { TbGift } from "react-icons/tb";


const Header =()=> {
    const [upload, setUpload] = React.useState(false);
    const user = useHookstate(globalState.user);
    const choseOptions = {
        label: 'PHOTO', 
        icon: 'pi pi-fw pi-camera',
        className: 'SelectFoto'
    }

    const useChekLogin =(userData)=> {
        if(userData.googleData) {
            return `${userData.googleData.name} ${userData.googleData.familyName}`;
        }
        else return userData.login;
    }
    const useSize =()=> {
        if(window.innerWidth < 1280) return ['120px', '120px'];
        else return ['180px', '130px']
    }
    const useAvatar =()=> {
        const userState = user.get({ noproxy: true });

        if(userState.avatar) return gurl + userState.avatar;
        else if(userState?.googleData?.img) return userState.googleData.img;
        else return gurl + '/img/non-avatar.jpg';
    }
    const handleSubmit =(e: FileUploadHandlerEvent)=> {
        setUpload(true);
        const url = gurl + 'uploadAvatar';
        const formData = new FormData();
        formData.append('avatar', e.files[0]);
        formData.append('fileName', user.login.get({noproxy: true}));
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            }
        };
        
        axios.post(url, formData, config).then((response)=> {
            console.log(response.data);
            e.options.clear();
            setUpload(false);
        });
    }

    return(
        <div className='HeaderProfile'>
            <div className='UserCartWraper'>
                <div style={{display:'flex', flexDirection: 'row', marginBottom:'5px'}}>
                    <div style={{position:'relative',height:useSize()[1]}}>
                        { upload &&
                            <div className='UploaderAvatar'>
                                <i className="pi pi-spin pi-spinner" id='Spiner'/>
                            </div>
                        }
                        <FileUpload
                            auto
                            name="avatar"
                            url="./uploadAvatar"
                            accept=".png, .jpg, .jpeg"
                            mode="basic"
                            customUpload
                            uploadHandler={handleSubmit}
                            chooseOptions={choseOptions}
                        />
                        <img style={{borderRadius: '5px', border:'1px solid gray'}}
                            src={useAvatar()}
                            onError={(e)=> e.target.src = gurl + '/img/non-avatar.jpg'}
                            width={useSize()[0]}
                            height={useSize()[1]}
                        />
                        
                    </div>
                    <div className='UserCartInfo'>
                        <div className='UserProfileLogin'>
                            { useChekLogin(user.get()) }
                        </div>
                        <div className='UserProfileRow'>
                            <FaRegHeart className="ProfileIcon" />
                            <div>
                                { user.get().likes }
                            </div>
                        </div>
                        <div className='UserProfileRow'>
                            <LuPartyPopper className="ProfileIcon" />
                            <div>
                                { user.get().superLikes }
                            </div>
                        </div>
                        <div className='UserProfileRow'>
                            <TbGift className="ProfileIcon" />
                            <div>
                                { user.get().gifts?.length ?? 0 }
                            </div>
                        </div>
                    </div>
                </div>
                <Button className='PremiumInfoButton'
                    style={{background:'#00000000'}}
                    label={user.get().status}
                />
            </div>
        </div>
    );
}
const Body = {
    Base: ()=> {
        const user = useHookstate(globalState.user);
    
        return(
            <div>
               
            </div>
        );
    },
    Gifts: ({ setModal })=> {
        const { t, i18n } = useTranslation();
        const op = React.useRef<OverlayPanel | null>(null);
        const [curent, setCurent] = React.useState<GiftData>();
        const user = useHookstate(globalState.user);
        const test = [{
            id: 0,
            name: "Тестовый подарок",
            cost: 10,
            src: "img/rose.png",
            anim: 'rocket',
            from: 'White Black',
            text: "1.Вы пока не получили подарков от других пользователей."
        },{
            id: 1,
            name: "Тестовый подарок2",
            cost: 10,
            src: "img/bokals.png",
            anim: 'rocket',
            from: 'White Black',
            text: "2.Вы пока не получили подарков от других пользователей."
        },{
            id: 0,
            name: "Тестовый подарок",
            cost: 10,
            src: "img/rose.png",
            anim: 'rocket',
            from: 'White Black',
            text: "1.Вы пока не получили подарков от других пользователей."
        },{
            id: 1,
            name: "Тестовый подарок2",
            cost: 10,
            src: "img/bokals.png",
            anim: 'rocket',
            from: 'White Black',
            text: "2.Вы пока не получили подарков от других пользователей."
        }];
        
        const useConfirm = (header, message, accept, reject, footer) => {
            setModal(
                <Modal
                    visible={true}
                    setVisible={()=> setModal()}
                    message={message}
                    header={header}
                    accept={accept}
                    reject={reject}
                    footer={footer}
                />
            );
        }
        const useClick =(e: React.MouseEvent<HTMLDivElement, MouseEvent>, data: GiftData)=> {
            setCurent(data);
            op.current.toggle(e);
        }
        const chekText =(text: string)=> {
            if(text.length > 9) return(
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
        const useSell =(data: GiftData)=> {
            socket.emit('gift.sell', {
                peerId: globalThis.peerId,
                data: data
            });
        }
    
        return(
            <div className='GiftWraper' 
                    style={{
                        justifyContent:window.innerWidth<1280?"left":"center",
                        maxWidth:window.innerWidth>1280 &&'30vw'
                    }}
                >
                <OverlayPanel ref={op} style={{maxWidth:'50vw'}}>
                    <div className="GiftInfoContainer">
                        <div className='GiftLabel' 
                            style={{display:'flex',flexDirection:'row',justifyContent:"flex-end"}}
                        >
                            <i className="pi pi-user" style={{'fontSize':'1em', marginRight:'1%'}}>
                                { curent?.from }
                            </i>
                        </div>
                        <div style={{'fontSize':'1em', marginTop:'1.5rem'}}>
                            { curent?.text}
                        </div>
                    </div>
                </OverlayPanel>
                { ( !import.meta.env.DEV ? user.gifts.get() : test)?.map((data, index)=>
                    <div key={index} className='GiftContainer'>
                        <div className='GiftImageContainer' 
                            style={{flexDirection:'column', cursor:'pointer'}}
                            onClick={(e)=> useClick(e, data)}
                        >
                            <div className='GiftLabel' style={{display:'flex',flexDirection:'row'}}>
                                <i className="pi pi-user" style={{'fontSize':'1em',color:'gray'}}/>
                                { chekText(data.from) }
                            </div>
                            <img className='GiftImage'
                                src={gurl + data.src}
                            />
                        </div>
                        <Button className='p-button-outlined p-button-danger GiftButtonPay'
                            style={{marginTop: '20px'}}
                            label={data.cost / 2}
                            icon={<TbCoins />}
                            onClick={()=> useSell(data)}
                        />
                    </div>
                )}
                { (!user.gifts.get() || !user.gifts.get()[0]) && 
                    <div style={{marginLeft:'auto', marginRight:'auto', color:'gray'}}>
                        { t('profile_gift_empty') }
                    </div>
                }
            </div>
        );
    },
    Settings: ()=> {
        const user = useHookstate(globalState.user);
    
        return(
            <>
    
            </>
        );
    }
}


export default function() {
    const [modal, setModal] = React.useState();
    const [select, setSelect] = React.useState<'base'|'gifts'|'setings'>('gifts');


    return(
        <div style={{display:'flex', flexDirection:'column'}}>
            { modal }
            <Header />
            <SelectButton id="ProfileSelect"
                value={select}
                options={[
                    { label: 'Базовое', value: 'base' },
                    { label: 'Подарки', value: 'gifts' },
                    { label: 'Настройки', value: 'setings' }
                ]}
                onChange={(e)=> setSelect(e.value)}
            />
            <div className='ProfileBody'>
                { select === 'base' && <Body.Base /> }
                { select === 'gifts' && <Body.Gifts setModal={setModal} /> }
                { select === 'setings' && <Body.Settings /> }
            </div>
        </div>
    );
}