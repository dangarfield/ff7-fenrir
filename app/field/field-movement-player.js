import * as THREE from '../../assets/threejs-r135-dg/build/three.module.js'
import { getActiveInputs } from '../interaction/inputs.js'
import {
  setCameraPosition,
  calculateViewClippingPointFromVector3
} from './field-scene.js'
import {
  gatewayTriggered,
  triggerTriggered,
  modelCollisionTriggered
} from './field-actions.js'
import { updateCursorPositionHelpers } from './field-position-helpers.js'
import {
  updateSavemapLocationFieldPosition,
  updateSavemapLocationFieldLeader
} from '../data/savemap-alias.js'
import { getFieldTextures } from '../data/field-fetch-data.js'
import { getModelScaleDownValue } from './field-models.js'

const updateFieldPlayerMovement = delta => {
  // console.log('movementDirection', delta)
  // Get active player
  if (!window.currentField.playableCharacter) {
    removeSplash(window.currentField.playableCharacter)
    return
  }

  // console.log('updateFieldPlayerMovement', delta, winplayableCharacterCanMovedow.currentField.playableCharacterCanMove, window.currentField.playableCharacterIsInteracting)
  // Can player move?
  if (!window.currentField.playableCharacterCanMove) {
    removeSplash(window.currentField.playableCharacter)
    return
  }
  if (window.currentField.playableCharacterIsInteracting) {
    removeSplash(window.currentField.playableCharacter)
    return
  }

  let speed = (window.currentField.data.model.header.modelScale / 4400) * delta // run - Need to set these from the placed character model. Maybe these can be defaults?
  let animNo = 2 // run

  if (window.currentField.playableCharacter.userData.ladder) {
    removeSplash(window.currentField.playableCharacter)
    return ladderMovement(speed)
  }
  if (window.config.debug.runByDefault) {
    if (getActiveInputs().x) {
      // Adjust to walk
      speed = speed * 0.2
      animNo = 1
    }
  } else {
    if (!getActiveInputs().x) {
      // Adjust to walk
      speed = speed * 0.2
      animNo = 1
    }
  }

  // console.log('speed', speed, delta, animNo, window.currentField.playableCharacter.animations[animNo].name)
  // Find direction that player should be facing
  // let direction = ((256 - window.currentField.data.triggers.header.controlDirection) * 360 / 256) - 180 // Moved this to kujata-data
  let direction =
    window.currentField.data.triggers.header.controlDirectionDegrees
  // console.log('Direction', window.currentField.data.triggers.header.controlDirection, window.currentField.data.triggers.header.controlDirectionDegrees, direction)

  let shouldMove = true
  if (getActiveInputs().up && getActiveInputs().right) {
    direction += 45
  } else if (getActiveInputs().right && getActiveInputs().down) {
    direction += 135
  } else if (getActiveInputs().down && getActiveInputs().left) {
    direction += 225
  } else if (getActiveInputs().left && getActiveInputs().up) {
    direction += 315
  } else if (getActiveInputs().up) {
    direction += 0
  } else if (getActiveInputs().right) {
    direction += 90
  } else if (getActiveInputs().down) {
    direction += 180
  } else if (getActiveInputs().left) {
    direction += 270
  } else {
    shouldMove = false
  }

  if (!shouldMove) {
    // If no movement but window.animation - stop window.animation (stand)
    window.currentField.playableCharacter.mixer.stopAllAction()
    window.currentField.playableCharacter.mixer
      .clipAction(window.currentField.playableCharacter.animations[0])
      .play() // stand window.anim
    removeSplash(window.currentField.playableCharacter)
    return
  }

  // Deal with 'slippability'
  const RAY_HEIGHT = 0.1
  const SLIP_ANGLE_1 = 45
  const SLIP_ANGLE_2 = 70
  const directions = [
    direction,
    direction - SLIP_ANGLE_1,
    direction + SLIP_ANGLE_1,
    direction - SLIP_ANGLE_2,
    direction + SLIP_ANGLE_2
  ]
  let nextPosition
  let walkmeshFound = false
  let isSlipDirection = false
  const originalDirection = direction
  window.currentField.playableCharacter.scene.userData.originalDirection = originalDirection
  const originalDirectionRadians = THREE.Math.degToRad(originalDirection)
  const originalDirectionVector = new THREE.Vector3(
    Math.sin(originalDirectionRadians),
    Math.cos(originalDirectionRadians),
    0
  )
  const playerPositionOffset = window.currentField.playableCharacter.scene.position
    .clone()
    .addScaledVector(originalDirectionVector, 0.01)

  // console.log('movementDirection', originalDirection, originalDirectionRadians, originalDirectionVector, playerPositionOffset)
  for (let i = 0; i < directions.length; i++) {
    const potentialDirection = directions[i]
    // Set player in direction
    const directionRadians = THREE.Math.degToRad(potentialDirection)
    const directionVector = new THREE.Vector3(
      Math.sin(directionRadians),
      Math.cos(directionRadians),
      0
    )
    nextPosition = window.currentField.playableCharacter.scene.position
      .clone()
      .addScaledVector(directionVector, speed)
    const nextPositionForRaycast = playerPositionOffset
      .clone()
      .addScaledVector(directionVector, speed)
    window.currentField.playableCharacter.scene.children[0].rotation.y = THREE.Math.degToRad(
      180 - potentialDirection
    )

    // Adjust for climbing slopes and walking off walkmesh
    // Create a ray at next position (higher z, but pointing down) to find correct z position
    // TODO - Need to deal with transitioning from a non-adjacent triangle, eg, just to different areas
    const playerMovementRay = new THREE.Raycaster()

    const rayO = new THREE.Vector3(
      nextPositionForRaycast.x,
      nextPositionForRaycast.y,
      nextPositionForRaycast.z + RAY_HEIGHT
    )
    const rayD = new THREE.Vector3(0, 0, -1).normalize()
    playerMovementRay.set(rayO, rayD)
    playerMovementRay.far = RAY_HEIGHT * 2
    const intersects = playerMovementRay.intersectObjects(
      window.currentField.walkmeshMesh.children
    )
    // console.log('ray intersects', nextPosition, rayO, rayD, intersects)
    if (window.config.debug.showMovementHelpers) {
      window.currentField.movementHelpers.add(
        new THREE.ArrowHelper(
          playerMovementRay.ray.direction,
          playerMovementRay.ray.origin,
          playerMovementRay.far,
          0xfff00ff
        )
      ) // For debugging walkmesh raycaster
    }
    if (intersects.length === 0) {
      // Player is off walkmap
      continue
    } else if (!intersects[0].object.userData.movementAllowed) {
      // Triangle locked through IDLCK
      continue
    } else {
      const intersect = getNextPositionRaycast(nextPosition)
      if (!intersect) {
        continue
      }
      const currentTriangleId =
        window.currentField.playableCharacter.scene.userData.triangleId
      const nextTriangleId = intersect.object.userData.triangleId
      const nextTriangleMovementAllowed =
        currentTriangleId === nextTriangleId
          ? true
          : window.currentField.data.walkmeshSection.accessors[
            nextTriangleId
          ].includes(currentTriangleId)
      console.log(
        'playerMovement nextTriangle',
        intersects,
        currentTriangleId,
        nextTriangleId,
        nextTriangleMovementAllowed
      )
      if (!nextTriangleMovementAllowed && currentTriangleId !== undefined) {
        console.log('playerMovement nextTriangle STOP') // Sometimes this isn't right in there are really thin triangles - convil_1
        continue
      }

      walkmeshFound = true
      if (i >= 1) {
        isSlipDirection = true
      }
      console.log('playerMovement nextTriangle CONTINUE')
      nextPosition.z = intersect.point.z
      window.currentField.playableCharacter.scene.userData.triangleId = nextTriangleId
      updateSavemapLocationFieldPosition(
        Math.round(nextPosition.x * 4096),
        Math.round(nextPosition.y * 4096),
        window.currentField.playableCharacter.scene.userData.triangleId,
        direction -
          window.currentField.data.triggers.header.controlDirectionDegrees
      )
      updateSavemapLocationFieldLeader(
        window.currentField.playableCharacter.userData.characterName
      )
      // console.log('asd player movement', window.currentField.playableCharacter.scene.position, nextPosition, intersects[0].object.userData.triangleId, directionVector, speed)

      break
    }
  }

  if (!walkmeshFound) {
    // console.log('asd no walkmesh found')
    window.currentField.playableCharacter.scene.children[0].rotation.y = THREE.Math.degToRad(
      180 - originalDirection
    )
    window.currentField.playableCharacter.mixer.stopAllAction()
    removeSplash(window.currentField.playableCharacter)
    return
  }

  // Detect triggers
  for (let i = 0; i < window.currentField.triggerLines.children.length; i++) {
    const triggerLine = window.currentField.triggerLines.children[i]
    const linePos = triggerLine.geometry.getAttribute('position')
    const closestPointOnLine = new THREE.Line3(
      { x: linePos.getX(0), y: linePos.getY(0), z: linePos.getZ(0) },
      { x: linePos.getX(1), y: linePos.getY(1), z: linePos.getZ(1) }
    ).closestPointToPoint(nextPosition, true, new THREE.Vector3())
    const distance = nextPosition.distanceTo(closestPointOnLine)
    if (distance < 0.01) {
      if (triggerLine.userData.triggered === false) {
        triggerLine.userData.triggered = true
        triggerTriggered(i, true)
      }
    } else {
      if (triggerLine.userData.triggered === true) {
        triggerLine.userData.triggered = false
        triggerTriggered(i, false)
      }
    }
  }
  // Move line triggers to render loop
  window.currentField.playableCharacter.scene.userData.isSlipDirection = isSlipDirection
  for (let i = 0; i < window.currentField.lineLines.children.length; i++) {
    const line = window.currentField.lineLines.children[i]
    if (
      line.userData.enabled &&
      line.userData.playerClose &&
      window.currentField.playableCharacter.scene.userData.isSlipDirection &&
      !line.userData.slippabilityEnabled
    ) {
      window.currentField.playableCharacter.scene.children[0].rotation.y = THREE.Math.degToRad(
        180 -
          window.currentField.playableCharacter.scene.userData.originalDirection
      )
      window.currentField.playableCharacter.mixer.stopAllAction()
      removeSplash(window.currentField.playableCharacter)
      return
    }
  }

  // Detect model collisions
  // Can probably filter out models that haven't been placed onto the scene
  for (let i = 0; i < window.currentField.models.length; i++) {
    const fieldModel = window.currentField.models[i]

    if (fieldModel === window.currentField.playableCharacter) {
      continue
    }
    if (
      fieldModel.scene.position.x === 0 &&
      fieldModel.scene.position.y === 0 &&
      fieldModel.scene.position.z === 0
    ) {
      // Temporary until we place models properly, playable chars are dropped at 0,0,0
      continue
    }
    if (fieldModel.visible === false) {
      continue
    }
    if (!fieldModel.userData.collisionEnabled) {
      continue
    }
    const distance = nextPosition.distanceTo(fieldModel.scene.position)

    // Need to check distances aren't set from op codes, and solidMode is enabled etc
    // Big assumption, radial and uniform distances will work, rather than bounding box based collisions
    // console.log('closeToTalk', fieldModel.scene.userData, fieldModel.userData.talkRadius, fieldModel.userData.talkRadius / 4096 * 1.3, distance)

    // TODO: I think this is actually implemented using a box around the player as well a a default collisionRadius
    // For the time being, lets just set a min value that roughly approximates the default model sizes
    const cutoff = Math.max(
      0.009765625,
      (fieldModel.userData.collisionRadius / 4096) * 1.0
    ) // Seems to be 1.3, but in ealin_2, needs to be higher
    const closeToCollide = distance < cutoff
    console.log(
      `Collision distance ${fieldModel.userData.entityName}`,
      fieldModel.userData,
      fieldModel.scene.userData,
      i,
      distance,
      cutoff,
      closeToCollide
    )

    // Note: Talk is now controlled from field-action.js
    if (closeToCollide) {
      // Set based on collisionRadius
      if (
        fieldModel.scene.userData.closeToCollide === false &&
        fieldModel.userData.collisionEnabled
      ) {
        fieldModel.scene.userData.closeToCollide = true
        console.log(
          'Close to collide',
          i,
          fieldModel.scene.userData.closeToCollide,
          fieldModel.userData
        )
        modelCollisionTriggered(i, fieldModel)
      }
      // Stop movement
      window.currentField.playableCharacter.mixer.stopAllAction()
      console.log(
        'playerMovement TOO CLOSE TO ENTITY',
        distance,
        fieldModel.scene.userData
      )

      // Add a directional check so that a player can move away from the entity if placed next / on an entity
      const nextDir = new THREE.Vector3()
        .subVectors(
          window.currentField.playableCharacter.scene.position,
          nextPosition
        )
        .normalize()
      const entityDir = new THREE.Vector3()
        .subVectors(
          window.currentField.playableCharacter.scene.position,
          fieldModel.scene.position
        )
        .normalize()
      const directionDiff = nextDir.distanceTo(entityDir)
      // This can probably be done in a better mathematical way
      // console.log('playerMovement CLOSE DIRECTION player', window.currentField.playableCharacter.scene.position)
      // console.log('playerMovement CLOSE DIRECTION next', nextPosition)
      // console.log('playerMovement CLOSE DIRECTION entity', fieldModel.userData, fieldModel.scene.userData, distance, fieldModel.scene.position)
      // console.log('playerMovement CLOSE DIRECTION next dir', nextDir)
      // console.log('playerMovement CLOSE DIRECTION entity dir', entityDir)
      // console.log('playerMovement CLOSE DIRECTION next to entity dir diff', directionDiff)
      if (directionDiff < 1) {
        removeSplash(window.currentField.playableCharacter)
        return
      }
    } else {
      if (fieldModel.scene.userData.closeToCollide === true) {
        // Is this needed to keep collision state??
        fieldModel.scene.userData.closeToCollide = false
        // console.log('Close to collide', i, fieldModel.scene.userData.closeToCollide, fieldModel.userData)
      }
    }
  }

  // Detect gateways
  if (window.currentField.gatewayTriggersEnabled) {
    // TODO - Last bit for three.js 135 migration
    for (let i = 0; i < window.currentField.gatewayLines.children.length; i++) {
      const gatewayLine = window.currentField.gatewayLines.children[i]
      const linePos = gatewayLine.geometry.getAttribute('position')
      const closestPointOnLine = new THREE.Line3(
        { x: linePos.getX(0), y: linePos.getY(0), z: linePos.getZ(0) },
        { x: linePos.getX(1), y: linePos.getY(1), z: linePos.getZ(1) }
      ).closestPointToPoint(nextPosition, true, new THREE.Vector3())
      const distance = nextPosition.distanceTo(closestPointOnLine)
      if (distance < 0.005) {
        console.log('gateway hit')
        if (animNo === 2) {
          // Run
          window.currentField.playableCharacter.mixer.clipAction(
            window.currentField.playableCharacter.animations[2]
          ).paused = true
        } else if (animNo === 1) {
          // Walk
          window.currentField.playableCharacter.mixer.clipAction(
            window.currentField.playableCharacter.animations[1]
          ).paused = true
        }
        // Should probably also pause ALL animations including screen background loops like in the game
        gatewayTriggered(i)
        removeSplash(window.currentField.playableCharacter)
        return
      }
    }
  }

  // If walk/run is toggled, stop the existing window.animation
  if (animNo === 2) {
    // Run
    window.currentField.playableCharacter.mixer
      .clipAction(window.currentField.playableCharacter.animations[window.currentField.playerAnimations.stand])
      .stop() // Probably a more efficient way to change these animations
    window.currentField.playableCharacter.mixer
      .clipAction(window.currentField.playableCharacter.animations[window.currentField.playerAnimations.walk])
      .stop()
    window.currentField.playableCharacter.mixer
      .clipAction(window.currentField.playableCharacter.animations[window.currentField.playerAnimations.run])
      .play()
  } else if (animNo === 1) {
    // Walk
    window.currentField.playableCharacter.mixer
      .clipAction(window.currentField.playableCharacter.animations[window.currentField.playerAnimations.stand])
      .stop()
    window.currentField.playableCharacter.mixer
      .clipAction(window.currentField.playableCharacter.animations[window.currentField.playerAnimations.run])
      .stop()
    window.currentField.playableCharacter.mixer
      .clipAction(window.currentField.playableCharacter.animations[window.currentField.playerAnimations.walk])
      .play()
  }

  // There is movement, set next position
  window.currentField.playableCharacter.scene.position.x = nextPosition.x
  window.currentField.playableCharacter.scene.position.y = nextPosition.y
  window.currentField.playableCharacter.scene.position.z = nextPosition.z

  applySplash(window.currentField.playableCharacter)
  // Update camera position if camera is following user
  console.log(
    'setCameraPosition player movement',
    window.currentField.fieldCameraFollowPlayer,
    window.currentField.isScrolling
  )
  if (
    window.currentField.fieldCameraFollowPlayer &&
    !window.currentField.isScrolling
  ) {
    // Adjust the camera offset to centre on character
    const relativeToCamera = calculateViewClippingPointFromVector3(nextPosition)
    // console.log('window.currentField.playableCharacter relativeToCamera', relativeToCamera)
    console.log(
      'setCameraPosition player movement',
      relativeToCamera.x,
      relativeToCamera.y
    )
    setCameraPosition(relativeToCamera.x, relativeToCamera.y)
  }

  // Maybe should change this to distance to the normal of the camera position -> camera target line ?
  // Looks ok so far, but there are a few maps with clipping that should therefore switch
  // to an orthogonal camera
  const camDistance = window.currentField.playableCharacter.scene.position.distanceTo(
    window.currentField.fieldCamera.position
  )
  // console.log(
  //     'Distance from camera',
  //     camDistance,
  //     camDistance * 1000)

  updateCursorPositionHelpers()
}
function setPointOfIntersection (pointsOfIntersection, line, plane) {
  let pointOfIntersection = plane.intersectLine(
    line,
    new THREE.Vector3()
  )
  const dgMatch = ((line.start.z > -plane.constant) && (-plane.constant > line.end.z)) ||
  ((line.end.z > -plane.constant) && (-plane.constant > line.start.z))
  if (dgMatch) {
    pointOfIntersection = line.start
    const diff = line.start.z - -plane.constant
    const dist = line.start.z - line.end.z
    const diffFactor = diff / dist
    pointOfIntersection = new THREE.Vector3().lerpVectors(line.start, line.end, diffFactor)
    console.log('applySplash pointOfIntersection', pointOfIntersection, line.start.z, line.end.z, -plane.constant, dgMatch, 'diff', dist, diff, diffFactor)
  }

  // const rounded = roundVector(2, pointOfIntersection)
  if (pointOfIntersection) {
    pointsOfIntersection.push(pointOfIntersection.clone())
    console.log('applySplash INTERSECTION!', line, plane)
  }
}
const randomRange = (min, max) => {
  return ~~(Math.random() * (max - min + 1)) + min
}

const applySplash = (model) => {
  // TODO - This doesn't seem very fast, as in, the sprite seems to follow after the movement, need to improve but can't see any update callbacks for animation
  if (model.scene.userData.splash) {
  // During movement, see if the plane intersects any of the faces of the model's meshes and get the closest point of intersection to the camera
    console.log('applySplash START')
    for (let i = 0; i < model.scene.userData.splashSprites.length; i++) {
      const splashSprite = model.scene.userData.splashSprites[i]
      splashSprite.parent.remove(splashSprite)
    }
    model.scene.userData.splashSprites = []

    const pointsOfIntersection = []

    const a = new THREE.Vector3()
    const b = new THREE.Vector3()
    const c = new THREE.Vector3()
    let lineAB = new THREE.Line3()
    let lineBC = new THREE.Line3()
    let lineCA = new THREE.Line3()

    model.scene.traverse(el => {
      if (el.isMesh) { // && el.name.includes('r_hand')) {
        const meshPointsOfIntersection = []
        for (let i = 0; i < el.geometry.index.count; i += 3) {
          el.localToWorld(
            a.copy(
              new THREE.Vector3().fromBufferAttribute(
                el.geometry.attributes.position,
                el.geometry.index.array[i]
              )
            ).add(new THREE.Vector3(0, 0, 0.1))
          )
          el.localToWorld(
            b.copy(
              new THREE.Vector3().fromBufferAttribute(
                el.geometry.attributes.position,
                el.geometry.index.array[i + 1]
              )
            )
          )
          el.localToWorld(
            c.copy(
              new THREE.Vector3().fromBufferAttribute(
                el.geometry.attributes.position,
                el.geometry.index.array[i + 2]
              )
            )
          )

          lineAB = new THREE.Line3(a, b)
          lineBC = new THREE.Line3(b, c)
          lineCA = new THREE.Line3(c, a)
          setPointOfIntersection(meshPointsOfIntersection, lineAB, model.scene.userData.splashPlane)
          setPointOfIntersection(meshPointsOfIntersection, lineBC, model.scene.userData.splashPlane)
          setPointOfIntersection(meshPointsOfIntersection, lineCA, model.scene.userData.splashPlane)
          // if (el.name.includes('r_hand')) {
          //   const material = new THREE.LineBasicMaterial({ color: 0x0000ff })
          //   const points = []
          //   points.push(a)
          //   points.push(b)
          //   points.push(c)
          //   const geometry = new THREE.BufferGeometry().setFromPoints(points)
          //   const line = new THREE.Line(geometry, material)
          //   window.currentField.fieldScene.add(line)
          //   // console.log('applySplash', el.name, a, b, c, pointsOfIntersection)
          // }
        }

        if (meshPointsOfIntersection.length > 0) {
          const pointDist = meshPointsOfIntersection.map(v => ({ v, d: v.distanceToSquared(window.currentField.fieldCamera.position) }))
          pointDist.sort((a, b) => a.d - b.d)
          console.log('applySplash meshPointsOfIntersection', pointDist)
          pointsOfIntersection.push(pointDist[0].v) // TODO - Attenuate points so that they are all a fixed distance from camera, eg 0.1 away from model
        }
      }
    })

    // const pointsMaterial = new THREE.PointsMaterial({
    //   size: 0.001,
    //   color: 0xffff00
    // })
    // const points = new THREE.Points(
    //   new THREE.BufferGeometry().setFromPoints(pointsOfIntersection),
    //   pointsMaterial
    // )
    // window.currentField.fieldScene.add(points)

    const scaleDownValue = 10 * getModelScaleDownValue()
    const imageId = randomRange(0, 3)
    const splashMaterial = model.scene.userData.splashMaterials[imageId]
    for (let i = 0; i < pointsOfIntersection.length; i++) {
      const pointOfIntersection = pointsOfIntersection[i]
      const sprite = new THREE.Sprite(splashMaterial)
      sprite.userData.type = 'animated'
      // sprite.userData.textures = spriteTextures
      sprite.userData.index = 0
      sprite.userData.frameCount = 0
      // Not able to get the scale of the arrows sprites right at this point
      sprite.position.set(
        pointOfIntersection.x,
        pointOfIntersection.y,
        pointOfIntersection.z
      )
      // console.log('scale', sprite.getWorldScale(new THREE.Vector3()))
      // console.log('sprite', sprite)
      sprite.scale.set(scaleDownValue, scaleDownValue, scaleDownValue)
      window.currentField.fieldScene.add(sprite)
      model.scene.userData.splashSprites.push(sprite)
    }
    // if (pointsVertices.length > 0) {
    //   model.scene.userData.splashPoints.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pointsVertices, 3))
    //   model.scene.userData.splashPoints.geometry.attributes.position.needsUpdate = true
    // }

    // const intersectPoint = new THREE.Vector3()
    // const splashIntersect = model.scene.userData.splashPlane.intersectsBox(box, intersectPoint)
    // console.log('applySplash END', splashIntersect, intersectPoint, box.intersectsPlane(model.scene.userData.splashPlane), model.scene.userData.splashPlane, box)
    console.log('applySplash END')
    // Show the splash image (rotate each of them)

    // const z = model.scene.position.z * 4096
    // if (z >= 0) {
    //   removeSplash(model)
    // } else {
    //   console.log('applySplash', z)
    // }
  }
}
const removeSplash = (model) => {
  if (model && model.scene && model.scene.userData.splash) {
    // console.log('removeSplash')
    for (let i = 0; i < model.scene.userData.splashSprites.length; i++) {
      const splashSprite = model.scene.userData.splashSprites[i]
      splashSprite.parent.remove(splashSprite)
    }
    model.scene.userData.splashSprites = []
  }
}
const getNextPositionRaycast = nextPosition => {
  const rayOffset = 0.05
  const movementRay = new THREE.Raycaster()
  const rayO = new THREE.Vector3(
    nextPosition.x,
    nextPosition.y,
    nextPosition.z + rayOffset
  )
  const rayD = new THREE.Vector3(0, 0, -1).normalize()
  movementRay.set(rayO, rayD)
  movementRay.far = rayOffset * 2
  const intersects = movementRay.intersectObjects(
    window.currentField.walkmeshMesh.children
  )

  // Sort by closest Z to nextPosition.z
  for (let i = 0; i < intersects.length; i++) {
    const intersect = intersects[i]
    intersect.distanceZ = Math.abs(intersect.distance - rayOffset)
  }
  intersects.sort((a, b) => a.distanceZ - b.distanceZ)
  // console.log('getNextPositionRaycast', nextPosition.z, intersects)

  if (intersects.length === 0) {
    return null
  } else if (!intersects[0].object.userData.movementAllowed) {
    return null
  } else {
    return intersects[0]
  }
}

const ladderMovement = speed => {
  const model = window.currentField.playableCharacter
  const ladder = model.userData.ladder

  const movementForwards = getActiveInputs()[ladder.keysForwards]
  const movementBackwards = getActiveInputs()[ladder.keysBackwards]

  model.mixer.clipAction(model.animations[ladder.animationId]).play()

  if (!movementForwards && !movementBackwards) {
    model.mixer.clipAction(model.animations[ladder.animationId]).paused = true
    return
  }

  const forwardsVector = new THREE.Vector3(
    ladder.to.x,
    ladder.to.y,
    ladder.to.z
  )
  const backwardsVector = new THREE.Vector3(
    ladder.from.x,
    ladder.from.y,
    ladder.from.z
  )
  let targetVector
  let timeScale
  if (movementForwards) {
    targetVector = forwardsVector
    timeScale = ladder.speed
  } else if (movementBackwards) {
    targetVector = backwardsVector
    timeScale = -ladder.speed
  }

  // Control animation
  model.mixer.clipAction(model.animations[ladder.animationId]).paused = false
  model.mixer.clipAction(
    model.animations[ladder.animationId]
  ).timeScale = timeScale

  // Get next position
  const directionVector = new THREE.Vector3()
  directionVector.subVectors(targetVector, model.scene.position)
  directionVector.normalize()

  // TODO - Deal with axis based rotation for non-vertical ladders

  const nextPosition = model.scene.position
    .clone()
    .addScaledVector(directionVector, speed * 0.3)

  // Set next position
  model.scene.position.x = nextPosition.x
  model.scene.position.y = nextPosition.y
  model.scene.position.z = nextPosition.z

  // Update camera position
  const relativeToCamera = calculateViewClippingPointFromVector3(nextPosition)
  console.log('setCameraPosition ladder movement')
  setCameraPosition(relativeToCamera.x, relativeToCamera.y)

  // Check for arrival
  const distanceToTarget = model.scene.position.distanceTo(targetVector)
  const distanceToOrigin = model.scene.position.distanceTo(backwardsVector)
  if (ladder.atStart) {
    if (distanceToOrigin > 0.001) {
      delete ladder.atStart
    }
  }
  // console.log('ladderMovement', movementForwards, movementBackwards, distanceToTarget, ladder.atStart, distanceToOrigin, movementBackwards !== ladder.atStart, model.scene.userData.triangleId)
  if (distanceToTarget <= 0.005 || (movementBackwards && ladder.atStart)) {
    model.mixer.stopAllAction()

    model.scene.children[0].rotation.x = THREE.Math.degToRad(90)
    model.scene.children[0].rotation.z = THREE.Math.degToRad(0)
    model.scene.up.set(0, 0, 1)

    for (let i = 0; i < window.currentField.gatewayLines.children.length; i++) {
      const gatewayLine = window.currentField.gatewayLines.children[i]
      const linePos = gatewayLine.geometry.getAttribute('position')
      const closestPointOnLine = new THREE.Line3(
        { x: linePos.getX(0), y: linePos.getY(0), z: linePos.getZ(0) },
        { x: linePos.getX(1), y: linePos.getY(1), z: linePos.getZ(1) }
      ).closestPointToPoint(nextPosition, true, new THREE.Vector3())
      const distance = nextPosition.distanceTo(closestPointOnLine)
      if (distance < 0.005) {
        console.log('gateway hit')
        if (animNo === 2) {
        // Run
          window.currentField.playableCharacter.mixer.clipAction(
            window.currentField.playableCharacter.animations[2]
          ).paused = true
        } else if (animNo === 1) {
        // Walk
          window.currentField.playableCharacter.mixer.clipAction(
            window.currentField.playableCharacter.animations[1]
          ).paused = true
        }
        // Should probably also pause ALL animations including screen background loops like in the game
        gatewayTriggered(i)
        return
      }
    }

    console.log(
      'ladderMovement: currentTriangle BEFORE',
      model.scene.userData.triangleId
    )
    updateCurrentTriangleId(model, nextPosition)
    console.log(
      'ladderMovement: currentTriangle AFTER',
      model.scene.userData.triangleId
    )

    ladder.resolve()
  }
  updateCursorPositionHelpers()
}

const updateCurrentTriangleId = (model, nextPosition) => {
  const playerMovementRay = new THREE.Raycaster()
  const rayO = new THREE.Vector3(
    nextPosition.x,
    nextPosition.y,
    nextPosition.z + 0.01
  )
  const rayD = new THREE.Vector3(0, 0, -1).normalize()
  playerMovementRay.set(rayO, rayD)
  playerMovementRay.far = 0.02
  const intersects = playerMovementRay.intersectObjects(
    window.currentField.walkmeshMesh.children
  )
  console.log(
    'updateCurrentTriangleId',
    nextPosition,
    nextPosition,
    rayD,
    intersects
  )
  if (window.config.debug.showMovementHelpers) {
    window.currentField.movementHelpers.add(
      new THREE.ArrowHelper(
        playerMovementRay.ray.direction,
        playerMovementRay.ray.origin,
        playerMovementRay.far,
        0xfff00ff
      )
    ) // For debugging walkmesh raycaster
  }
  if (intersects.length === 0) {
    const closestTriangle = getClosestTriangleId(model, nextPosition)
    console.log(
      'ladderMovement: updateCurrentTriangleId NO INTERSECT',
      intersects,
      closestTriangle
    )
    model.scene.userData.triangleId = closestTriangle
  } else {
    // const point = intersects[0].point
    model.scene.userData.triangleId = intersects[0].object.userData.triangleId
  }
  if (
    window.currentField.playableCharacter &&
    window.currentField.playableCharacter.userData
  ) {
    console.log(
      'updateCurrentTriangleId is playablechar',
      model.userData.name,
      window.currentField.playableCharacter.userData.name,
      model.scene.uuid === window.currentField.playableCharacter.scene.uuid
    )
    if (model.scene.uuid === window.currentField.playableCharacter.scene.uuid) {
      // This should be the active character
      updateSavemapLocationFieldPosition(
        Math.round(nextPosition.x * 4096),
        Math.round(nextPosition.y * 4096),
        window.currentField.playableCharacter.scene.userData.triangleId,
        0
      ) // Direction is inaccurate
    }
  }
}
const getClosestTriangleId = (model, position) => {
  const triangles = window.currentField.data.walkmeshSection.triangles
  const closest = {
    distance: 100000,
    triangleId: -1
  }
  for (let i = 0; i < triangles.length; i++) {
    const triangle = triangles[i]
    for (let j = 0; j < triangle.vertices.length; j++) {
      const vertice = triangle.vertices[j]
      const vec = new THREE.Vector3(
        vertice.x / 4096,
        vertice.y / 4096,
        vertice.z / 4096
      )
      const distance = vec.distanceTo(model.scene.position)
      if (distance < closest.distance) {
        closest.distance = distance
        closest.triangleId = i
      }
    }
  }
  return closest.triangleId
}
export {
  updateFieldPlayerMovement,
  updateCurrentTriangleId,
  getNextPositionRaycast,
  applySplash,
  removeSplash
}
