import { getFieldMapList } from './field-fetch-data.js'

let maplist

const getFieldIdForName = async (name) => {
    if (maplist === undefined) {
        maplist = await getFieldMapList()
    }
    for (let i = 0; i < maplist.length; i++) {
        if (maplist[i] === name) {
            return i
        }
    }
    return -1
}
const getFieldNameForId = async (id) => {
    if (maplist === undefined) {
        maplist = await getFieldMapList()
    }
    return maplist[id]
}
const getLastFieldId = async () => {
    const fieldName = window.currentField && window.currentField.lastFieldName ? window.currentField.lastFieldName : ''
    const fieldId = await getFieldIdForName(fieldName)
    return fieldId
}

export {
    getLastFieldId,
    getFieldNameForId
}