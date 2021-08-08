import axios from 'axios';
import { FilmInfo, TranscodeStatus } from 'fse-shared/src/meta';

/**
 * Handles interfacing with the FSE central API.
 */
export module api {
    export const client = axios.create({ timeout: 5000 })

    export interface User {
        username: string,
        admin: boolean,
        email: string
    }

    export async function getFilms() {
        const response = await client.get('/api/films')
        if (response.status !== 200) {
            console.error(response.data);
            throw new Error(`HTTP request returned code ${response.status} (${response.statusText})`);
        }
        return response.data as Record<string, FilmInfo>
    }

    export async function postFilm(id: string, info: Partial<FilmInfo>) {
        const response = await client.post(`/api/films/${id}`, info);
        if (response.status >= 400) {
            console.error(response.data);
            throw new Error(`Post request returned code ${response.status} (${response.statusText})`);
        }
    }

    export async function deleteFilm(id: string) {
        const response = await client.delete(`/api/films/${id}`);
        if (response.status >= 400) {
            throw new Error(`Delete request returned code ${response.status} (${response.statusText})`);
        }
    }

    export async function getProcessingFilms() {
        const response = await client.get('/api/pipeline/processing');
        if (response.status >= 400) {
            throw new Error(`HTTP request returned code ${response.status} (${response.statusText})`);
        }
        return response.data as Record<string, TranscodeStatus>
    }
    
    /**
     * Get the current user.
     * @returns The current user, or `null` if we're not logged in.
     */
    export async function getUser() {
        try {
            return (await client.get('/api/users/me')).data as User;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    export async function modifyUser(username: string, email: string, admin: boolean) {
        await client.post(`/api/users/user/${username}`, { email, admin }, { withCredentials: true })
    }

    /**
     * Attempt to get information about a user by their username.
     * Can only get other users if current user is admin.
     * @param name Username.
     */
    export async function getUserByName(name: string) {
        return (await client.get(`/api/users/user/${name}`)).data as User;
    }

    /**
     * Attempt to authenticate with the server.
     * @param username Username to use.
     * @param password Password to use.
     * @returns Whether authentication was successful.
     */
    export async function login(username: string, password: string) {
        const creds = { username, password };
        try {
            const response = await client.post('/api/users/login', creds, { withCredentials: true } );
            if (response.status >= 400) {
                return false;
            } else {
                return true;
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    export async function logout() {
        return (await client.post('/api/users/logout', { withCredentials: true })).data;
    }
    
}

export default api;