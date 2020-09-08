import { scene, setupMenuCamera, initMenuRenderLoop } from './menu-scene.js'
import { initMenuKeypressActions } from './menu-controls.js'

import { loadCreditsMenu } from './menu-credits.js'
import { loadCharNameMenu } from './menu-char-name.js'
import { loadPartySelectMenu } from './menu-party-select.js'
import { loadShopMenu } from './menu-shop.js'
import { loadMainMenu } from './menu-main.js'
import { loadSaveMenu } from './menu-save.js'
import { loadTitleMenu } from './menu-title.js'
import { loadGameOverMenu } from './menu-game-over.js'
import { loadChangeDiscMenu } from './menu-change-disc.js'


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

    ChangeDisc: 97, // Not on documentation, but it will be there somewhere, should have params too or even 3 separate codes
    GameOver: 98, // Not on documentation, but it will be there somewhere
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

let MENU_PROMISE

const loadMenuWithWait = (menuCode, param) => {
    console.log('loadMenuWithWait', menuCode, getMenuTypeStringFromCode(menuCode), param)
    cleanScene()
    initMenuRenderLoop()
    return new Promise(async (resolve) => {
        MENU_PROMISE = resolve
        switch (menuCode) {
            case MENU_TYPE.Credits: loadCreditsMenu(); break
            case MENU_TYPE.CharacterNameEntry: loadCharNameMenu(param); break
            case MENU_TYPE.PartySelect: loadPartySelectMenu(); break
            case MENU_TYPE.Shop: loadShopMenu(param); break
            case MENU_TYPE.MainMenu: loadMainMenu(); break
            case MENU_TYPE.SaveScreen: loadSaveMenu(); break

            case MENU_TYPE.ChangeDisc: loadChangeDiscMenu(param); break
            case MENU_TYPE.Title: loadTitleMenu(); break
            case MENU_TYPE.GameOver: loadGameOverMenu(); break
            // case MENU_TYPE.YuffieSteal: console.log('TODO: YuffieSteal'); break
            // case MENU_TYPE.RemoveCloudMateria: console.log('TODO: RemoveCloudMateria'); break
            // case MENU_TYPE.RestoreCloudMateria: console.log('TODO: RestoreCloudMateria'); break
        }
    })
}

const resolveMenuPromise = () => {
    MENU_PROMISE()
}

const initMenuModule = () => {
    setupMenuCamera()
    initMenuKeypressActions()
}
export {
    initMenuModule,
    loadMenuWithWait,
    resolveMenuPromise,
    MENU_TYPE
}