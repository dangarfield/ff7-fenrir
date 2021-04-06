const bindDisplayControls = () => {
  // keyboard controls
  document
    .querySelector('.display-controls .controls')
    .addEventListener('click', () => {
      const div = document.querySelector('.keyboard-instructions .modal')
      if (!div.classList.contains('show')) {
        div.classList.add('show')
      } else {
        div.classList.remove('show')
      }
    })
  document
    .querySelector('.keyboard-instructions .close')
    .addEventListener('click', () => {
      document
        .querySelector('.keyboard-instructions .modal')
        .classList.remove('show')
    })
  // stats
  document
    .querySelector('.display-controls .stats')
    .addEventListener('click', () => {
      const div = document.querySelector('.stats')
      if (div.style.display === 'none') {
        div.style.display = 'block'
      } else {
        div.style.display = 'none'
      }
    })
  // datgui
  document
    .querySelector('.display-controls .debug')
    .addEventListener('click', () => {
      const datgui = document.querySelector('.dg.ac')
      if (!datgui.classList.contains('hide')) {
        datgui.classList.add('hide')
      } else {
        datgui.classList.remove('hide')
      }
      const loop = document.querySelector('.field-op-loop-visualiser')
      if (!loop.classList.contains('hide')) {
        loop.classList.add('hide')
      }
    })
  // loop
  document
    .querySelector('.display-controls .loop')
    .addEventListener('click', () => {
      const loop = document.querySelector('.field-op-loop-visualiser')
      if (!loop.classList.contains('hide')) {
        loop.classList.add('hide')
      } else {
        loop.classList.remove('hide')
      }
      const datgui = document.querySelector('.dg.ac')
      if (!datgui.classList.contains('hide')) {
        datgui.classList.add('hide')
      }
    })
}
export { bindDisplayControls }
