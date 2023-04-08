console.log('playlist-sync | Loaded main.js');

class PlaylistSync {
    static ID = 'playlist-sync';

    static TEMPLATES = {
        TODOLIST: `modules/${this.ID}/templates/playlist-sync.hbs`
    }

    /**
     * A small helper function which leverages developer mode flags to gate debug logs.
     * 
     * @param {boolean} force - forces the log even if the debug flag is not on
     * @param  {...any} args - what to log
     */
    static log(force, ...args) {  
        const shouldLog = force || game.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.ID);

        if (shouldLog) {
        console.log(this.ID, '|', ...args);
        }
    }

    static pushCompendiumEntriesIntoExistingPlaylists(pack) {
        pack.getDocuments().then(playlists => {
            playlists.forEach(packPlaylist => {
                let gamePlaylist = game.playlists.getName(packPlaylist.name);
                if(typeof gamePlaylist === 'undefined') {
                    return;
                }

                let updatedTrackList = [];
                packPlaylist.getEmbeddedCollection("PlaylistSound").forEach(sound => {
                    updatedTrackList.push(sound.clone());
                })

                gamePlaylist.deleteEmbeddedDocuments("PlaylistSound", gamePlaylist.sounds.map(s => s.id)).then(() => {
                    gamePlaylist.createEmbeddedDocuments("PlaylistSound", updatedTrackList).then(() => {
                        ui.notifications.info(`${gamePlaylist.name} updated from compendium.`);
                    });
                });
            });
        });
    }
}

Hooks.on('getCompendiumDirectoryEntryContext', (html, entryOptions) => {
    entryOptions.push({
        name: "Synchronize to Playlists",
        callback: (li) => {
            let packId = $(li).attr("data-pack");
            let pack = game.packs.get(packId);
            PlaylistSync.pushCompendiumEntriesIntoExistingPlaylists(pack);
        },
        icon: '<i class="fas fa-music"></i>',
        condition: (li) => {
            let packId = $(li).attr("data-pack");
            let pack = game.packs.get(packId);
            return game.user.isGM && pack.metadata.type === 'Playlist';
        }
    });
});