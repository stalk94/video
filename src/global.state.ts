import { UserDataState, BotDataState } from "./global.d.ts";
import { hookstate } from '@hookstate/core';



const globalState = hookstate({
    user: <UserDataState> {
        login: '',
        timeshtampRegistration: 0,   
        timeshtamp: 0,
        timeSuperFind: undefined,                      // если активирован супер поиск
        timeNewUser: 0,                     // время до окончания режима "Новичек"
        onStart: false,                        // нажата кнопка поиска
        permision: 0,                       // 0 - 2
        money: 0,
        status: 'free',
        peerId: '',                          
        likes: 0,                           // лайкм от юзеров
        superLikes: 0,                      // спец
        galery: [],                              // файлы пользователя
        story: {  },        // история просмотра
        gifts: [],
        sex: 'm',
        activate: {
            m: false,
            f: false,
            mf: false,
            search: false
        },
        info: {
            country: 'RU'
        }
    },
    ovner: <UserDataState | BotDataState> {
        
    }
});


export default globalState;
export const actions = hookstate([]);