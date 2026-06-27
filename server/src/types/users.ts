

export interface Subscribers {
    username: string,
    endpoint: string
    expirationTime: number
    keys: string
}

export interface Notifications {
    title: string,
    message: string,
    time: number
}