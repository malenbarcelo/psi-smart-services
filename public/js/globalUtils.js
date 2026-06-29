const gu = {
  closePopups: function(popups) {
    popups.forEach(popup => {
      const closeIcon = document.getElementById(popup.id + 'Close')
      const cancelIcon = document.getElementById(popup.id + 'Cancel')
      if (closeIcon) {
        closeIcon.addEventListener("click", async() => {
          popup.style.display = 'none'
        })
      }
      if (cancelIcon) {
        cancelIcon.addEventListener("click", async() => {
          popup.style.display = 'none'
        })
      }
    })
  },

  closeWithEscape: function(popups) {
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const displayedPopups = popups.filter(p => p.style.display == 'block' || p.classList.contains('slideIn'))
        if (displayedPopups.length > 0) {
          if (displayedPopups[0].style.display == 'block') {
            displayedPopups[0].style.display = 'none'
          } else {
            displayedPopups[0].classList.remove('slideIn')
          }
        }
      }
    })
  },

  showResultPopup: function(popupToShow) {
    popupToShow.style.display = 'block'
    popupToShow.classList.add('okSlideIn')
    setTimeout(function() {
      popupToShow.classList.remove('okSlideIn')
      popupToShow.style.display = 'none'
    }, 3000)
  },

  clearInputs: function(inputs) {
    inputs.forEach(input => {
      if (input) {
        input.value = ''
      }
    })
    this.isValid(inputs)
  },

  isValid: function(inputs) {
    inputs.forEach(input => {
      if (input) {
        const label = document.getElementById(input.id + 'Label')
        const error = document.getElementById(input.id + 'Error')
        input.classList.remove('invalid-input')
        if (label) {
          label.classList.remove('invalid-label')
        }
        if (error) {
          error.style.display = 'none'
        }
      }
    })
  },

  isInvalid: function(inputs, errorText) {
    inputs.forEach(input => {
      const label = document.getElementById(input.id + 'Label')
      const error = document.getElementById(input.id + 'Error')
      input.classList.add('invalid-input')
      if (label) {
        label.classList.add('invalid-label')
      }
      if (error) {
        error.innerText = errorText
        error.style.display = 'block'
      }
    })
  },

  showTooltips: function(tooltips, width) {
    tooltips.forEach(element => {
      const info = document.getElementById(element.icon.id.replace('Icon', 'Info'))
      element.icon.addEventListener("mousemove", (e) => {
        const offsetY = 35
        const offsetX = -70
        info.style.position = 'fixed'
        info.style.top = (e.clientY - offsetY) + 'px'
        info.style.left = (e.clientX + offsetX) + 'px'
        info.style.width = width + 'px'
        info.style.display = 'block'
      })
      element.icon.addEventListener("mouseleave", () => {
        info.style.display = 'none'
      })
    })
  },

  acceptWithEnterInput: function(input, button) {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && button.offsetParent !== null) {
        button.click()
      }
    })
  },

  uncheckAll: function(checks) {
    checks.forEach(check => {
      check.checked = false
    })
  },

  checkAll: function(checks) {
    checks.forEach(check => {
      check.checked = true
    })
  },

  formatNumberWithComma: function(value, decimals) {
    if (value == null || value === '') return ''
    let str = String(value).replace(/[^0-9.,]/g, '').replace(/\./g, ',').replace(/(,.*),/g, '$1')
    if (str.includes(',')) {
      const [int, dec] = str.split(',')
      if (dec && dec.length > decimals) {
        const num = Number(int + '.' + dec)
        str = num.toFixed(decimals).replace('.', ',')
      }
    }
    return str
  },

  replaceDotWithComa: function(inputs, decimals) {
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        input.value = this.formatNumberWithComma(input.value, decimals)
      })
    })
  }
}

export { gu }
