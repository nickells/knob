const HAS_TOUCH = ('ontouchstart' in window)
const feedback = document.getElementById('feedback')

function applyStyles(elem, styles){
  for (let [key, val] of Object.entries(styles)){
    elem.style[key] = val
  }
}

const notchStyles = {
  position : 'absolute',
  width : '6px',
  height : '1px',
  display: 'inline-block',
  backgroundColor : 'grey',
  transition : `transform 500ms`,
}

const toDegrees = (radian) => radian * (180/Math.PI)

const toRadians = (degree) => degree * (Math.PI/180)

function getCoord(evt){
  return (val) => {
    let coord = val === 'X' ? 'clientX' : 'clientY'
    return HAS_TOUCH ? evt.touches[0][coord] : evt[coord]
  }
  // switch to screen if parent has unknown width?
}

function within(val, min, max) {
  return val >= min && val <= max
}

function nearestFromSet(num, set) {
  let lastItem
  for (let [index, item] of set.entries()) {
    if (num === item) return item
    else if (lastItem === undefined && num < item) {
      return item
    }
    else if (num > lastItem && num < item) {
      return Math.abs(num - lastItem) > Math.abs(num - item) ? item : lastItem
    }
    else if (index === set.length - 1) {
      return item
    }
    
    lastItem = item
  }
}

function createNotches(spinner, radius, degrees){
  const notch_offset = 15

  degrees.forEach((degree, index) =>{
    degree-=180
    let notchPosition = {
      x: (radius + notch_offset) * Math.cos(toRadians(degree)) + radius - 3,
      y: (radius + notch_offset) * Math.sin(toRadians(degree)) + radius - 1
    }
    const notchElem = document.createElement('div')
    notchElem.classList.add('notchElem')
    applyStyles(notchElem, {
      ...notchStyles,
      left: `${notchPosition.x}px`,
      top: `${notchPosition.y}px`,
      transform: `rotate(${degree}deg) scale(0)`
    })
    spinner.appendChild(notchElem)
    setTimeout(()=>{
      applyStyles(notchElem, {
        transform: `rotate(${degree}deg) scale(1)` 
      })
    }, index * 50)
  })
}

function roundTo(num, to){
  return Math.round(num/to) * to
}

function normalizeDegree(deg, DEGREES_DEAD_AREA, min, max) {
  const offset = DEGREES_DEAD_AREA / 2
  let newDeg = 360 - deg
  if (newDeg < 90) newDeg += 360
  newDeg = newDeg - 90 - offset
  
  return (newDeg / (360 - DEGREES_DEAD_AREA)) * (max - min)
}

function Knob({selector: elem, notches: notchesCount, min = 0, max = 100}){
  // config
  const radius = 25
  const DEGREES_DEAD_AREA = 90
  const DEGREES_START = 270 - (DEGREES_DEAD_AREA / 2) // assume 360 degrees, and 0 is at 3:00 position (CCW), then move it to this new starting point

  let spinner = elem
  let inner = elem.firstElementChild
  let _onChange = () => {}


  // if there is a dead zone, add 1 to notchescount to spread evenly. otherwise it will overlap at the 360 mark
  const degreeInterval = ( (360 - DEGREES_DEAD_AREA) / (DEGREES_DEAD_AREA ? notchesCount - 1 : notchesCount)   ) || 1
  
  // create degrees to map to, and notches
  const degreesSet = []
  if (notchesCount) {
    for (let notch = 0; notch < notchesCount; notch++) {
      let val = DEGREES_START - (notch * degreeInterval)
      val = (val + 360) % 360
      degreesSet.push(val)
    }
  }

  // reverse the degree set so animation works
  createNotches(spinner, radius, degreesSet.reverse())

  // sort the degree set so we can properly get the closest match algorithmically
  degreesSet.sort((a, b) => a - b)

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

  function rotate(deg){
    lastDeg = deg
    // change degree to match CSS's interpretation of geometry
    // and because the notch is vertical upon start
    inner.style.transform = `rotate(${90 - deg}deg)`
    navigator.vibrate && navigator.vibrate([50])
  }

  function onMove(e){
    const getCoordForElement = getCoord(e)
    e.preventDefault()
    if (active){
      let diffX = getCoordForElement('X') - center.x
      let diffY = center.y - getCoordForElement('Y')  // because Y is upside down from math
      let arctan = Math.atan2(diffY , diffX)
      let deg = (toDegrees(arctan) + 360) % 360
      let roundDeg = nearestFromSet(deg, degreesSet)
      if (Math.abs(roundDeg) === Math.abs(lastDeg)) return
      else {
        rotate(roundDeg)
        _onChange(normalizeDegree(roundDeg, DEGREES_DEAD_AREA, min, max))
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

  return {
    setValue(val){
      const degree = (val / max) * 360
      rotate(degree)
      return this
    },
    onChange(func){
      _onChange = func
      return this
    }
  }
}

// const updateFeedback = (deg) => feedback.innerHTML = `value :${deg}`

// new Knob({
//   notches: 24,
//   selector: document.getElementById('knob-1')
// })
// .onChange(updateFeedback)

new Knob({
  notches: 15,
  selector: document.getElementById('knob-2')
})
.onChange(console.log)

// new Knob({
// notches: 8,
//   selector: document.getElementById('knob-3')
// })
// .setValue(20)
// // .onChange(updateFeedback)

// new Knob({
//   // notches: 18,
//   selector: document.getElementById('knob-4')
// }).setValue(50)
// // .onChange(updateFeedback)
