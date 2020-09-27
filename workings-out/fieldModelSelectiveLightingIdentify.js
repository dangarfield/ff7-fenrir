const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')

const FIELD_FOLDER = './kujata-data/data/field/flevel.lgp'
const OUT_FILE = path.join('workings-out', 'output', 'field-model-lighting.json')

const doesLightingMatch = (a, b) => {
    return JSON.stringify(a) === JSON.stringify(b)
}
const getlightingForModel = (model) => {
    return {
        globalLight: model.globalLight,
        light1: model.light1,
        light2: model.light2,
        light3: model.light3
    }
}
const init = async () => {
    console.log('fieldModelSelectiveLightingIdentify - START')
    let fieldNames = await fs.readJson(path.join(FIELD_FOLDER, 'maplist.json'))
    const nonMatchingFields = []
    const errorFields = []

    fieldLoop:
    for (let i = 0; i < fieldNames.length; i++) {
        const fieldName = fieldNames[i];

        try {
            const fieldJson = await fs.readJson(path.join(FIELD_FOLDER, `${fieldName}.json`))
            // console.log('fieldName', fieldName)
            const models = fieldJson.model.modelLoaders
            const baseLighting = getlightingForModel(models[0])
            for (let i = 0; i < models.length; i++) {
                const model = models[i]
                const lighting = getlightingForModel(model)
                if (!doesLightingMatch(baseLighting, lighting)) {
                    // console.log(fieldName, 'model', i, '-> ', 'NON MATCH', baseLighting, lighting)
                    nonMatchingFields.push(fieldName)
                    continue fieldLoop
                } else {
                    // console.log(fieldName, 'model', i, '-> ', 'match')
                }
            }
        } catch (error) {
            errorFields.push(fieldName)
        }
    }
    console.log('nonMatchingFields', nonMatchingFields, nonMatchingFields.length)
    console.log('errorFields', errorFields.length)
    const data = {
        nonMatchingFields,
        errorFields
    }
    await fs.writeJson(OUT_FILE, data, { spaces: '\t' })
    console.log('fieldModelSelectiveLightingIdentify - END')
}
init()