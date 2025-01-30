import { GiftData } from "../../../global.d.ts";
import axios from 'axios';
import React from 'react';
import globalState, { actions } from "../../../global.state";
import { useHookstate } from '@hookstate/core';
import { SelectButton } from 'primereact/selectbutton';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { ScrollPanel } from 'primereact/scrollpanel';
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

    const chekText =(text: string)=> {
        if(text.length > 18) return(
            <div className='marquee-container'>
                <div className="marquee-text">
                    { text }
                </div>
            </div>
        );
        else return(
            <div>
                { text }
            </div>
        );
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
            <div className='UserCartWraper' style={{paddingRight:'3px', paddingTop:'0px'}}>
                <div style={{display:'flex', flexDirection: 'row', marginBottom:'0.6rem'}}>
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
                            accept=".gif .png, .jpg, .jpeg"
                            mode="basic"
                            customUpload
                            uploadHandler={handleSubmit}
                            chooseOptions={choseOptions}
                        />
                        <img style={{borderRadius: '5px', border:'1px solid gray', objectFit: 'cover'}}
                            src={useAvatar()}
                            onError={(e)=> e.target.src = gurl + '/img/non-avatar.jpg'}
                            width={useSize()[0]}
                            height={useSize()[1]}
                        />
                        
                    </div>
                    <div className='UserCartInfo'>
                        <div className='UserProfileLogin'>
                            { chekText(useChekLogin(user.get())) }
                        </div>
                        <div className='UserProfileRow' style={{marginTop:'10px'}}>
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
                    label={user.get().status==='free'?'standart':user.get().status}
                />
            </div>
        </div>
    );
}
const Body = {
    Base: ()=> {
        const state = useHookstate(actions);
    
        const useTimeFormat =(timeshtamp: number)=> {
            const time = new Date(timeshtamp);
            const dmy = `${time.getDay()}.${time.getMonth()}.${time.getFullYear()} `;
            const hm = `${time.getHours()}:${time.getMinutes()}`;
    
            return(
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <var>
                        { dmy }
                    </var>
                    <var style={{color:'gray', marginLeft:'5px'}}>
                        ({ hm })
                    </var>
                </div>
            );
        }
        const useColor =(elem)=> {
            if(elem.author === 'SYSTEM') return 'white';
            else return '#ffcccc';
        }
        const useFiltre =(actions)=> {
            return actions.filter((elem)=> elem.author === 'SYSTEM');
        }

        return(
            <div style={{maxHeight:'25em', overflowY:'auto'}}>
                { useFiltre(state.get({noproxy:true})).map((elem, index)=> 
                    <div className='ActionRow' key={index}>
                        <div className='ActionTitle'>
                            <var className='ActionTime'>
                                { useTimeFormat(elem.timeshtamp) }
                            </var>
                            <div className='ActionHeader'>
                                { elem.header }
                            </div>
                        </div>
                        <ScrollPanel className='ActionText' 
                            style={{height:'10vh', color: useColor(elem)}}
                        >
                            { elem.text }
                        </ScrollPanel>
                    </div>
                )}
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
            <div className='GiftWraper'>
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
                    <div key={index} className='GiftContainer' style={{background:'#00000000'}}>
                        <div className='GiftImageContainer' id='GiftImageProfileContainer'
                            style={{flexDirection:'column', cursor:'pointer'}}
                            onClick={(e)=> useClick(e, data)}
                        >
                            <div className='GiftLabel' style={{display:'flex',flexDirection:'row'}}>
                                <i className="pi pi-user" style={{'fontSize':'1em',color:'gray'}}/>
                                { chekText(data.from) }
                            </div>
                            <img className='GiftImage' id='GiftImageProfile'
                                src={gurl + data.src}
                            />
                        </div>
                        <Button className='p-button-outlined p-button-secondary GiftButtonPay'
                            style={{marginTop: '20px', backgroundColor:'#00000000'}}
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
        const { t, i18n } = useTranslation();
        const settings = useHookstate(globalState.user.settings);

        const Row =({ value, setValue, label, text, disabled })=> {
            return(
                <div style={{opacity:disabled && '0.6', marginBottom:'0.5rem'}} className='IoRow'>
                    <Checkbox style={{marginTop:'auto', marginBottom:'auto', marginRight:'1rem'}}
                        disabled={disabled}
                        checked={value}
                        onChange={(e)=> setValue(e.checked)}
                    />
                    <div style={{display:'flex', flexDirection:'column', marginTop:'auto', marginBottom:'auto'}}>
                        <div className="RowLabel">
                            { label }
                        </div>
                        <div className="RowText">
                            { text }
                        </div>
                    </div>
                </div>
            );
        }
        const useUpdate =(key: string, value: any)=> {
            socket.emit("settings.set", {
                peerId: globalThis.peerId,
                data: {
                    [key]: value
                }
            });
        }
        
        return(
            <React.Fragment>
                <Row
                    value={settings.translate.get()}
                    setValue={(value)=> useUpdate('translate', value)}
                    label={ t('profile_settings_translate') }
                    text={ t('profile_settings_translate_text') }
                    disabled={false}
                />
                <Row
                    value={settings.hideCountry.get()}
                    setValue={(value)=> useUpdate('hideCountry', value)}
                    label={ t('profile_settings_country') }
                    text={ t('profile_settings_country_text') }
                    disabled={false}
                />
            </React.Fragment>
        );
    }
}


export default function() {
    const { t, i18n } = useTranslation();
    const [modal, setModal] = React.useState();
    const [select, setSelect] = React.useState<'base'|'gifts'|'setings'>('gifts');


    return(
        <div className="ProfileContainer">
            { modal }
            <Header />
            <SelectButton id="ProfileSelect"
                value={select}
                options={[
                    { label: t('profile_label_base'), value: 'base' },
                    { label: t('profile_label_gift'), value: 'gifts' },
                    { label: t('profile_label_settings'), value: 'setings' }
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