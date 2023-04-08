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
}

const getCompendiumNames = function(compendiumCollection) {
    return compendiumCollection.index.map(idx => idx.name)
}

/**
 * Register our module's debug flag with developer mode's custom hook
 */
Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(PlaylistSync.ID);
});

Hooks.on("renderCompendium", (compendiumApp, html, appData) => {
    console.log(`renderCompendium called...`);
    compendiumApp.getData().then(data => {
        console.log(getCompendiumNames(data));
    });
});