const HAS_TOUCH = ('ontouchstart' in window)
function getCoord(evt, val){
  let coord = val === 'X' ? 'clientX' : 'clientY'
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

  let startX,
    startY,
    lastDeg,
    active = false

  function onRelease(e){
    if (active){
      document.body.classList.remove('is-grabbing')
      active = false
    }
  }

  function onMove(e){
    e.preventDefault()
    if (active){
      let diffX = getCoord(e, 'X') - center.x
      let diffY = center.y - getCoord(e, 'Y')
      let arctan = Math.atan2(diffY , diffX)
      let deg = arctan * (180 / Math.PI)
      let roundDeg = 90 - (Math.round(deg/15) * 15)
      if (roundDeg < 0) roundDeg = 360 + roundDeg
      if (Math.abs(roundDeg) === Math.abs(lastDeg)) return
      else {
        lastDeg = roundDeg
        spinner.style.transform = `rotate(${roundDeg}deg)`
        spinner.style.backgroundColor = `hsl(${roundDeg}, 63%, 60%)`
        feedback.innerHTML = `X:${diffX} Y:${diffY} deg:${roundDeg}`
        navigator.vibrate && navigator.vibrate([50])
      }

    }
  }

  function onGrab(e){
    if (!active){
      active = true
      document.body.classList.add('is-grabbing')
    }
  }

  spinner.addEventListener('mousedown', onGrab, false)
  spinner.addEventListener('mousedown', onGrab, false)
  spinner.addEventListener('touchstart', onGrab, false)
  window.addEventListener('mouseup', onRelease, false)
  window.addEventListener('touchend', onRelease, false)
  window.addEventListener('mousemove', onMove, false)
  window.addEventListener('touchmove', onMove, false)
}

new Knob('knob')