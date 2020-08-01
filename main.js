"use strict";

const keys = {};
const person = document.getElementById('person');
const momentum = {x: 0, y: 0};
const speed = 0.0005;
const jump = 0.28;
const gravity = 0.0008;
const scareRadius = 25;
let shooingTimeout = null;
const floor = -12.2;
const shooSound = new Audio('sounds/shoo.mp3');
const meowSound = new Audio('sounds/meow.mp3');

window.addEventListener('keydown', event => {
  keys[event.key] = true;
  if (event.key === 'ArrowUp' && parseFloat(person.style.bottom) <= (floor + 1)) {
    momentum.y += jump;
  }
  if (event.key === ' ') {
    shooSound.play();
    person.classList.add('shooing');
    if (shooingTimeout) {
      clearTimeout(shooingTimeout);
    }
    shooingTimeout = setTimeout(() => {
      person.classList.remove('shooing');
    }, 1000);
    const shoo = document.createElement('div');
    shoo.classList.add('shoo');
    shoo.style.left   = (parseFloat(person.style.left)   + 14) + 'vw';
    shoo.style.bottom = (parseFloat(person.style.bottom) + 35) + 'vw';
    document.body.appendChild(shoo);
    setTimeout(() => {
      shoo.remove();
    }, 2000);
    const cats = [...document.getElementsByClassName('cat')];
    for (const cat of cats) {
      const deltaX = Math.abs(parseFloat(cat.style.left)   - parseFloat(person.style.left));
      const deltaY = Math.abs(parseFloat(cat.style.bottom) - parseFloat(person.style.bottom));
      const distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
      if (distance < scareRadius) {
        cat.classList.add('scared');
        cat.classList.remove('appearing');
        cat.classList.remove('threatening');
        setTimeout(() => {
          cat.classList.add('running');
          cat.classList.remove('scared');
          cat.classList.add(`runaway-${cat.object.dataset.object}`);
          delete cat.object.cat;
          setTimeout(() => {
            cat.remove();
          }, 2000);
        }, 1000);
        if (cat.threatenTimer) {
          clearTimeout(cat.threatenTimer);
        }
        if (cat.breakTimer) {
          clearTimeout(cat.breakTimer);
        }
        meowSound.play();
      }
    }
  }
});
window.addEventListener('keyup', event => { keys[event.key] = false; });

let lastTimestamp = performance.now();
window.requestAnimationFrame(function handleFrame(timestamp) {
  const timeDelta = timestamp - lastTimestamp;
  if (keys.ArrowRight) {
    person.classList.remove('facing-left');
    momentum.x += speed * timeDelta;
  }
  if (keys.ArrowLeft) {
    person.classList.add('facing-left');
    momentum.x -= speed * timeDelta;
  }
  person.style.left   = parseFloat(person.style.left)   + (momentum.x * timeDelta) + 'vw';
  person.style.bottom = parseFloat(person.style.bottom) + (momentum.y * timeDelta) + 'vw';
  momentum.x *= 0.8;
  momentum.y *= 0.8;
  momentum.y -= gravity * timeDelta;
  // Ground
  if (parseFloat(person.style.bottom) < floor) {
    person.style.bottom = floor + 'vw';
  }
  lastTimestamp = timestamp;
  window.requestAnimationFrame(handleFrame);
});
function putCatOnObject(object) {
  if (!object.cat && !object.classList.contains('broken')) {
    const cat = document.createElement('div');
    cat.classList.add('cat');
    cat.classList.add(object.dataset.object);
    cat.style.left   = (parseFloat(object.style.left   || 0) + parseFloat(object.dataset.catx)) + 'vw';
    cat.style.bottom = (parseFloat(object.style.bottom || 0) + parseFloat(object.dataset.caty)) + 'vw';
    if (object.dataset.catlook === 'right') {
      cat.classList.add('look-right');
    }
    object.cat = cat;
    cat.object = object;
    document.body.appendChild(cat);
    if (object.dataset.catAppearBehind === 'yes') {
      cat.classList.add('appearing');
      cat.threatenTimer = setTimeout(() => {
        startThreatening();
      }, 2000);
    } else {
      startThreatening();
    }
    function startThreatening() {
      cat.classList.remove('appearing');
      cat.classList.add('threatening');
      cat.breakTimer = setTimeout(() => {
        object.classList.add('broken');
      }, 3000);
    }
  }
}
const bag = document.getElementById('bag');
bag.addEventListener('mousedown', event => {
  event.preventDefault();
  const cat = document.createElement('div');
  cat.classList.add('cat');
  cat.classList.add('dragged');
  document.body.appendChild(cat);
  function handleMousemove(event) {
    cat.style.left   = ((100 * (event.pageX / window.innerWidth)) - 11.5) + 'vw';
    cat.style.bottom = ((100 * ((window.innerHeight - event.pageY) / window.innerWidth)) - 17) + 'vw';
  }
  handleMousemove(event);
  function handleMouseup(event) {
    window.removeEventListener('mousemove', handleMousemove);
    window.removeEventListener('mouseup', handleMouseup);
    if (event.target.classList.contains('object')) {
      putCatOnObject(event.target);
      cat.remove();
    } else {
      cat.remove();
    }
  }
  window.addEventListener('mousemove', handleMousemove);
  window.addEventListener('mouseup', handleMouseup);
  return false;
});
