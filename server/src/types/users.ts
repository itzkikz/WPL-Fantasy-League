export interface Users {
    username: string,
    password: string,
    isTempPassword: string,
    info: string,
    gw: number,
    pickmyteam: boolean;
    deadline: string;
    total_budget: number;
    utlisation: number;
    balance: number;
    managers: string;
}

export interface Subscribers {
    username: string,
    endpoint: string
    expirationTime: number
    keys: string
}

export interface Notifications {
    title: string,
    message: string,
    time:number
}