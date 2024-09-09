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
const getCurrentSpell = (actor, pos, page) => {
  return actor.battleStats.menu.magic[page * 3 + pos]
}
const drawMagicCost = (spellCost, currentMP) => {
  removeGroupChildren(magicCostGroupContents)

  // TODO - Does this alignment change if hp<->mp materia gets 9999 mp?
  // I'm up to here...
  addTextToDialog(
    magicCostGroupContents,
    `${('' + spellCost).padStart(3, ' ')}/${('' + currentMP).padStart(3, ' ')}`,
    `magic-cost-amount`,
    LETTER_TYPES.MenuTextStats,
    LETTER_COLORS.White,
    251 + 116 / 2,
    174 + 52 / 2,
    0.5,
    magicCostDialog.userData.bg.material.clippingPlanes
    // ALIGN.RIGHT
  )

  //   addTextToDialog(
  //     mpGroup,
  //     '' + spellCost,
  //     'mp-required',
  //     LETTER_TYPES.MenuTextStats,
  //     LETTER_COLORS.White,
  //     68 / 2,
  //     52 / 2,
  //     0.5,
  //     null,
  //     ALIGN.RIGHT
  //   )

  //   addTextToDialog(
  //     mpGroup,
  //     '' + currentMP,
  //     'mp-current',
  //     LETTER_TYPES.MenuTextStats,
  //     LETTER_COLORS.White,
  //     116 / 2,
  //     52 / 2,
  //     0.5,
  //     null,
  //     ALIGN.RIGHT
  //   )
}
const drawMagicCursor = (actor, DATA) => {
  const { x, y } = getTextRowPosition(DATA.magic.pos)
  movePointer(POINTERS.pointer1, x - 2, y + 3.5) // Hmm, I think this pointer is too small for battle menus

  const spell = getCurrentSpell(actor, DATA.magic.pos, DATA.magic.page)
  console.log('battleUI current spell', spell)

  // Set text
  const desc = window.data.kernel.magicDescriptions[spell.index]
  window.currentBattle.ui.battleDescriptions.setText(desc)

  // TODO - More effectively calculate the spell cost. Could be affected by materia (MP Turbo), equipment (golden hairpin) etc
  // Should really calculate this in battle stats
  const spellCost = 123
  drawMagicCost(spellCost, actor.battleStats.mp.current)
}
const drawMagicList = (commandContainerGroup, actor, DATA) => {
  // TODO - Remove all

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

  console.log('battleUI magic list actor', actor)
  for (let i = 0; i < actor.battleStats.menu.magic.length; i++) {
    const spell = actor.battleStats.menu.magic[i]
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
    actor.battleStats.menu.magic.length / 3,
    3
  ) // TODO - Pass in clipping planes

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

  drawMagicCursor(actor, DATA)
  magicListGroup.userData.slider.userData.moveToPage(DATA.magic.page)
  magicListGroupContents.position.y = 0 // TODO - Update this

  // TODO update selected item cost and help text
}

const handleKeyPressMagic = async (key, DATA, drawCommandCursor) => {
  switch (key) {
    case KEY.UP:
      break
    case KEY.DOWN:
      break
    case KEY.LEFT:
      break
    case KEY.RIGHT:
      break
    case KEY.O:
      break
    case KEY.X:
      DATA.state = 'loading'
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
