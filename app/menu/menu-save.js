import {loadSaveMenu as loadSaveMainMenu} from './menu-main-save.js'
const loadSaveMenu = async () => {
  console.log('loadSaveMenu')
  loadSaveMainMenu(true)
}

export { loadSaveMenu }
