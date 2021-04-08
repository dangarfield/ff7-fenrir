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
import { loadMainMenuWithTutorial } from './menu-tutorial.js'
import {
  yuffieStealMateriaAll,
  yuffieRestoreMateriaAll,
  unequipMateriaCharX,
  temporarilyHideMateriaCloud,
  reinstateMateriaCloud
} from '../materia/materia-module.js'

const MENU_TYPE = {
  Credits: 5,
  CharacterNameEntry: 6,
  PartySelect: 7,
  Shop: 8,
  MainMenu: 9,
  SaveScreen: 14,

  // Need to investigate as there is incomplete documentation
  // http://wiki.ffrtt.ru/index.php?title=FF7/Field/Script/Opcodes/49_MENU
  // https://github.com/myst6re/makoureactor/blob/4645b4b0595626b04163d3d0fa2d4b7569d6b440/core/field/Opcode.cpp#L3482

  YuffieStealMateriaAll: 15, // Eg Yuffie
  YuffieRestoreMateriaAll: 16, // Eg Yuffie
  UnequipMateriaCharX: 17, // with params
  TemporarilyHideMateriaCloud: 18, // Makou reactor = Clear Cloud's Materias
  ReinstateMateriaCloud: 19, // Makou reactor = Restore Cloud's Materias
  Unknown20: 20, // Unknown with params
  HPto1: 21, // with params
  CheckAndStoreResult: 22, // Makou reactor = Check if %1 and store the result in var[15][111]
  Unknown23: 23,
  Unknown24: 24,
  Unknown25: 25,

  ChangeDisc: 97, // Not on documentation, but it will be there somewhere, should have params too or even 3 separate codes
  GameOver: 98, // Not on documentation, but it will be there somewhere
  Title: 99 // Not on documentation, but it will be there somewhere
}
const MENUS_WITH_FADE = [
  MENU_TYPE.Credits,
  MENU_TYPE.CharacterNameEntry,
  MENU_TYPE.PartySelect,
  MENU_TYPE.Shop,
  MENU_TYPE.MainMenu,
  MENU_TYPE.SaveScreen,
  MENU_TYPE.ChangeDisc,
  MENU_TYPE.GameOver,
  MENU_TYPE.Title
]
const doesMenuRequireTransitionOut = menuCode => {
  return MENUS_WITH_FADE.includes(menuCode)
}
const getMenuTypeStringFromCode = menuCode => {
  const menuTypes = Object.keys(MENU_TYPE)
  for (let i = 0; i < menuTypes.length; i++) {
    if (MENU_TYPE[menuTypes[i]] === menuCode) {
      return menuTypes[i]
    }
  }
  return 'Unknown'
}
const clearScene = () => {
  while (scene.children.length) {
    scene.remove(scene.children[0])
  }
}

let MENU_PROMISE

const loadMenuWithWait = (menuCode, param) => {
  console.log(
    'loadMenuWithWait',
    menuCode,
    getMenuTypeStringFromCode(menuCode),
    param
  )
  clearScene()
  initMenuRenderLoop()
  return new Promise(async resolve => {
    MENU_PROMISE = resolve
    switch (menuCode) {
      case MENU_TYPE.Credits:
        loadCreditsMenu()
        break
      case MENU_TYPE.CharacterNameEntry:
        loadCharNameMenu(param)
        break
      case MENU_TYPE.PartySelect:
        loadPartySelectMenu()
        break
      case MENU_TYPE.Shop:
        loadShopMenu(param)
        break
      case MENU_TYPE.MainMenu:
        loadMainMenu()
        break
      case MENU_TYPE.SaveScreen:
        loadSaveMenu()
        break

      case MENU_TYPE.ChangeDisc:
        loadChangeDiscMenu(param)
        break
      case MENU_TYPE.Title:
        loadTitleMenu()
        break
      case MENU_TYPE.GameOver:
        loadGameOverMenu()
        break
      // case MENU_TYPE.YuffieSteal: console.log('TODO: YuffieSteal'); break
      // case MENU_TYPE.RemoveCloudMateria: console.log('TODO: RemoveCloudMateria'); break
      // case MENU_TYPE.RestoreCloudMateria: console.log('TODO: RestoreCloudMateria'); break
    }
  })
}
const loadMenuWithoutWait = (menuCode, param) => {
  console.log(
    'loadMenuWithoutWait',
    menuCode,
    getMenuTypeStringFromCode(menuCode),
    param
  )
  switch (menuCode) {
    case MENU_TYPE.YuffieStealMateriaAll:
      yuffieStealMateriaAll()
      break
    case MENU_TYPE.YuffieRestoreMateriaAll:
      yuffieRestoreMateriaAll()
      break

    case MENU_TYPE.UnequipMateriaCharX:
      unequipMateriaCharX(param)
      break

    case MENU_TYPE.TemporarilyHideMateriaCloud:
      temporarilyHideMateriaCloud()
      break
    case MENU_TYPE.ReinstateMateriaCloud:
      reinstateMateriaCloud()
      break

    // case MENU_TYPE.Unknown20: console.log('TODO: Unknown20'); break
    // case MENU_TYPE.HPto1: hpTo1(param); break
    // case MENU_TYPE.CheckAndStoreResult: checkAndStoreResult(); break
    // case MENU_TYPE.Unknown23: console.log('TODO: Unknown23'); break
    // case MENU_TYPE.Unknown24: console.log('TODO: Unknown24'); break
    // case MENU_TYPE.Unknown25: console.log('TODO: Unknown25'); break
  }
}
const loadTutorial = tutorialId => {
  console.log('loadMenuTutorial', tutorialId)
  clearScene()
  initMenuRenderLoop()
  return new Promise(async resolve => {
    MENU_PROMISE = resolve
    loadMainMenuWithTutorial(tutorialId)
  })
}
const resolveMenuPromise = () => {
  MENU_PROMISE()
}

const initMenuModule = () => {
  setupMenuCamera()
  initMenuKeypressActions()
  window.currentMenu = {
    scene: scene
  }
}
export {
  initMenuModule,
  loadMenuWithWait,
  loadMenuWithoutWait,
  loadTutorial,
  doesMenuRequireTransitionOut,
  resolveMenuPromise,
  MENU_TYPE
}
