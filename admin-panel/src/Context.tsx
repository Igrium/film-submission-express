import React, { Component, PropsWithChildren, useEffect, useState } from 'react'
import { createContext } from 'react'
import api from './logic/api';

export const FSEContext = createContext<Partial<api.User | null>>({});
export default function Context(props: PropsWithChildren<any>) {
    const [user, setUser] = useState<api.User | null>();
    useEffect(() => {
        api.getUser().then((data) => {
            setUser(data);
        }).catch(err => {
            console.error(err);
        })
    }, [])

    return (
        <FSEContext.Provider value={user!}>{props.children}</FSEContext.Provider>
    )
}
