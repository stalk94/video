import { Purchase } from "../../global.d.ts";

export type UniqueUsers = {
    date: string
    uniqueUsers: number
    city: "(not set)" | "(none)" | string
    country: "(not set)" | "(none)" | string
    refer: "(not set)" | "(none)" | string
    device: 'desktop' | 'mobile' | 'tablet' | string
    deviceModel: "(not set)" | "(none)" | string
}
type events = 'Выход' | 'Авторизация' | 'Регистрация' | 'Переход к оплате' | 'Супер поиск'|
    'Платеж успешен' | 'Платеж отмена' | 'Сообшение' | 'Супер лайк' | 'Куплен подарок'
;


export interface UsersBaseStatistic {
    startDate?: number
    newUsers: number
    activeUsers: number
    detail: UniqueUsers[]
}
export interface EventsStatistic {
    startDate?: number
    details: Array<
        {
            time: string
            date: string
            name: events
            count: number
        }
    >
}
export interface TraffikStatic {
    startDate?: number
    date: string
    city: string
    country: string
    source: "(not set)" | "(direct)" | "Google" | "Facebook" | "Instagram" | string
    type: "(not set)" | "(none)" | "organic" | "referral" | "cpc" | "social"
    referer: string
    sessions: number
    duration: number
    activeUsers?: number
    newUsers?: number
}


export interface PayOrPurchaseStatistic {
    startDate: number
    details: {
        purchase: Purchase[]
        events: Array<{
            time: string
            date: string
            name: events
            count: number
        }>
    }
}