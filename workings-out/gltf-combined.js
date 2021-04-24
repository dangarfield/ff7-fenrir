const fs = require('fs-extra')

const init = () => {
  const modelGLTF = fs.readJsonSync(
    'D:/code/ff7/ff7-fenrir/kujata-data/data/field/char.lgp/aaaa.hrc.gltf'
  )
  const animGLTF = fs.readJsonSync(
    'D:/code/ff7/ff7-fenrir/kujata-data/data/field/char.lgp/efjd.a.gltf'
  )
  var gltf1 = JSON.parse(JSON.stringify(modelGLTF)) // clone
  var gltf2 = JSON.parse(JSON.stringify(animGLTF)) // clone
  var numModelBuffers = gltf1.buffers.length
  var numModelBufferViews = gltf1.bufferViews.length
  var numModelAccessors = gltf1.accessors.length
  if (!gltf1.animations) {
    gltf1.animations = []
  }
  for (let buffer of gltf2.buffers) {
    gltf1.buffers.push(buffer)
  }
  for (let bufferView of gltf2.bufferViews) {
    bufferView.buffer += numModelBuffers
    gltf1.bufferViews.push(bufferView)
  }
  for (let accessor of gltf2.accessors) {
    accessor.bufferView += numModelBufferViews
    gltf1.accessors.push(accessor)
  }
  for (let animation of gltf2.animations) {
    for (let sampler of animation.samplers) {
      sampler.input += numModelAccessors
      sampler.output += numModelAccessors
    }
    gltf1.animations.push(animation)
  }
  console.log('combinedGLTF:', gltf1)
  fs.writeJsonSync(
    'D:/code/ff7/ff7-fenrir/kujata-data/data/field/char.lgp/test.gltf',
    gltf1
  )
}
init()
