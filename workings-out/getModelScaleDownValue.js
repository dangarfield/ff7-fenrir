const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')

const FIELD_FOLDER = './kujata-data/data/field/flevel.lgp'
const OUT_FILE = './workings-out/output/getModelScaleDownValue.json'

const init = async () => {
    console.log('getModelScaleDownValue - START')
    const fields = await fs.readdir(FIELD_FOLDER)
    let scaleDatas = []
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i]
        const fieldJson = await fs.readJson(path.join(FIELD_FOLDER, field))
        if (fieldJson && fieldJson.model && fieldJson.model.header && fieldJson.model.header.modelScale) {
            console.log(`${i + 1} of ${fields.length}`, 'scale', field, fieldJson.model.header.modelScale)
            scaleDatas.push({ field: field, scale: fieldJson.model.header.modelScale })
        }
    }
    let grouped = _.chain(scaleDatas).groupBy('scale').map((k, v) => ({ scale: v, count: k.length, fields: k.map(n => n.field) })).value()
    // console.log('grouped', grouped)
    // await fs.writeJson(OUT_FILE, grouped, { spaces: '\t'})
    let formattedOut = JSON.stringify(grouped).replace(/\{/g, '\n\t{ ').replace(/\,/g, ', ').replace(/\:/g, ': ')
    await fs.writeFile(OUT_FILE, formattedOut)
    console.log('getModelScaleDownValue - END')
}
init()