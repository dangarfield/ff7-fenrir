const DEFAULT_SAVE_ID = 1

const initNewSaveMap = () => {
    // console.log('initNewSaveMap: START')
    // console.log('window.data.kernel', window.data.kernel)
    window.data.savemap = Object.assign({}, window.data.kernel.initData.data)
    // console.log('initNewSaveMap: END')
}

const loadSaveMap = (index) => {
    let savemap = window.localStorage.getItem(`save-${index}`)
    console.log('loadSaveMap', index, savemap)
    if (savemap === null) {
        console.log('no save, creating a new one')
        savemap = Object.assign({}, window.data.kernel.initData.data)
        saveSaveMap(index)
    }
    window.data.savemap = savemap
    console.log('window.data.savemap', window.data.savemap)
}

const saveSaveMap = (index) => {
    console.log('saveSaveMap', index)
    window.localStorage.setItem(`save-${index}`, JSON.stringify(window.data.savemap))
}

export {
    initNewSaveMap,
    loadSaveMap,
    saveSaveMap
}