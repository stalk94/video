import { hookstate } from '@hookstate/core';



export default hookstate({
    user: {
        sex: 'm',
        onStart: false,
        permision: 0,
        money: 0,
        likes: 0,
        timeSuperFind: undefined,
        status: 'free',
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
    ovner: {
        
    }
});