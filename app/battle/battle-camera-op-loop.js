const camData = {
  position: {
    x,
    y,
    z
  },
  target: {
    x,
    y,
    z
  }
}
window.battleCamData = camData

// https://forums.qhimm.com/index.php?topic=9126.msg124233#msg124233
// https://github.com/q-gears/q-gears-reversing-data/blob/master/reversing/ffvii/ffvii_battle/camera/camera_script_export_start.lua

const initialiseCameraData = () => {
  camData.position.x = 0
  camData.position.y = 0
  camData.position.z = 0
  camData.target.x = 0
  camData.target.y = 0
  camData.target.z = 0
}
const runScript = async () => {}
module.exports = {
  initialiseCameraData,
  runScript
}
