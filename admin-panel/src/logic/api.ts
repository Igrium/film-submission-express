import axios from 'axios';
import { FilmInfo } from 'fse-shared/src/meta';

/**
 * Handles interfacing with the FSE central API.
 */
export module api {
    export const client = axios.create({ timeout: 5000 })

    export async function getFilms() {
        const response = await client.get('/api/films')
        if (response.status != 200) {
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
}