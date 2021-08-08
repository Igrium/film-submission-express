import React, { Component, PropsWithChildren, useEffect, useState } from 'react'
import { createContext } from 'react'
import api from './logic/api';
import { SimpleUser } from 'fse-shared/dist/users'

export const FSEContext = createContext<Partial<SimpleUser> | null>({});
export default function Context(props: PropsWithChildren<any>) {
    const [user, setUser] = useState<SimpleUser | null>();
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
