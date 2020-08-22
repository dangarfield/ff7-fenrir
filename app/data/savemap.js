const DEFAULT_SAVE_ID = 1

let TEMP_FIELD_BANK = new Uint8Array(256).fill(0)

const initNewSaveMap = () => {
    // console.log('initNewSaveMap: START')
    // console.log('window.data.kernel', window.data.kernel)
    window.data.savemap = Object.assign({}, window.data.kernel.initData.data)
    // console.log('initNewSaveMap: END')
}

const loadSaveMap = (index) => {
    const savemap = window.localStorage.getItem(`save-${index}`)
    console.log('loadSaveMap', index, window.data.savemap)
    if (savemap === null) {
        console.log('no save, creating a new one')
        window.data.savemap = Object.assign({}, window.data.kernel.initData.data)
        saveSaveMap(index)
    } else {
        window.data.savemap = JSON.parse(savemap)
    }
    console.log('window.data.savemap', window.data.savemap)
}

const saveSaveMap = (index) => {
    console.log('saveSaveMap', index)
    window.localStorage.setItem(`save-${index}`, JSON.stringify(window.data.savemap))
}

const resetTempBank = () => {
    TEMP_FIELD_BANK = new Uint8Array(256).fill(0)
}
const getValueFromBank = (bank, type, index) => {
    if (type === 1) {
        return bank[index]
    } else {
        const bit1 = bank[(index * 2) + 1]
        const bit2 = bank[(index * 2) + 0]
        const bit16 = (((bit2 & 0xff) << 8) | (bit1 & 0xff))
        // console.log('bit1', bit1, 'bit2', bit2, 'bit16', bit16)
        return bit16
    }
}
const getBankData = (bankRef, index) => {
    // console.log('getBankData', bankRef, index, window.data.savemap)
    let bank = 1
    let bytes = 1
    switch (bankRef) {
        case 1: bank = window.data.savemap.banks.bank1; bytes = 1; break
        case 2: bank = window.data.savemap.banks.bank1; bytes = 2; break

        case 3: bank = window.data.savemap.banks.bank2; bytes = 1; break
        case 4: bank = window.data.savemap.banks.bank2; bytes = 2; break

        case 5: bank = TEMP_FIELD_BANK; bytes = 1; break
        case 6: bank = TEMP_FIELD_BANK; bytes = 2; break

        case 11: bank = window.data.savemap.banks.bank3; bytes = 1; break
        case 12: bank = window.data.savemap.banks.bank3; bytes = 2; break

        case 13: bank = window.data.savemap.banks.bank4; bytes = 1; break
        case 14: bank = window.data.savemap.banks.bank4; bytes = 2; break

        case 15: bank = window.data.savemap.banks.bank5; bytes = 1; break
        case 7: bank = window.data.savemap.banks.bank5; bytes = 2; break

        default:
            break;
    }
    return getValueFromBank(bank, bytes, index)
}
export {
    initNewSaveMap,
    loadSaveMap,
    saveSaveMap,
    getBankData,
    resetTempBank
}