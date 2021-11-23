import TWEEN from '../../assets/tween.esm.js'
import { MENU_TWEEN_GROUP } from './menu-scene.js'
import { getMenuState, setMenuState } from './menu-module.js'

const tweenOneColumnVerticalNavigation = (group, up, state, page, yAdj, cb) => {
  setMenuState('loading')
  const subContents = group
  for (let i = 0; i < page + 1; i++) {
    subContents.children[i].visible = true
  }
  let from = {y: subContents.position.y}
  let to = {y: up ? subContents.position.y + yAdj : subContents.position.y - yAdj}
  new TWEEN.Tween(from, MENU_TWEEN_GROUP)
    .to(to, 50)
    .onUpdate(function () {
      subContents.position.y = from.y
    })
    .onComplete(function () {
      for (let i = 0; i < page; i++) {
        subContents.children[i].visible = false
      }
      setMenuState(state)
      cb()
    })
    .start()
}

const oneColumnVerticalNavigation = (delta, group, totalPerPage, totalItems, pagePos, getItemPositionsCB, drawOneCB, drawAllCB, drawPointerCB, updateCB) => {
  const maxPage = totalItems - totalPerPage
  const potential = pagePos.pos + delta

  console.log('menu oneColumnVerticalNavigation', delta, '-', pagePos.page, pagePos.pos, '->', potential, ':', maxPage, totalPerPage)

  const { x, y, yAdj } = getItemPositionsCB()

  if (potential < 0) {
    if (pagePos.page === 0) {
      console.log('menu oneColumnVerticalNavigation on first page - do nothing')
    } else {
      console.log('menu oneColumnVerticalNavigation not on first page - PAGE DOWN')
      drawOneCB(-1, pagePos.page, x, y, yAdj)
      pagePos.page--
      tweenOneColumnVerticalNavigation(group, false, getMenuState(), pagePos.page, yAdj, drawAllCB) // Could optimise further
      updateCB()
    }
  } else if (potential >= Math.min(totalItems, totalPerPage)) {
    console.log('menu oneColumnVerticalNavigation page - is last page??', pagePos.page, totalPerPage, maxPage)
    if (pagePos.page >= maxPage) {
      console.log('menu oneColumnVerticalNavigation on last page - do nothing')
    } else {
      console.log('menu oneColumnVerticalNavigation not on last page - PAGE UP', delta, pagePos.page)
      drawOneCB(totalPerPage, pagePos.page, x, y, yAdj)
      pagePos.page++
      tweenOneColumnVerticalNavigation(group, true, getMenuState(), pagePos.page, yAdj, drawAllCB)
      updateCB()
    }
  } else {
    console.log('menu buyNavigate move pointer only', pagePos.page, pagePos.pos, potential)
    pagePos.pos = potential
    drawPointerCB()
    updateCB()
  }
}
const oneColumnVerticalPageNavigation = (up, totalPerPage, totalItems, pagePos, group, drawAllCB, updateCB) => {
  const lastPage = Math.max(0, totalItems - totalPerPage)
  console.log('shop oneColumnVerticalPageNavigation', lastPage, totalItems, totalPerPage, pagePos.page)
  if (up) {
    pagePos.page = pagePos.page + totalPerPage
    if (pagePos.page > lastPage) {
      pagePos.page = lastPage
    }
  } else {
    pagePos.page = pagePos.page - totalPerPage
    if (pagePos.page < 0) {
      pagePos.page = 0
    }
  }
  // Update list group positions
  if (group.userData.slider) {
    group.userData.slider.userData.moveToPage(pagePos.page)
  }
  drawAllCB()
  updateCB()
}
export {
  oneColumnVerticalNavigation,
  oneColumnVerticalPageNavigation
}
