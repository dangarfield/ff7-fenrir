const fs = require('fs-extra')
const path = require('path')

const FIELDS_FOLDER = './kujata-data/data/field/flevel.lgp'
const MAPLIST_FILE = './kujata-data/data/field/flevel.lgp/maplist.json'
const OUTPUT_FILE = './workings-out/output/walkmesh-position-helper.json'

let maplist

const getFieldIdForName = (name) => {
    for (let i = 0; i < maplist.length; i++) {
        if (maplist[i] === name) {
            return i
        }
    }
    return -1
}
const init = async () => {
    console.log('Walkmesh position helper: START')
    maplist = await fs.readJSON(MAPLIST_FILE)
    const fields = await fs.readdir(FIELDS_FOLDER)
    let datas = []
    // for (let i = 0; i < 4; i++) {
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i]
        console.log('field', field, (i+0), 'of', fields.length)
        const fieldName = field.replace('.json','')
        const f = await fs.readJson(path.join(FIELDS_FOLDER, field))
        // console.log('f', f)
        if (f && f.script && f.script.entities) {
            const data = {
                field: fieldName,
                fieldId: getFieldIdForName(fieldName),
                // scriptHeaderUnknown: f.script.header.unknown, // Always 1282
                cameraZoom: f.cameraSection.cameras[0].zoom,
                cameraUnknown: f.cameraSection.cameras[0].unknown,
                cameraRangeLeft: f.triggers.header.cameraRange.left,
                cameraRangeBottom: f.triggers.header.cameraRange.bottom,
                cameraRangeRight: f.triggers.header.cameraRange.right,
                cameraRangeTop: f.triggers.header.cameraRange.top
            }
            datas.push(data)
        }
    }
    datas.sort((a, b) => a.fieldId - b.fieldId)
    await fs.writeJson(OUTPUT_FILE, datas)



    console.log('Walkmesh position helper: END')
}
init()