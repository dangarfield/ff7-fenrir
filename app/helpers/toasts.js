const addToast = msg => {
  const toastsHolder = document.querySelector('.toasts')
  toastsHolder.innerHTML += `
    <div class="toast fade show">
      <div class="toast-header">
        <strong class="mr-auto">${msg}</strong>
      </div>
    </div>`
  setTimeout(() => {
    const toast = document.querySelector('.toasts .toast')
    console.log('toast', toast)
    toast.parentNode.removeChild(toast)
  }, 2000)
}

export { addToast }
