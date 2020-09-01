import { scene, setupMenuCamera, initMenuRenderLoop } from './menu-scene.js'
import { initMenuKeypressActions } from './menu-controls.js'

import { loadCreditsMenu } from './menu-credits.js'
import { loadCharNameMenu } from './menu-char-name.js'
import { loadPartySelectMenu } from './menu-party-select.js'
import { loadShopMenu } from './menu-shop.js'
import { loadMainMenu } from './menu-main.js'
import { loadSaveMenu } from './menu-save.js'
import { loadTitleMenu } from './menu-title.js'


const MENU_TYPE = {
    Credits: 5,
    CharacterNameEntry: 6,
    PartySelect: 7,
    Shop: 8,
    MainMenu: 9,
    SaveScreen: 14,

    // Need to investigate as there is incomplete documentation
    // http://wiki.ffrtt.ru/index.php?title=FF7/Field/Script/Opcodes/49_MENU
    YuffieSteal: 15,
    Unknown16: 16,
    Unknown17: 17, // with params
    Unknown18: 18,
    Unknown19: 19,
    Unknown20: 20,
    Unknown21: 21,
    Unknown22: 22,
    Unknown23: 23,
    Unknown24: 24,
    Unknown25: 25,

    Title: 99 // Not on documentation, but it will be there somewhere
}
const getMenuTypeStringFromCode = (menuCode) => {
    const menuTypes = Object.keys(MENU_TYPE)
    for (let i = 0; i < menuTypes.length; i++) {
        if (MENU_TYPE[menuTypes[i]] === menuCode) {
            return menuTypes[i]
        }
    }
    return 'Unknown'
}
const cleanScene = () => { while (scene.children.length) { scene.remove(scene.children[0]) } }


const loadMenu = (menuCode, param) => {
    console.log('loadMenu', menuCode, getMenuTypeStringFromCode(menuCode), param)
    cleanScene()
    initMenuRenderLoop()
    switch (menuCode) {
        case MENU_TYPE.Credits: loadCreditsMenu(); break
        case MENU_TYPE.CharacterNameEntry: loadCharNameMenu(param); break
        case MENU_TYPE.PartySelect: loadPartySelectMenu(); break
        case MENU_TYPE.Shop: loadShopMenu(param); break
        case MENU_TYPE.MainMenu: loadMainMenu(); break
        case MENU_TYPE.SaveScreen: loadSaveMenu(); break

        case MENU_TYPE.Title: loadTitleMenu(); break
        // case MENU_TYPE.YuffieSteal: console.log('TODO: YuffieSteal'); break
        // case MENU_TYPE.RemoveCloudMateria: console.log('TODO: RemoveCloudMateria'); break
        // case MENU_TYPE.RestoreCloudMateria: console.log('TODO: RestoreCloudMateria'); break
    }
}

const initMenuModule = () => {
    setupMenuCamera()
    initMenuKeypressActions()
}
export {
    initMenuModule,
    loadMenu,
    MENU_TYPE
}