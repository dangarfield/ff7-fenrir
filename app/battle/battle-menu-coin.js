import TWEEN from '../../assets/tween.esm.js'
import { KEY } from '../interaction/inputs.js'
import {
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
  updateDialogBGWIthTiledImage
} from '../menu/menu-box-helper.js'
import { DATA } from './battle-menu-command.js'
import { BATTLE_TWEEN_UI_GROUP } from './battle-scene.js'

const offsets = {
  dialog: { x: 100 / 2, y: 348 / 2, w: 328 / 2, h: 116 / 2 },
  header: { x: (20 - 16) / 2, y: (32 - 8) / 2 },
  pointer: { x: (112 - 16 - 4) / 2, y: (364 - 8 + 22) / 2 },
  line: {
    x: (44 - 16) / 2,
    y: (58 - 8) / 2,
    xMoney: (304 - 16) / 2,
    yAdj: 24 / 2
  }
}

let coinDialog
let amountMesh
let afterMesh
let amount
let coinBgTween
const startCoinBgTween = () => {
  coinBgTween = new TWEEN.Tween(
    coinDialog.userData.bg.material.map.offset,
    BATTLE_TWEEN_UI_GROUP
  )
    .to({ x: 2, y: 1 }, 750)
    .repeat(Infinity)
    .onStop(() => {
      coinDialog.userData.bg.material.map.offset.x = 0
      coinDialog.userData.bg.material.map.offset.y = 0
    })

  coinBgTween.start()
}
const stopCoinBgTween = () => {
  if (coinBgTween) {
    coinBgTween.stop()
    BATTLE_TWEEN_UI_GROUP.remove(coinBgTween)
  }
}

const openCoinDialog = async commandContainerGroup => {
  coinDialog = createDialogBox({
    id: 20,
    name: 'change',
    w: offsets.dialog.w,
    h: offsets.dialog.h,
    x: offsets.dialog.x,
    y: offsets.dialog.y,
    scene: commandContainerGroup
  })

  updateDialogBGWIthTiledImage(coinDialog, 'misc', 'Zeni')

  addTextToDialog(
    coinDialog,
    'How much will you raise?',
    'coin-instruction',
    LETTER_TYPES.BattleBaseFont,
    LETTER_COLORS.White,
    offsets.dialog.x + offsets.header.x,
    offsets.dialog.y + offsets.header.y,
    0.5
  )
  amount = Math.min(window.data.savemap.gil, 600000)

  const lineConfig = [
    ['Gil', amount],
    ['After', window.data.savemap.gil - amount],
    ['Gil on hand', window.data.savemap.gil]
  ]
  for (const [i, line] of lineConfig.entries()) {
    addTextToDialog(
      coinDialog,
      line[0],
      `coin-line-${i}`,
      LETTER_TYPES.BattleBaseFont,
      LETTER_COLORS.Cyan,
      offsets.dialog.x + offsets.line.x,
      offsets.dialog.y + offsets.line.y + i * offsets.line.yAdj,
      0.5
    )
    const money = addTextToDialog(
      coinDialog,
      '' + line[1],
      `coin-line-${i}-amount`,
      LETTER_TYPES.BattleTextStats,
      LETTER_COLORS.White,
      offsets.dialog.x + offsets.line.xMoney,
      offsets.dialog.y + offsets.line.y + i * offsets.line.yAdj,
      0.5,
      null,
      ALIGN.RIGHT
    )
    if (i === 0) amountMesh = money
    if (i === 1) afterMesh = money
  }
  startCoinBgTween()
  await showDialog(coinDialog)

  console.log('battleUI COIN: openCoinDialog', amountMesh, afterMesh)
}
let promiseToResolve
const selectCoinAmount = async () => {
  return new Promise(resolve => {
    console.log('battleUI COIN: selectCoinAmount')
    promiseToResolve = resolve
    movePointer(POINTERS.pointer1, offsets.pointer.x, offsets.pointer.y)
  })
}
const closeCoinDialog = async () => {
  POINTERS.pointer1.visible = false
  stopCoinBgTween()
  await closeDialog(coinDialog)
  removeGroupChildren(coinDialog)
  coinDialog.parent.remove(coinDialog)
  coinDialog = undefined
  amountMesh = undefined
  afterMesh = undefined
}

const changeAmount = delta => {
  const initialAmount = amount + 0
  amount = Math.max(
    0,
    Math.min(amount + delta, 600000, window.data.savemap.gil)
  )
  if (initialAmount === amount) return
  const after = window.data.savemap.gil - amount
  console.log(
    'battleUI COIN: changeAmount',
    amount,
    after,
    window.data.savemap.gil
  )
  const amountMeshNew = addTextToDialog(
    coinDialog,
    '' + amount,
    `coin-line-0-amount`,
    LETTER_TYPES.BattleTextStats,
    LETTER_COLORS.White,
    offsets.dialog.x + offsets.line.xMoney,
    offsets.dialog.y + offsets.line.y,
    0.5,
    null,
    ALIGN.RIGHT
  )
  amountMesh.parent.remove(amountMesh)
  amountMesh = amountMeshNew

  const afterMeshNew = addTextToDialog(
    coinDialog,
    '' + after,
    `coin-line-1-amount`,
    LETTER_TYPES.BattleTextStats,
    LETTER_COLORS.White,
    offsets.dialog.x + offsets.line.xMoney,
    offsets.dialog.y + offsets.line.y + offsets.line.yAdj,
    0.5,
    null,
    ALIGN.RIGHT
  )
  afterMesh.parent.remove(afterMesh)
  afterMesh = afterMeshNew
}
const handleKeyPressCoin = async key => {
  switch (key) {
    case KEY.UP:
      changeAmount(10000)
      break
    case KEY.DOWN:
      changeAmount(-10000)
      break
    case KEY.RIGHT:
      changeAmount(1000)
      break
    case KEY.LEFT:
      changeAmount(-1000)
      break
    case KEY.O:
      promiseToResolve({ name: `Coin: ${amount}`, amount }) // Just so it displays the debug easily
      break
    case KEY.X:
      DATA.state = 'returning'
      promiseToResolve(null)
      break
    default:
      break
  }
}
export { openCoinDialog, selectCoinAmount, closeCoinDialog, handleKeyPressCoin }
