// import * as THREE from '../../assets/threejs-r135-dg/build/three.module.js'
import { scene } from './battle-scene.js'
import { loadSceneModel } from '../data/scene-fetch-data.js'

const importModels = async (battleConfig) => {
  // TODO - Load these in parallel
  const locationModel = await loadSceneModel(battleConfig.setup.locationCode)
  console.log('battle locationModel', locationModel)
  battleConfig.models = {
    location: locationModel
  }

  scene.add(locationModel.scene)
  for (const enemy of battleConfig.enemies) {
    const enemyModel = await loadSceneModel(enemy.enemyCode)
    scene.add(enemyModel.scene)
    enemyModel.scene.position.x = enemy.position.x
    enemyModel.scene.position.y = enemy.position.y
    enemyModel.scene.position.z = enemy.position.z
    console.log('battle', 'enemy', enemyModel.scene)
  }
}

export { importModels }
