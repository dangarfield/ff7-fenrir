const {
  createOpCodesFieldProgressReadme
} = require('./create-op-codes-field-progress-readme.js')
const {
  createOpCodesBattleCameraProgressReadme
} = require('./create-op-codes-battle-camera-progress-readme.js')
const {
  createActionSequenceOpProgressReadme
} = require('./create-op-codes-action-sequence-progress-readme.js')

const init = async () => {
  await Promise.all([
    createOpCodesBattleCameraProgressReadme(),
    createOpCodesFieldProgressReadme(),
    createActionSequenceOpProgressReadme()
  ])
}
init()
