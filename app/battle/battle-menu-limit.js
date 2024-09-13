import { KEY } from '../interaction/inputs.js'
import {
  addImageToDialog,
  addTextToDialog,
  ALIGN,
  closeDialog,
  createDialogBox,
  LETTER_COLORS,
  LETTER_TYPES,
  movePointer,
  POINTERS,
  removeGroupChildren,
  showDialog,
  WINDOW_COLORS_SUMMARY
} from '../menu/menu-box-helper.js'
import { DATA } from './battle-menu-command.js'

const offsets = {
  dialog: { x: 160 / 2, y: 348 / 2, w: 272 / 2, h: 53 / 2, hAdj: 32 / 2 },
  header: {
    xLimit: 10 / 2,
    xLevel: 68 / 2,
    xLevelValue: 126 / 2,
    y: 13 / 2
  },
  pointer: { x: (160 + 12 - 16 - 4) / 2, y: (348 + 24 - 8 + 22) / 2 },
  line: {
    x: (16 - 16) / 2,
    y: (40 - 8) / 2,
    yAdj: 30 / 2
  }
}

let limitDialog

const openLimitDialog = async commandContainerGroup => {
  DATA.limit.pos = 0

  limitDialog = createDialogBox({
    id: 20,
    name: 'limit',
    w: offsets.dialog.w,
    h:
      offsets.dialog.h +
      (DATA.actor.battleStats.menu.limit.limits.length - 1) *
        offsets.dialog.hAdj,
    x: offsets.dialog.x,
    y: offsets.dialog.y,
    scene: commandContainerGroup,
    colors: WINDOW_COLORS_SUMMARY.DIALOG_SPECIAL
  })

  const labelLimit = addImageToDialog(
    limitDialog,
    'labels',
    'limit',
    'limit-title-limit',
    offsets.dialog.x + offsets.header.xLimit,
    offsets.dialog.y + offsets.header.y,
    0.5,
    null,
    ALIGN.LEFT
  )
  labelLimit.userData.isText = true
  window.labelLimit = labelLimit

  const labelLevel = addImageToDialog(
    limitDialog,
    'labels',
    'level',
    'limit-title-level',
    offsets.dialog.x + offsets.header.xLevel,
    offsets.dialog.y + offsets.header.y,
    0.5,
    null,
    ALIGN.LEFT
  )
  labelLevel.userData.isText = true

  const labelLevelValue = addImageToDialog(
    limitDialog,
    'limit-level',
    `limit-level-${DATA.actor.data.limit.level}`,
    'limit-title-level-value',
    offsets.dialog.x + offsets.header.xLevelValue,
    offsets.dialog.y + offsets.header.y - 0.5,
    0.5,
    null,
    ALIGN.LEFT
  )
  labelLevelValue.userData.isText = true

  for (let i = 0; i < DATA.actor.battleStats.menu.limit.limits.length; i++) {
    addTextToDialog(
      limitDialog,
      DATA.actor.battleStats.menu.limit.limits[i].name,
      `limit-level-${i}`,
      LETTER_TYPES.BattleBaseFont,
      LETTER_COLORS.White,
      offsets.dialog.x + offsets.line.x,
      offsets.dialog.y + offsets.line.y + i * offsets.line.yAdj,
      0.5
    )
  }

  await showDialog(limitDialog)
  console.log('battleUI LIMIT: openLimitDialog', limitDialog)
}
const updateInfoForSelectedLimit = () => {
  // TODO - Change color
  const limit = DATA.actor.battleStats.menu.limit.limits[DATA.limit.pos]
  window.currentBattle.ui.battleDescriptions.setText(limit.description, true)
}
const drawPointer = () => {
  movePointer(
    POINTERS.pointer1,
    offsets.pointer.x,
    offsets.pointer.y + DATA.limit.pos * offsets.line.yAdj
  )
}
let promiseToResolve
const selectLimit = async () => {
  return new Promise(resolve => {
    console.log('battleUI LIMIT: selectLimit')
    promiseToResolve = resolve
    updateInfoForSelectedLimit()
    drawPointer()
  })
}
const closeLimitDialog = async () => {
  POINTERS.pointer1.visible = false
  await closeDialog(limitDialog)
  removeGroupChildren(limitDialog)
  limitDialog.parent.remove(limitDialog)
  limitDialog = undefined
}

const wrapAround = (start, min, max, delta) => {
  const range = max - min + 1
  return ((((start - min + delta) % range) + range) % range) + min
}

const changeLimit = async delta => {
  DATA.limit.pos = wrapAround(
    DATA.limit.pos,
    0,
    DATA.actor.battleStats.menu.limit.limits.length - 1,
    delta
  )

  updateInfoForSelectedLimit()
  drawPointer()
}
const handleKeyPressLimit = async key => {
  switch (key) {
    case KEY.UP:
      changeLimit(-1)
      break
    case KEY.DOWN:
      changeLimit(1)
      break
    // case KEY.RIGHT:
    //   changeAmount(1000)
    //   break
    // case KEY.LEFT:
    //   changeAmount(-1000)
    //   break
    case KEY.O:
      promiseToResolve(DATA.actor.battleStats.menu.limit.limits[DATA.limit.pos])
      break
    case KEY.X:
      DATA.state = 'returning'
      promiseToResolve(null)
      break
    default:
      break
  }
}
export { openLimitDialog, selectLimit, closeLimitDialog, handleKeyPressLimit }
