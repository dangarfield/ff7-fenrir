import { createNanoEvents } from '../../assets/nanoevents.js'
import { initSavemapQuicksaveKeypressActions } from '../data/savemap-controls.js'
let emitter
const keys = {
  up: false,
  right: false,
  down: false,
  left: false,
  x: false,
  o: false,
  square: false,
  triangle: false,
  l1: false,
  l2: false,
  r1: false,
  r2: false,
  select: false,
  start: false
}
const KEY = {
  UP: 'up',
  RIGHT: 'right',
  DOWN: 'down',
  LEFT: 'left',
  X: 'x',
  O: 'o',
  SQUARE: 'square',
  TRIANGLE: 'triangle',
  L1: 'l1',
  L2: 'l2',
  R1: 'r1',
  R2: 'r2',
  SELECT: 'select',
  START: 'start'
}
const history = []
const input = {
  up: { lastCall: 0, count: 0, keyDown: false, key: KEY.UP },
  right: { lastCall: 0, count: 0, keyDown: false, key: KEY.RIGHT },
  down: { lastCall: 0, count: 0, keyDown: false, key: KEY.DOWN },
  left: { lastCall: 0, count: 0, keyDown: false, key: KEY.LEFT },
  x: { lastCall: 0, count: 0, keyDown: false, key: KEY.X },
  o: { lastCall: 0, count: 0, keyDown: false, key: KEY.O },
  square: { lastCall: 0, count: 0, keyDown: false, key: KEY.SQUARE },
  triangle: { lastCall: 0, count: 0, keyDown: false, key: KEY.TRIANGLE },
  l1: { lastCall: 0, count: 0, keyDown: false, key: KEY.L1 },
  l2: { lastCall: 0, count: 0, keyDown: false, key: KEY.L2 },
  r1: { lastCall: 0, count: 0, keyDown: false, key: KEY.R1 },
  r2: { lastCall: 0, count: 0, keyDown: false, key: KEY.R2 },
  select: { lastCall: 0, count: 0, keyDown: false, key: KEY.SELECT },
  start: { lastCall: 0, count: 0, keyDown: false, key: KEY.START }
}
const sendEvent = (key, firstPress) => {
  emitter.emit(key, firstPress)
}
const sendSteppedThrottleEvent = (keyData, keyDown) => {
  addToHistory(keyData.key, keyDown)
  keyData.keyDown = keyDown

  if (!keyDown) {
    keyData.lastCall = 0
    keyData.count = 0
    if (keyData.key === KEY.SQUARE) sendEvent(keyData.key, -1) // Only send key up events for square right now, eg battles
    return
  }
  const delay = keyData.count > 1 ? 32 : 60
  const now = new Date().getTime()
  const testTime = now - keyData.lastCall < delay
  // console.log('now', now, delay, testTime)
  if (testTime) {
    return
  }
  keyData.lastCall = now

  if (keyData.count === 0) {
    // console.log('KEY PRESS - FIRST', keyData.key)
    sendEvent(keyData.key, true)
  } else {
    // console.log('KEY PRESS - HOLDING', keyData.key)
    sendEvent(keyData.key, false)
  }
  keyData.count++
}
const getActiveInputs = () => {
  const activeKeys = JSON.parse(JSON.stringify(keys))
  return activeKeys
}
const getInputHistory = () => {
  return history
}
const addToHistory = (key, keyDown) => {
  history.unshift({ key, keyDown })
  while (history.length > 20) {
    history.pop()
  }
  // console.log('history', history)
}
const setKeyPress = (keyCode, state) => {
  if (keyCode === 87) {
    // w -> up
    keys.up = state
    sendSteppedThrottleEvent(input.up, state)
  } else if (keyCode === 68) {
    // d -> right
    keys.right = state
    sendSteppedThrottleEvent(input.right, state)
  } else if (keyCode === 83) {
    // s -> down
    keys.down = state
    sendSteppedThrottleEvent(input.down, state)
  } else if (keyCode === 65) {
    // a -> left
    keys.left = state
    sendSteppedThrottleEvent(input.left, state)
  } else if (keyCode === 74) {
    // j -> X
    keys.x = state
    sendSteppedThrottleEvent(input.x, state)
  } else if (keyCode === 75) {
    // k -> O
    keys.o = state
    sendSteppedThrottleEvent(input.o, state)
  } else if (keyCode === 85) {
    // u -> Square
    keys.square = state
    sendSteppedThrottleEvent(input.square, state)
  } else if (keyCode === 73) {
    // i -> Triangle
    keys.triangle = state
    sendSteppedThrottleEvent(input.triangle, state)
  } else if (keyCode === 72) {
    // h -> L1
    keys.l1 = state
    sendSteppedThrottleEvent(input.l1, state)
  } else if (keyCode === 89) {
    // y -> L2
    keys.l2 = state
    sendSteppedThrottleEvent(input.l2, state)
  } else if (keyCode === 76) {
    // l -> R1
    keys.r1 = state
    sendSteppedThrottleEvent(input.r1, state)
  } else if (keyCode === 79) {
    // o -> R2
    keys.r2 = state
    sendSteppedThrottleEvent(input.r2, state)
  } else if (keyCode === 55) {
    // 7 -> Select
    keys.select = state
    sendSteppedThrottleEvent(input.select, state)
  } else if (keyCode === 56) {
    // 8 -> Start
    keys.start = state
    sendSteppedThrottleEvent(input.start, state)
  }
}
const setupInputs = () => {
  // Note, browsers do not allow holding of multiple keys, eg,
  // Hold up, keep up held, press circle, let go of circle, you still have circle held
  // In a game, you would expect up to still be sending events, but in the browser, it doesn't
  // Need to think of a way around this, more like a keypress processing loop like in
  // updateFieldPlayerMovement()
  document.addEventListener(
    'keydown',
    e => {
      setKeyPress(e.which, true)
    },
    false
  )
  document.addEventListener(
    'keyup',
    e => {
      setKeyPress(e.which, false)
    },
    false
  )
  emitter = createNanoEvents()
  initSavemapQuicksaveKeypressActions()
}
const getKeyPressEmitter = () => {
  return emitter
}
export {
  KEY,
  setupInputs,
  getActiveInputs,
  getInputHistory,
  getKeyPressEmitter
}
