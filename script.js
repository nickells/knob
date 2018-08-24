const HAS_TOUCH = ('ontouchstart' in window)
function getCoord(evt){
  return (val) => {
    let coord = val === 'X' ? 'clientX' : 'clientY'
    return HAS_TOUCH ? evt.touches[0][coord] : evt[coord]
  }
  // switch to screen if parent has unknown width?
}

function Knob({selector: elem, notches: notchesCount}){
  // config
  const radius = 25

  let spinner = elem
  let inner = elem.firstElementChild
  let feedback = document.getElementById('feedback')

  const offset = 10
  const degreeInterval = 360 / notchesCount
  for (let notch = 1; notch <= notchesCount; notch++) {
    const degree = notch * degreeInterval
    let notchPosition = {
      x: (radius + offset) * Math.cos(degree * (Math.PI / 180)) + radius - 3,
      y: (radius + offset) * Math.sin(degree * (Math.PI / 180)) + radius - 1
    }
    console.log(notchPosition)
    const notchElem = document.createElement('div')
    notchElem.classList.add('notchElem')
    notchElem.style.position = 'absolute'
    notchElem.style.width = '6px'
    notchElem.style.height = '1px'
    notchElem.style.display='inline-block'
    notchElem.style.backgroundColor = 'grey'
    notchElem.style.left = `${notchPosition.x}px`
    notchElem.style.top = `${notchPosition.y}px`
    console.log(notchElem, degree)
    notchElem.style.transform = `rotate(${degree}deg)`
    spinner.appendChild(notchElem)
  }


  const center = {
    x: spinner.offsetLeft + spinner.offsetWidth / 2,
    y: spinner.offsetTop + spinner.offsetHeight / 2
  }

  let lastDeg = 0,
    active = false

  function onRelease(e){
    if (active){
      spinner.classList.remove('is-active')
      document.body.classList.remove('is-grabbing')
      active = false
    }
  }

  function roundTo(num, to){
    return Math.round(num/to) * to
  }

  function rotate(deg){
    deg %= 360
    lastDeg = deg
    inner.style.transform = `rotate(${deg}deg)`
    // spinner.style.backgroundColor = `hsl(${deg}, 63%, 60%)`
    navigator.vibrate && navigator.vibrate([50])
  }

  function onMove(e){
    const getCoordForElement = getCoord(e)
    e.preventDefault()
    if (active){
      let diffX = getCoordForElement('X') - center.x
      let diffY = center.y - getCoordForElement('Y')
      let arctan = Math.atan2(diffY , diffX)
      let deg = arctan * (180 / Math.PI)
      let roundDeg = roundTo(deg, degreeInterval)
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
      spinner.classList.add('is-active')
      document.body.classList.add('is-grabbing')
      onMove(e)
    }
  }


  function onScroll(e){
    const mode = 'relative'
    e.preventDefault()
    const {deltaY} = e
    let newDeg = 0
    if (mode === 'relative'){
      let scrollMultiplier = 0.4
      newDeg = roundTo(lastDeg + deltaY * scrollMultiplier, 15)
    } else if (mode === 'orthoganal') {
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

new Knob({
  notches: 24,
  selector: document.getElementById('knob-1')
})
new Knob({
  notches: 5,
  selector: document.getElementById('knob-2')
})
new Knob({
  notches: 11,
  selector: document.getElementById('knob-3')
})
new Knob({
  notches: 2,
  selector: document.getElementById('knob-4')
})