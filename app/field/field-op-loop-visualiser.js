import { createNanoEvents } from '../../assets/nanoevents.js'
let emitter

const LoopVisualiserIcons = {
  STOPPED: '■',
  FLOWSTOP: '◪',
  KILL: '◈',
  QUEUED: '◔'
}

const renderInitialState = data => {
  console.log('renderInitialState', data)

  let cumulativeTotal = 0
  const totalLines = data
    .map(d => d.scripts.length)
    .reduce((acc, s) => acc + s + 1, 0)
  // console.log('visualiser', data, data.length, totalLines)

  let html = '<div class="entities">'
  let entitiesCol1 = '<div class="entities-1">'
  let entitiesCol2 = '<div class="entities-2">'

  for (let i = 0; i < data.length; i++) {
    const entity = data[i]
    cumulativeTotal = cumulativeTotal + 1 + entity.scripts.length
    let html = `<div class="clearfix"></div><button type="button" class="btn btn-link btn-tiny">${i} - ${entity.name}</button>`
    for (let j = 0; j < entity.scripts.length; j++) {
      const script = entity.scripts[j]
      html += `
            <div class="btn-group d-flex" role="group">
                <button type="button" class="btn btn-secondary btn-tiny w-100">${script.script}</button>
                <button type="button" class="btn btn-dark btn-tiny w-100" id="op-${entity.id}-${script.script}-current"> </button>
                <button type="button" class="btn btn-dark btn-tiny w-100"><span id="op-${entity.id}-${script.script}-index">0</span> / ${script.count}</button>
            </div>`
    }
    // console.log('visualiser cumulative', totalLines, cumulativeTotal)
    if (cumulativeTotal <= totalLines / 2) {
      entitiesCol1 += html
    } else {
      entitiesCol2 += html
    }
  }
  entitiesCol1 += '</div>'
  entitiesCol2 += '</div>'
  html += entitiesCol1
  html += entitiesCol2
  html += '</div>'

  const existingVisualisers = document.getElementsByClassName(
    'field-op-loop-visualiser'
  )
  let isHidden = false
  while (existingVisualisers.length > 0) {
    isHidden = existingVisualisers[0].classList.contains('hide')
    existingVisualisers[0].parentNode.removeChild(existingVisualisers[0])
  }

  const container = document.createElement('div')
  container.className = 'field-op-loop-visualiser'
  if (isHidden) {
    container.classList.add('hide')
  }
  container.innerHTML = html
  container.onclick = function () {
    if (container.classList.contains('hide')) {
      container.classList.remove('hide')
    } else {
      container.classList.add('hide')
    }
  }
  document.body.appendChild(container)
}

const initOpLoopVisualiser = () => {
  const entities = window.currentField.data.script.entities
  const data = []
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i]
    const entityData = {
      id: entity.entityId,
      name: entity.entityName === '' ? 'Untitled' : entity.entityName,
      scripts: []
    }
    for (let j = 0; j < entity.scripts.length; j++) {
      const script = entity.scripts[j]
      const scriptData = {
        script: script.scriptType,
        count: script.ops.length
      }
      entityData.scripts.push(scriptData)
    }
    data.push(entityData)
  }
  // console.log('data', data)
  renderInitialState(data)

  createNanoEvents
  emitter = createNanoEvents()
  emitter.on('op-flow', data => {
    visualiseOpFlowEvent(data)
  })
}
const visualiseOpFlowEvent = data => {
  const id = `op-${data.entityId}-${data.scriptType}`
  // console.log('visualiseOpFlowEvent', data, id)
  const opEle = document.getElementById(`${id}-current`)
  if (opEle) {
    opEle.innerHTML = data.opCode
    if (opEle.classList.contains('btn-dark')) {
      opEle.classList.remove('btn-dark')
      opEle.classList.add('btn-primary')
    }
    // for (let i = 0; i < opEle.classList.length; i++) {
    //     const className = opEle.classList[i]
    //     if (className.includes('btn-priority')) {
    //         opEle.classList.remove(className)
    //     }
    // }
    // if (data.opCode === LoopVisualiserIcons.STOPPED || data.opCode === LoopVisualiserIcons.FLOWSTOP || data.opCode === LoopVisualiserIcons.KILL) {
    //     opEle.classList.add('btn-dark')
    // } else {
    //     opEle.classList.add(`btn-priority-${data.priority}`)
    // }
    if (
      data.opCode === LoopVisualiserIcons.STOPPED ||
      data.opCode === LoopVisualiserIcons.FLOWSTOP ||
      data.opCode === LoopVisualiserIcons.KILL ||
      data.opCode === LoopVisualiserIcons.QUEUED
    ) {
      opEle.classList.remove('btn-primary')
      opEle.classList.add('btn-dark')
    }

    document.getElementById(`${id}-index`).innerHTML = data.currentOpIndex
    // document.getElementById(`${id}-priority`).innerHTML = data.priority
  }
}
const sendOpFlowEvent = (
  entityId,
  scriptType,
  opCode,
  currentOpIndex,
  priority
) => {
  if (emitter !== undefined) {
    emitter.emit('op-flow', {
      entityId,
      scriptType,
      opCode,
      currentOpIndex,
      priority
    })
  }
}

export { initOpLoopVisualiser, sendOpFlowEvent, LoopVisualiserIcons }
