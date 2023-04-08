class PlaylistSync {
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