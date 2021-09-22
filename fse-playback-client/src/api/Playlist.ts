/**
 * Represents a playlist of media that the media player can play.
 * Each entry in the playlist is denoted by a a string, and each
 * entry contains a specified index.
 * 
 * A playlist will keep track of the index at which the currently playing
 * media resides. Entries after this index are mutable (if the playlist itself
 * is mutable), while entries before it are not.
 */
export default abstract class Playlist {

    /**
     * All the entries in this playlist, in order.
     * 
     * Changes to this list are not expected to be reflected
     * in the playlist, but implementations should be prepared
     * for it to be updated.
     */
    public abstract get list(): string[];
    
    /**
     * Set the entries in this playlist.
     * 
     * *Note: Depending on the implementation, 
     * the playlist might not be updated untill the promise returns.*
     * @param list The new list.
     * @returns A promise that fulfils when the playlist has been updated.
     * and rejects if there's an error.
     */
    public abstract setList(list: string[]): Promise<void>;

    /**
     * The index at which the currently playing media resides.
     */
    public abstract get head(): number;

    /**
     * The index at which the currently playing media resides.
     */
    public abstract set head(head: number);

    /**
     * Obtain the media entry at a given index and move the head to that index.
     * @param index The index to target.
     * @returns The name of the entry.
     */
    public play(index: number): string {
        // Put this up top so the error is thrown before the head is moved.
        let entry = this.list[index];
        this.head = index;
        return entry;
    }

    /**
     * Move the head to the next entry and get its name.
     * @returns The name of the entry.
     */
    public next(): string {
        return this.play(this.head + 1);
    }

    /**
     * Get whether there are any more entries in this playlist.
     */
    public hasNext(): boolean {
        return (this.head < this.list.length);
    }

    /**
     * Get a record matching media entries to pretty titles for display in the UI.
     * 
     * **Not guarenteed to contain every playlist entry!**
     */
    public getTitles(): Record<string, string> {
        return {};
    }

    public getLite(): LitePlaylist {
        return {
            list: this.list,
            head: this.head,
            titles: this.getTitles()
        }
    }
}

/**
 * A simple, non-mutable representation of a playlist.
 */
export interface LitePlaylist {
    list: string[],
    head: number,
    titles: Record<string, string>
}