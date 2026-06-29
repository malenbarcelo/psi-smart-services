const burgerMenu = document.getElementById('burgerMenu')
const sideMenu = document.getElementById('sideMenu')
const sideMenuOverlay = document.getElementById('sideMenuOverlay')

if (burgerMenu && sideMenu) {
  burgerMenu.addEventListener('mouseenter', () => {
    sideMenu.classList.add('side-menu-open')
    sideMenuOverlay.classList.add('overlay-visible')
  })

  sideMenu.addEventListener('mouseleave', () => {
    sideMenu.classList.remove('side-menu-open')
    sideMenuOverlay.classList.remove('overlay-visible')
  })

  sideMenuOverlay.addEventListener('click', () => {
    sideMenu.classList.remove('side-menu-open')
    sideMenuOverlay.classList.remove('overlay-visible')
  })
}
