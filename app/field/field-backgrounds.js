import { setBankData, getBankData } from '../data/savemap.js'
import * as assign from './field-op-codes-assign.js'
import { sleep } from '../helpers/helpers.js'

const changeBackgroundParamState = (param, state, isActive) => {
    // console.log('changeBackgroundParamState', param, state, isActive)
    // const bgLayers = window.currentField.backgroundLayers.children.filter(l => l.userData.param === param && l.userData.state === state)
    // bgLayers.map(l => l.visible = isActive)


    const allBgLayers = window.currentField.backgroundLayers.children
    for (let i = 0; i < allBgLayers.length; i++) {
        const l = allBgLayers[i]
        if (l.userData.param === param && l.userData.state === state) {
            l.visible = isActive
        }
    }
}
const clearBackgroundParam = (param) => {
    // console.log('clearBackgroundParam', param)
    const bgLayers = window.currentField.backgroundLayers.children.filter(l => l.userData.param === param)
    bgLayers.map(l => l.visible = false)
}

setTimeout(async () => {
    console.log('start')
    while (false) {
        await sleep(1000 / 30 * 4)
        changeBackgroundParamState(1, 0, false)
        changeBackgroundParamState(1, 1, true)
        await sleep(1000 / 30 * 5)
        changeBackgroundParamState(1, 1, false)
        changeBackgroundParamState(1, 2, true)
        await sleep(1000 / 30 * 5)
        changeBackgroundParamState(1, 2, false)
        changeBackgroundParamState(1, 3, true)

        await sleep(1000 / 30 * 5)
        changeBackgroundParamState(1, 3, false)
        changeBackgroundParamState(1, 4, true)
        await sleep(1000 / 30 * 5)
        changeBackgroundParamState(1, 4, false)
        changeBackgroundParamState(1, 5, true)

        await sleep(1000 / 30 * 5)
        changeBackgroundParamState(1, 5, false)
        changeBackgroundParamState(1, 0, true)
    }
    // assign.SETBYTE({ bd: 5, a: 24, bs: 0, v: 0 })
    // assign.SETBYTE({ bd: 5, a: 27, bs: 0, v: 255 })
    // console.log('5-27', getBankData(5, 27))
    // assign.PLUS({ bd: 5, d: 27, bs: 0, s: 1 })
    // console.log('5-27', getBankData(5, 27))

    // assign.SETBYTE({ bd: 5, a: 25, bs: 0, v: 0 })
    // console.log('SETBYTE', getBankData(5, 25))

    // assign.RANDOM({ b: 5, s: 26 })
    // console.log('RANDOM', getBankData(5, 26))

    // assign.MOD({ bd: 5, d: 26, bs: 0, s: 4 })
    // console.log('MOD', getBankData(5, 26))

    // if (getBankData(5, 26) === 0) {
    //     setBankData(5, 26, 1)
    //     console.log('MOD set to 1', getBankData(5, 26))
    // }
    // console.log('end')

    // while (true) {
    //     console.log('loop')
    //     await sleep(1000)
    //     changeBackgroundParamState(1, getBankData(5, 27), true)
    //     await sleep(1000)
    //     changeBackgroundParamState(1, getBankData(5, 27), false)
    //     await sleep(1000)
    //     changeBackgroundParamState(1, 3, true)
    //     await sleep(1000)
    //     changeBackgroundParamState(1, 3, false)
    // }

}, 10000)
export {
    changeBackgroundParamState,
    clearBackgroundParam
}