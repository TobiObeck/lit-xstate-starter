/** @type {HTMLInputElement} */
const switchEl = document.querySelector('sl-switch')
const buttonEl = document.querySelector('sl-button')

switchEl.addEventListener('sl-change', (event) => {
  console.log(event.target.checked)

  buttonEl.disabled = !buttonEl.disabled
})

buttonEl.addEventListener('click', (event) => {
  console.log('click', Math.random())
  switchEl.checked = !switchEl.checked
})
