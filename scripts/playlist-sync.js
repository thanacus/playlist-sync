class PlaylistSync {
    static pushCompendiumEntriesIntoExistingPlaylists(pack) {
        pack.getDocuments().then(playlists => {
            playlists.forEach(packPlaylist => {
                pushCompendiumEntriesIntoExistingPlaylist(packPlaylist)
            })
        })
    }
    static async pushCompendiumEntriesIntoExistingPlaylist(compendium, playlistDocId) {
        const packPlaylist = await compendium.collection.getDocument(playlistDocId)
        const gamePlaylist = game.playlists.getName(packPlaylist.name)

        console.log(gamePlaylist)
        if(typeof gamePlaylist === 'undefined') {
            ui.notifications.info(`${packPlaylist.name} not found yet in game, importing.`)
            game.collections.get('Playlist').importFromCompendium(compendium.collection, playlistDocId, {}, {renderSheet: false})
            return
        }

        let updatedTrackList = []
        packPlaylist.getEmbeddedCollection("PlaylistSound").forEach(sound => {
            updatedTrackList.push(sound.clone());
        })

        gamePlaylist.deleteEmbeddedDocuments("PlaylistSound", gamePlaylist.sounds.map(s => s.id)).then(() => {
            gamePlaylist.createEmbeddedDocuments("PlaylistSound", updatedTrackList).then(() => {
                ui.notifications.info(`${gamePlaylist.name} updated from compendium.`)
            })
        })
    }
}

const entryCallback = (compendium, entryOptions) => {
    entryOptions.push({
        name: "Synchronize to Playlists",
        callback: (li, a, b) => {
           $(li).each((idx, folder) => {
               $(folder).parent().find(".document.playlist").each((idx, item) => {
                   const compendiumId = compendium.collection.metadata.id
                   const playlistCompDoc = game.packs.get(compendiumId).index.get(item.dataset.documentId)
                   PlaylistSync.pushCompendiumEntriesIntoExistingPlaylist(compendium, item.dataset.documentId);
               })
           })
        },
        icon: '<i class="fas fa-music"></i>',
        condition: (li) => {
           return game.user.isGM && compendium?.collection?.metadata?.type === 'Playlist'
        }
    });
}

Hooks.on('getDirectoryApplicationFolderContext', entryCallback)
