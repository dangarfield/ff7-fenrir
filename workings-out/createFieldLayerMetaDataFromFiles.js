const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')

const FIELD_FOLDER = './fenrir-data/field/backgrounds'
const OUT_FILE = path.join(FIELD_FOLDER, 'backgrounds-metadata.json')

const init = async () => {
    console.log('createFieldLayerMetaDataFromFiles - START')
    const fieldNames = await fs.readdir(FIELD_FOLDER)
    let fieldDatas = {}
    for (let i = 0; i < fieldNames.length; i++) {
        const fieldName = fieldNames[i];
        const fileNames = await fs.readdir(path.join(FIELD_FOLDER, fieldName))
        let layers = []
        for (let j = 0; j < fileNames.length; j++) {
            const fileName = fileNames[j]
            const depthMatch = fileName.match('_([0-9]*).png')
            if (depthMatch && depthMatch.length > 1) {
                const depth = parseInt(depthMatch[1])
                // console.log('File', fieldName, fileName, depth)
                layers.push({ file: fileName, depth })
            }
        }
        // console.log('fieldData', fieldData)
        fieldDatas[fieldName] = layers
    }
    console.log(' - fieldDatas.length', fieldDatas.length)
    await fs.writeJson(OUT_FILE, fieldDatas, { spaces: '\t' })
    console.log('createFieldLayerMetaDataFromFiles - END')
}
init()