import React, { Component, PropsWithChildren, useEffect, useState } from 'react'
import { createContext } from 'react'
import api from './logic/api';
import { SimpleUser } from 'fse-shared/dist/users'

export interface IContext {
    user: Partial<SimpleUser> | null,
    connected: boolean
}
export const FSEContext = createContext<IContext>({
    user: null,
    connected: false
});
export default function Context(props: PropsWithChildren<any>) {
    const [user, setUser] = useState<SimpleUser | null>();
    const [connected, setConnected] = useState<boolean>();
    useEffect(() => {
        api.getUser().then((data) => {
            setUser(data);
            setConnected(true);
        }).catch(err => {
            console.error(err);
            setConnected(false);
        })
    }, [])

    return (
        <FSEContext.Provider value={{
            user: user ? user : null,
            connected: connected ? connected : false
        }}>{props.children}</FSEContext.Provider>
    )
}
