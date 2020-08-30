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
const identifyBank = (bankRef) => {
    let bank = 1
    let bytes = 1
    switch (bankRef) {
        case 1: bank = window.data.savemap.banks.bank1; bytes = 1; break // eg 1/2
        case 2: bank = window.data.savemap.banks.bank1; bytes = 2; break

        case 3: bank = window.data.savemap.banks.bank2; bytes = 1; break // eg 3/4
        case 4: bank = window.data.savemap.banks.bank2; bytes = 2; break

        case 5: bank = TEMP_FIELD_BANK; bytes = 1; break
        case 6: bank = TEMP_FIELD_BANK; bytes = 2; break

        case 11: bank = window.data.savemap.banks.bank3; bytes = 1; break // eg B/C
        case 12: bank = window.data.savemap.banks.bank3; bytes = 2; break

        case 13: bank = window.data.savemap.banks.bank4; bytes = 1; break // eg D/E
        case 14: bank = window.data.savemap.banks.bank4; bytes = 2; break

        case 15: bank = window.data.savemap.banks.bank5; bytes = 1; break // eg 7/F
        case 7: bank = window.data.savemap.banks.bank5; bytes = 2; break

        default:
            break;
    }
    return { bank, bytes }
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
const setValueToBank = (bank, type, index, newValue) => {
    if (type === 1) {
        bank[index] = newValue
    } else {
        var bit1 = ((newValue >> 8) & 0xff)
        var bit2 = newValue & 0xff
        bank[(index * 2) + 1] = bit2
        bank[(index * 2) + 0] = bit1
        console.log('setValueToBank', newValue, 'bit1', bit1, 'bit2', bit2)
    }
}
const getBankData = (bankRef, index) => {
    // console.log('getBankData', bankRef, index, window.data.savemap)
    const bankData = identifyBank(bankRef)
    return getValueFromBank(bankData.bank, bankData.bytes, index)
}
const setBankData = (bankRef, index, value) => {
    console.log('setBankData', bankRef, index, window.data.savemap)
    const bankData = identifyBank(bankRef)
    setValueToBank(bankData.bank, bankData.bytes, index, value)
}
export {
    initNewSaveMap,
    loadSaveMap,
    saveSaveMap,
    getBankData,
    setBankData,
    resetTempBank
}