All server / client socket messages excluding authentication / connection.
## Server -> Client
---
`modifyFilm (id: string, data: FilmInfo)`

Called when the metadata of a film has changed and it needs to sync.

`id` The ID of the film

`data` The new metadata.

---

`setFilmOrder (order: string[])`

Called when the film order is updated.

`order` The new film order.

## Client -> Server
---
`getFilms (): Record<string, FilmInfo>`

Request a copy of all the film metas in the playbill.

returns: A record of all the films.

---

`getOrder (): string[]`

Request a copy of the current film order.

returns: The current film order.

---

`setHead(index: number)`

Inform the server of the current playback index.

`index` The current playback index.
