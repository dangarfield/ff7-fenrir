import { saveSaveMap, loadGame, downloadSaveMaps } from './savemap.js'

const initSavemapQuicksaveKeypressActions = () => {
  document.addEventListener(
    'keydown',
    e => {
      console.log('keydown', e.key, e)
      if (e.code === 'Digit1' && !e.shiftKey && !e.ctrlKey) {
        saveSaveMap(1, 1)
      }
      if (e.code === 'Digit2' && !e.shiftKey && !e.ctrlKey) {
        saveSaveMap(1, 2)
      }
      if (e.code === 'Digit3' && !e.shiftKey && !e.ctrlKey) {
        saveSaveMap(1, 3)
      }
      if (e.code === 'Digit4' && !e.shiftKey && !e.ctrlKey) {
        saveSaveMap(1, 4)
      }
      if (e.code === 'Digit5' && !e.shiftKey && !e.ctrlKey) {
        saveSaveMap(1, 5)
      }

      if (e.code === 'Digit1' && e.shiftKey && !e.ctrlKey) {
        loadGame(1, 1)
      }
      if (e.code === 'Digit2' && e.shiftKey && !e.ctrlKey) {
        loadGame(1, 2)
      }
      if (e.code === 'Digit3' && e.shiftKey && !e.ctrlKey) {
        loadGame(1, 3)
      }
      if (e.code === 'Digit4' && e.shiftKey && !e.ctrlKey) {
        loadGame(1, 4)
      }
      if (e.code === 'Digit5' && e.shiftKey && !e.ctrlKey) {
        loadGame(1, 5)
      }

      if (e.code === 'Digit1' && e.shiftKey && e.ctrlKey) {
        downloadSaveMaps()
      }
    },
    false
  )
}
export { initSavemapQuicksaveKeypressActions }
