import { getMenuBlackOverlay, setMenuState } from './menu-module.js'
import {
  createDialogBox,
  addGroupToDialog,
  addImageToDialog,
  fadeOverlayOut,
  fadeOverlayIn,
  removeGroupChildren
} from './menu-box-helper.js'
import { KEY } from '../interaction/inputs.js'
import { loadMusic, playMusic, stopMusic } from '../media/media-music.js'
import { loadTitleMenu } from './menu-title.js'

let gameOverDialog, gameOverGroup

const loadGameOverMenu = async param => { // Note, this will never actually be called...
  if (param === null || param === undefined) {
    param = 0
  }
  console.log('gameover loadGameOverMenu', param)

  gameOverDialog = await createDialogBox({
    id: 15,
    name: 'gameOverDialog',
    w: 320,
    h: 240,
    x: 0,
    y: 0,
    expandInstantly: true,
    noClipping: true
  })
  gameOverDialog.visible = true
  removeGroupChildren(gameOverDialog)
  gameOverGroup = addGroupToDialog(gameOverDialog, 25)

  drawGameOver()
  playGameOverMusic()
  await fadeOverlayOut(getMenuBlackOverlay())
  setMenuState('gameover')
}
const playGameOverMusic = async () => {
  await loadMusic(101, 'over2')
  playMusic(101, false, 1000)
}
const drawGameOver = () => {
  removeGroupChildren(gameOverGroup)

  addImageToDialog(gameOverGroup, 'game-over', 'game-over', 'game-over-image', 160, 120, 0.5)
}
const exitMenu = async () => {
  console.log('exitMenu')
  setMenuState('loading')
  stopMusic(1000)
  await fadeOverlayIn(getMenuBlackOverlay())
  gameOverDialog.visible = false

  console.log('gameover EXIT')
  loadTitleMenu()
}
const keyPress = async (key, firstPress, state) => {
  console.log('press MAIN MENU disc', key, firstPress, state)

  if (state === 'gameover') {
    if (key) {
      exitMenu()
    }
  }
}
export { loadGameOverMenu, keyPress }
