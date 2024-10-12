const fs = require('fs')
const path = require('path')

const FIELD_FOLDER = path.join(
  __dirname,
  '..',
  '..',
  'kujata-data',
  'data',
  'field',
  'flevel.lgp'
)

// field.data.script.dialogStrings.filter(s => s.includes('<fe>'))

const MATCH_STR = 'VARDECR'
const init = () => {
  const fields = fs.readdirSync(FIELD_FOLDER) //.filter(f => f === 'bugin1c.json')
  //   console.log('fields', fields)
  for (const fieldFile of fields) {
    try {
      const field = JSON.parse(
        fs.readFileSync(path.join(FIELD_FOLDER, fieldFile))
      )

      if (field && field.script && field.script.dialogStrings) {
        const matches = field.script.dialogStrings
          .map((s, index) => (s.includes(MATCH_STR) ? index : -1))
          .filter(index => index !== -1)
        for (const match of matches) {
          console.log(
            fieldFile.replace('.json', ''),
            '-',
            MATCH_STR,
            '-',
            `Text: ${match}`,
            '-',
            field.script.dialogStrings[match]
          )
        }
      }
    } catch (error) {}
  }
}

init()
