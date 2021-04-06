const fs = require('fs-extra')
const path = require('path')

const FIELDS_FOLDER = './kujata-data/data/field/flevel.lgp'
const OUTPUT_FILE = './workings-out/output/line-occurences.json'

const init = async () => {
  console.log('LINE op code usage: START')
  const fields = await fs.readdir(FIELDS_FOLDER)
  let datas = []
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i]
    console.log('field', field)
    const f = await fs.readJson(path.join(FIELDS_FOLDER, field))
    // console.log('f', f)
    if (f && f.script && f.script.entities) {
      for (let j = 0; j < f.script.entities.length; j++) {
        const entity = f.script.entities[j]
        const entityName = entity.entityName
        let data = {
          line: 0,
          ok: 0,
          okOps: 0,
          move1: 0,
          move1Ops: 0,
          move2: 0,
          move2Ops: 0,
          moveBothPresent: false,
          moveBothActive: false,
          go: 0,
          goOps: 0,
          go1x: 0,
          go1xOps: 0,
          goAway: 0,
          goAwayOps: 0,
          goGo1xActive: false,
          goGoAwayActive: false,
          go1xGoAwayActive: false,
          goAllActive: false,
          field,
          entity: entityName
        }
        for (let k = 0; k < entity.scripts.length; k++) {
          const script = entity.scripts[k]
          if (script.scriptType === '[OK]') {
            data.ok++
            data.okOps = script.ops.length
          }
          if (script.scriptType === 'Move' && script.index === 2) {
            data.move1++
            data.move1Ops = script.ops.length
          }
          if (script.scriptType === 'Move' && script.index === 3) {
            data.move2++
            data.move2Ops = script.ops.length
          }
          if (script.scriptType === 'Go') {
            data.go++
            data.goOps = script.ops.length
          }
          if (script.scriptType === 'Go 1x') {
            data.go1x++
            data.go1xOps = script.ops.length
          }
          if (script.scriptType === 'Go away') {
            data.goAway++
            data.goAwayOps = script.ops.length
          }

          for (let l = 0; l < script.ops.length; l++) {
            const op = script.ops[l]
            if (op.op === 'LINE') {
              data.line++
            }
          }
        }
        if (data.move1Ops > 0 && data.move2Ops > 0) {
          data.moveBothPresent = true
        }
        if (data.move1Ops > 1 && data.move2Ops > 1) {
          data.moveBothActive = true
        }

        if (data.goOps > 1 && data.go1xOps > 1) {
          data.goGo1xActive = true
        }
        if (data.goOps > 1 && data.goAwayOps > 1) {
          data.goGoAwayActive = true
        }
        if (data.go1xOps > 1 && data.goAwayOps > 1) {
          data.go1xGoAwayActive = true
        }
        if (data.goOps > 1 && data.go1xOps > 1 && data.goAwayOps > 1) {
          data.goAllActive = true
        }

        if (data.line > 0) {
          datas.push(data)
        }

        // console.log('data', field, entityName, data)
      }
    }
  }
  let dataString = '[\n'
  for (let i = 0; i < datas.length; i++) {
    const data = datas[i]
    dataString += `{ "line": ${data.line}, "okOps": ${data.okOps}, "move1Ops": ${data.move1Ops}, "move2Ops": ${data.move2Ops}, "moveBothPresent": ${data.moveBothPresent}, "moveBothActive": ${data.moveBothActive}, "goOps": ${data.goOps}, "go1xOps": ${data.go1xOps}, "goAwayOps": ${data.goAwayOps}, "goGo1xActive": ${data.goGo1xActive}, "goGoAwayActive": ${data.goGoAwayActive}, "go1xGoAwayActive": ${data.go1xGoAwayActive}, "goAllActive": ${data.goAllActive}, "field": "${data.field}", "entity": "${data.entity}" },\n`
  }
  dataString += '\n]'
  await fs.writeFile(OUTPUT_FILE, dataString)

  console.log('LINE op code usage: END')
}
init()
