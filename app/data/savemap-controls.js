import { saveSaveMap } from './savemap.js'

const initSavemapQuicksaveKeypressActions = () => {

    document.addEventListener('keydown', (e) => {
        // console.log('keydown', e.key)
        if (e.key === '1') {
            saveSaveMap(1)
        }
        if (e.key === '2') {
            saveSaveMap(2)
        }
        if (e.key === '3') {
            saveSaveMap(3)
        }
        if (e.key === '4') {
            saveSaveMap(4)
        }
        if (e.key === '5') {
            saveSaveMap(5)
        }
    }, false)


}
export {
    initSavemapQuicksaveKeypressActions
}