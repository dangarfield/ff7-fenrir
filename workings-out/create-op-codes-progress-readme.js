const {
  createOpCodesFieldProgressReadme
} = require('./create-op-codes-field-progress-readme.js')
const {
  createOpCodesBattleCameraProgressReadme
} = require('./create-op-codes-battle-camera-progress-readme.js')

const init = () => {
  createOpCodesBattleCameraProgressReadme()
  createOpCodesFieldProgressReadme()
}
init()
