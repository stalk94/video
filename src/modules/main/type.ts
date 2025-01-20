export type PropsClick = {
    useClickUser: (e: React.MouseEvent<HTMLElement, MouseEvent>)=> void 
}
export type PropsButtonsPanel = {
    start: boolean
    useStart: (type: boolean)=> void
    useNext: ()=> void
}
export type PropsButtonsPanelMobail = {
    start: boolean
    useStart: (type: boolean)=> void
    useNext: ()=> void
    useClickButton: (type: 'search'|'m'|'f'|'mf')=> void
}

export type SetLikeEvent = {
    likes: number
    type: 'heart'|'fire'|'lips'|'rose'
}

export type GiftData = {
    id: number
    name: string
    cost: number
    src: string
    anim?: 'fall.petal'|'rocket'|'fall.rose'
    text?: string
}

export type EventAnimation = {
    type: 'fall' | 'kiss' | 'fier' | 'imgFier' | 'exp' | 'expRainbow' | 'rocket'
    image?: 'heart' | 'rose' | 'star' | 'lips' | 'petal'
    count?: number
    x?: number
    y?: number
}

export type Message = {
    login: string
    text: string
}

