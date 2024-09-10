import TWEEN from '../../assets/tween.esm.js'
import { KEY } from '../interaction/inputs.js'
import {
  addGroupToDialog,
  addImageToDialog,
  addTextToDialog,
  ALIGN,
  closeDialog,
  createDialogBox,
  createItemListNavigation,
  LETTER_COLORS,
  LETTER_TYPES,
  movePointer,
  POINTERS,
  removeGroupChildren,
  showDialog
} from '../menu/menu-box-helper.js'
import { DATA } from './battle-menu-command.js'
import { BATTLE_TWEEN_GROUP } from './battle-scene.js'
import { applyMPTurbo, isMPTurboActive } from './battle-stats.js'

let magicListDialog
let magicListGroup
let magicListGroupContents
let magicCostDialog
let magicCostGroupContents

const offsets = {
  pos: { x: 42 / 2, y: 380 / 2 },
  yAdj: 32 / 2,
  xAdj: 156 / 2,
  xAdjAll: (108 + 10) / 2
}
const getTextRowPosition = i => {
  return {
    x: offsets.pos.x + (i % 3) * offsets.xAdj - 8,
    y: offsets.pos.y + Math.trunc(i / 3) * offsets.yAdj - 4
  }
}
const drawMagicCost = (spellCost, currentMP, multiplier) => {
  removeGroupChildren(magicCostGroupContents)

  // TODO - Does this alignment change if hp<->mp materia gets 9999 mp?
  addTextToDialog(
    magicCostGroupContents,
    `${('' + spellCost).padStart(3, ' ')}/${('' + currentMP).padStart(3, ' ')}`,
    `cost-amount`,
    LETTER_TYPES.BattleTextStats,
    LETTER_COLORS.White,
    251 + 4,
    174 + 22,
    0.5
  )
}
const drawListPointer = () => {
  const { x, y } = getTextRowPosition(DATA.magic.pos)
  movePointer(POINTERS.pointer1, x - 2, y + 3.5) // Hmm, I think this pointer is too small for battle menus
}
const updateInfoForSelectedSpell = () => {
  let spell
  if (DATA.state === 'magic') {
    spell =
      DATA.actor.battleStats.menu.magic[DATA.magic.page * 3 + DATA.magic.pos]
    //   } else if (menu.type === 'Summon') {
    //     spell = DATA.battleStats.menu.summon[menu.page * 2 + menu.pos]
    //   } else if (menu.type === 'Enemy-Skill') {
    //     spell = DATA.battleStats.menu.enemySkills[menu.page * 2 + menu.pos]
  }
  console.log(
    'battleUI spell',
    DATA.state,
    DATA.magic.page,
    DATA.magic.pos,
    spell,
    DATA.actor.battleStats.menu.magic[DATA.magic.page * 3 + DATA.magic.pos]
  )
  if (spell === undefined) return

  const attackData = window.data.kernel.attackData[spell.index]
  removeGroupChildren(magicCostGroupContents)
  if (!spell.enabled) {
    drawMP(DATA.actor.battleStats.mp.current, false)
    drawAbilities(false)
  } else {
    // TODO - Other MP cost affecting equipment? Golden hairpin? Should this really be applied at the battleStats level?
    if (isMPTurboActive(spell)) {
      drawMP(
        DATA.actor.battleStats.mp.current,
        applyMPTurbo(attackData.mp, spell)
      )
    } else {
      drawMP(DATA.actor.battleStats.mp.current, attackData.mp)
    }
    drawInfo(attackData.description)
    drawAbilities(spell.addedAbilities)
  }
}
const drawMP = (currentMP, mp) => {
  // TODO - Does this alignment change if hp<->mp materia gets 9999 mp?
  // TODO - Should probably put currentMP on the background layer magicCostDialog as it doesn't change
  addTextToDialog(
    magicCostGroupContents,
    `/${('' + currentMP).padStart(3, ' ')}`,
    `cost-amount`,
    LETTER_TYPES.BattleTextStats,
    LETTER_COLORS.White,
    251 + 25,
    174 + 22,
    0.5
  )
  if (mp === false) return
  addTextToDialog(
    magicCostGroupContents,
    `${('' + mp).padStart(3, ' ')}`,
    `cost-amount`,
    LETTER_TYPES.BattleTextStats,
    LETTER_COLORS.White,
    251 + 4,
    174 + 22,
    0.5
  )
}
const drawAbilities = abilities => {
  if (abilities === false) return
  const displayedAbilities = ['QuadraMagic', 'All']
  for (const [i, abilityType] of displayedAbilities.entries()) {
    const ability = abilities.find(a => a.type === abilityType)
    if (ability && ability.count > 0) {
      addTextToDialog(
        magicCostGroupContents,
        ability.textBattle,
        `ability-${abilityType}-text`,
        LETTER_TYPES.BattleBaseFont,
        LETTER_COLORS.White,
        251 + (16 - 16) / 2,
        174 + (96 - 8 - 16 - 4) / 2 + i * 11,
        0.5,
        null
      )
      addTextToDialog(
        magicCostGroupContents,
        '' + ability.count,
        `ability-${abilityType}-count`,
        LETTER_TYPES.BattleTextStats,
        LETTER_COLORS.White,
        251 + (78 - 16) / 2,
        174 + (96 - 8 - 16 - 4) / 2 + i * 11,
        0.5,
        null
      )
      const times = addImageToDialog(
        magicCostGroupContents,
        'labels',
        'times',
        `ability-${abilityType}-times`,
        251 + (98 + 6) / 2,
        174 + (96 - 8 - 16 - 4) / 2 + i * 11,
        0.5
      )
      times.userData.isText = true
    }
  }
}
const drawInfo = desc => {
  window.currentBattle.ui.battleDescriptions.setText(desc)
}

const drawMagicList = commandContainerGroup => {
  // TODO - Remove all
  DATA.magic.page = 0
  DATA.magic.pos = 0

  // Create list group
  magicListDialog = createDialogBox({
    // 100 - 20
    id: 20,
    name: 'magic-summon-list',
    w: 251,
    h: 56,
    x: 0,
    y: 174,
    scene: commandContainerGroup
  })
  magicListGroup = addGroupToDialog(magicListDialog, 20)
  magicListGroupContents = addGroupToDialog(magicListDialog, 20)

  console.log('battleUI magic list actor', DATA.actor)
  for (let i = 0; i < DATA.actor.battleStats.menu.magic.length; i++) {
    const spell = DATA.actor.battleStats.menu.magic[i]
    const { x, y } = getTextRowPosition(i)
    // console.log('battleUI magic list', spell, x, y)
    if (spell.enabled) {
      let color = LETTER_COLORS.White
      //   if (menu.type === 'Magic') {
      //     // TODO - Is allowable
      //     color = LETTER_COLORS.Gray
      //   }

      const textGroup = addTextToDialog(
        magicListGroupContents,
        spell.name,
        `magic-list-${i}`,
        LETTER_TYPES.BattleBaseFont,
        color,
        x,
        y,
        0.5
      )
      for (let j = 0; j < textGroup.children.length; j++) {
        const textLetters = textGroup.children[j]
        textLetters.material.clippingPlanes =
          magicListDialog.userData.bg.material.clippingPlanes
      }
      if (spell.addedAbilities.some(a => a.type === 'All')) {
        // TODO - remaining allTotal must also be < 0
        const allArrow = addImageToDialog(
          magicListGroupContents,
          'pointers',
          'arrow-right',
          `magic-list-${i}-all`,
          x + offsets.xAdjAll,
          y,
          0.5,
          null,
          // commandDialog.userData.bg.material.clippingPlanes,
          ALIGN.LEFT
        )
        allArrow.userData.isText = true
        allArrow.material.clippingPlanes =
          magicListDialog.userData.bg.material.clippingPlanes
      }
    }
  }

  createItemListNavigation(
    magicListGroup,
    243.5,
    38,
    50,
    DATA.actor.battleStats.menu.magic.length / 3,
    3,
    magicListDialog.userData.bg.material.clippingPlanes
  )
  window.magicListDialog = magicListDialog
  window.magicListGroup = magicListGroup
  // Create cost group
  magicCostDialog = createDialogBox({
    id: 20,
    name: 'magic-cost',
    w: 69,
    h: 56,
    x: 251,
    y: 174,
    scene: commandContainerGroup
  })
  magicCostGroupContents = addGroupToDialog(magicCostDialog, 20)
  const mpNeeded = addImageToDialog(
    magicCostDialog,
    'labels',
    'mp-needed',
    `mp-needed`,
    251 + 16,
    174 + 16,
    0.5,
    null,
    // commandDialog.userData.bg.material.clippingPlanes,
    ALIGN.LEFT,
    ALIGN.BOTTOM
  )
  window.mpNeeded = mpNeeded
  mpNeeded.userData.isText = true
  mpNeeded.material.clippingPlanes =
    magicCostDialog.userData.bg.material.clippingPlanes

  // Show all
  showDialog(magicListDialog)
  showDialog(magicCostDialog)

  magicListGroup.userData.slider.userData.moveToPage(DATA.magic.page)
  magicListGroupContents.position.y = 0 // TODO - Update this

  updateInfoForSelectedSpell()
  drawListPointer()
}
const tweenMagicList = (up, state, cb) => {
  DATA.state = 'tween-list'
  for (let i = 0; i < DATA.page + 1; i++) {
    magicListGroupContents.children[i].visible = true
  }
  const from = { y: magicListGroupContents.position.y }
  const to = {
    y: up
      ? magicListGroupContents.position.y + offsets.yAdj
      : magicListGroupContents.position.y - offsets.yAdj
  }
  new TWEEN.Tween(from, BATTLE_TWEEN_GROUP)
    .to(to, 50)
    .onUpdate(function () {
      magicListGroupContents.position.y = from.y
    })
    .onComplete(function () {
      for (let i = 0; i < DATA.page; i++) {
        magicListGroupContents.children[i].visible = false
      }
      DATA.state = state
      console.log('battleUI tween end', DATA, DATA.state, state)
      cb()
    })
    .start()
}

const listNavigation = delta => {
  const menu = DATA[DATA.state]
  const lastPage = (menu.total - menu.cols * menu.rows) / menu.cols
  const maxPos = menu.cols * menu.rows
  const potential = menu.pos + delta
  if (potential < 0) {
    if (menu.page === 0) {
      // console.log('magic listNavigation on first page - do nothing')
    } else {
      // console.log('magic listNavigation not on first page - PAGE DOWN')
      if (delta === -1) {
        menu.pos = menu.pos + (menu.cols - 1)
        drawListPointer()
      }
      menu.page--
      tweenMagicList(false, DATA.state, updateInfoForSelectedSpell)
      magicListGroup.userData.slider.userData.moveToPage(menu.page)
    }
  } else if (potential >= maxPos) {
    // console.log('magic listNavigation page - is last page??', menu.page, maxPos, maxPage - 7)
    if (menu.page >= lastPage) {
      // console.log('magic listNavigation on last page - do nothing')
    } else {
      // console.log('magic listNavigation not on last page - PAGE UP', delta, delta === 1, menu.pos)
      if (delta === 1) {
        menu.pos = menu.pos - (menu.cols - 1)
        drawListPointer()
      }
      menu.page++
      tweenMagicList(true, DATA.state, updateInfoForSelectedSpell)
      magicListGroup.userData.slider.userData.moveToPage(menu.page)
    }
  } else {
    // console.log('magic listNavigation', menu.page, menu.pos, potential)
    menu.pos = potential
    updateInfoForSelectedSpell()
    drawListPointer()
  }
}

const listPageNavigation = up => {
  const menu = DATA[DATA.state]
  const lastPage = (menu.total - menu.cols * menu.rows) / menu.cols

  if (up) {
    menu.page = menu.page + menu.rows
    if (menu.page > lastPage) {
      menu.page = lastPage
    }
  } else {
    menu.page = menu.page - menu.rows
    if (menu.page < 0) {
      menu.page = 0
    }
  }
  console.log('battleUI listPageNavigation', menu, lastPage, menu.page)
  // Update list group positions

  magicListGroup.userData.slider.userData.moveToPage(menu.page)
  magicListGroupContents.position.y = menu.page * offsets.yAdj
  updateInfoForSelectedSpell()
}
const handleKeyPressMagic = async (key, drawCommandCursor) => {
  switch (key) {
    case KEY.UP:
      listNavigation(0 - DATA[DATA.state].cols)
      break
    case KEY.DOWN:
      listNavigation(DATA[DATA.state].cols)
      break
    case KEY.LEFT:
      listNavigation(-1)
      break
    case KEY.RIGHT:
      listNavigation(1)
      break
    case KEY.L1:
      listPageNavigation(false)
      break
    case KEY.R1:
      listPageNavigation(true)
      break
    case KEY.O:
      break
    case KEY.X:
      DATA.state = 'loading'
      movePointer(POINTERS.pointer1, -100, -100, true)
      closeDialog(magicCostDialog)
      await closeDialog(magicListDialog)
      removeGroupChildren(magicListDialog)
      removeGroupChildren(magicCostDialog)
      DATA.state = 'command'
      drawCommandCursor()
      // TODO - reinstate command cursor & helper text
      break
    default:
      break
  }
}
export { drawMagicList, handleKeyPressMagic }
