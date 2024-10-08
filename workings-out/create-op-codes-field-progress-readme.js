const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')

const OPS_FOLDER = path.join(__dirname, '..', '..', 'kujata-data', 'metadata')
const OPS_README = path.join(__dirname, '..', 'OPS_CODES_FIELD_README.md')
const OPS_COMPLETED = path.join(
  __dirname,
  '..',
  'workings-out',
  'op-codes-completed.json'
)

const getCategories = async () => {
  return fs.readJson(path.join(OPS_FOLDER, 'op-categories.json'))
}
const getMetadata = async () => {
  return fs.readJson(path.join(OPS_FOLDER, 'op-metadata.json'))
}
const getOpUsage = async opCode => {
  const usagePath = path.join(OPS_FOLDER, 'op-code-usages', `${opCode}.json`)
  if (fs.existsSync(usagePath)) {
    return fs.readJson(usagePath)
  } else {
    return []
  }
}
const getCompletedOpCodes = async () => {
  const completedCodes = []
  const files = [
    'flow',
    'control',
    'assign',
    'window',
    'party',
    'models',
    'background',
    'camera-media',
    'misc'
  ]
  for (let j = 0; j < files.length; j++) {
    const file = files[j]
    let c = fs.readFileSync(`./app/field/field-op-codes-${file}.js`).toString()
    if (c.includes('export {')) {
      c = c.split('export {')
      c = c[1].replace('}', '').split(',')
      for (let i = 0; i < c.length; i++) {
        let name = c[i].trim()
        name = name.replace('TWO_', '2')
        name = name.replace('_', '!')
        completedCodes.push(name)
      }
    }
  }
  await fs.writeJson(OPS_COMPLETED, completedCodes)
  // console.log('completedCodes', completedCodes)
  return completedCodes
}
const generateCategoryData = async () => {
  let categories = await getCategories()
  let metadata = await getMetadata()
  let completedOpCodes = await getCompletedOpCodes()
  let totalComplete = 0
  let totalIncomplete = 0
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i]
    category.ops = []
    category.complete = 0
    category.incomplete = 0
    for (let j = 0; j < category.opCodes.length; j++) {
      const opCode = category.opCodes[j]
      const usage = await getOpUsage(opCode)
      const isComplete = completedOpCodes.includes(metadata[opCode].shortName)
      if (isComplete) {
        category.complete++
        totalComplete++
      } else {
        category.incomplete++
        totalIncomplete++
      }
      category.ops.push({
        code: opCode,
        name: metadata[opCode].shortName,
        description: metadata[opCode].description,
        usage: usage.length,
        isComplete: isComplete
      })
    }
  }
  // console.log('categories', JSON.stringify(categories))
  return { categories, totalComplete, totalIncomplete }
}
const createReadmeCell = op => {
  if (!op) {
    return ''
  } else {
    let color = 'green'
    let status = 'COMPLETE'
    if (!op.isComplete) {
      color = 'red'
      status = 'INCOMPLETE'
    }
    return `[![Generic badge](https://img.shields.io/badge/${
      op.name
    }-${status}-${color}.svg)](https://dangarfield.github.io/kujata-webapp/field-op-code-details/${
      op.code
    })<br>${op.description}<br>Usage - ${op.usage}<br>[${
      op.name
    } docs](http://wiki.ffrtt.ru/index.php?title=FF7/Field/Script/Opcodes/${op.code.toUpperCase()}_${op.name.toUpperCase()})`
  }
}
const renderReadme = async data => {
  const categories = data.categories
  let r = `# FF7 - Fenrir - Op Code Implementation Progress - ${Math.round(
    (100 * data.totalComplete) / (data.totalComplete + data.totalIncomplete)
  )}%\n`

  r = r + `\nNote: This page is autogenerated\n`
  r =
    r +
    `\nTotal progress: ${data.totalComplete} of ${
      data.totalComplete + data.totalIncomplete
    }\n`

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i]
    // console.log('category', category.name)
    r =
      r +
      `\n\n## ${category.name} - ${category.complete} of ${category.ops.length}\n`
    const opChunks = _.chunk(category.ops, 6)
    // console.log('opChunks', opChunks.length)
    r = r + `|  |  |  |  |  |  |\n`
    r = r + `|:---:|:---:|:---:|:---:|:---:|:---:|\n`
    for (let j = 0; j < opChunks.length; j++) {
      const opChunk = opChunks[j]
      // console.log('opChunk', opChunk)
      r =
        r +
        `| ${createReadmeCell(opChunk[0])} | ${createReadmeCell(
          opChunk[1]
        )} | ${createReadmeCell(opChunk[2])} | ${createReadmeCell(
          opChunk[3]
        )} | ${createReadmeCell(opChunk[4])} | ${createReadmeCell(
          opChunk[5]
        )} |\n`
    }
  }
  await fs.writeFile(OPS_README, r)
}
const createOpCodesFieldProgressReadme = async () => {
  console.log('create-op-codes-field-progress-readme: START')
  const data = await generateCategoryData()
  await renderReadme(data)
  console.log('create-op-codes-field-progress-readme: END')
}

module.exports = {
  createOpCodesFieldProgressReadme
}
