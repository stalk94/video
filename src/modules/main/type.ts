
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