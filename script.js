const HAS_TOUCH = ('ontouchstart' in window)
function getCoord(evt, val){
  let coord = val === 'X' ? 'clientX' : 'clientY'
  // switch to screen if parent has unknown width?
  return HAS_TOUCH ? evt.touches[0][coord] : evt[coord]
}

function Knob(elementId){
  let spinner = document.getElementById(elementId)
  let feedback = document.getElementById('feedback')
  let changeHandler = spinner.getAttribute('onRotate')
  let height = spinner.offsetHeight
  
  const center = {
    x: spinner.offsetTop + spinner.offsetHeight / 2,
    y: spinner.offsetLeft + spinner.offsetWidth / 2
  }

  let startX = 0,
    startY = 0,
    lastDeg = 0,
    active = false

  function onRelease(e){
    if (active){
      document.body.classList.remove('is-grabbing')
      active = false
    }
  }

  function roundTo(num, to){
    return Math.round(num/to) * to
  }

  function rotate(deg){
    deg = deg % 360
    lastDeg = deg
    spinner.style.transform = `rotate(${deg}deg)`
    spinner.style.backgroundColor = `hsl(${deg}, 63%, 60%)`
    navigator.vibrate && navigator.vibrate([50])
  }

  function onMove(e){
    e.preventDefault()
    if (active){
      let diffX = getCoord(e, 'X') - center.x
      let diffY = center.y - getCoord(e, 'Y')
      let arctan = Math.atan2(diffY , diffX)
      let deg = arctan * (180 / Math.PI)
      let roundDeg = roundTo(deg, 15)
      let outputDeg = 90 - roundDeg
      if (outputDeg < 0) outputDeg = 360 + outputDeg
      if (Math.abs(outputDeg) === Math.abs(lastDeg)) return
      else {
        rotate(outputDeg)
        feedback.innerHTML = `X:${diffX} Y:${diffY} deg:${outputDeg}`
      }

    }
  }

  function onGrab(e){
    if (!active){
      active = true
      document.body.classList.add('is-grabbing')
    }
  }


  function onScroll(e){
    const mode = 'orthoganal'
    e.preventDefault()
    const { deltaY } = e
    let newDeg = 0
    if (mode === 'relative'){
      let scrollMultiplier = 0.4
      newDeg = roundTo(lastDeg + deltaY * scrollMultiplier, 15)
    }
    else if (mode === 'orthoganal') {
      let scrollMultiplier = 8
      const direction = Math.sign(deltaY)
      newDeg = roundTo(lastDeg + direction * scrollMultiplier, 15)
    }
    rotate(newDeg)
  }

  spinner.addEventListener('mousedown', onGrab, false)
  spinner.addEventListener('mousedown', onGrab, false)
  spinner.addEventListener('touchstart', onGrab, false)
  spinner.addEventListener('wheel', onScroll, false)
  window.addEventListener('mouseup', onRelease, false)
  window.addEventListener('touchend', onRelease, false)
  window.addEventListener('mousemove', onMove, false)
  window.addEventListener('touchmove', onMove, false)
}

new Knob('knob')