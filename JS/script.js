
//______________________________________  SETUP  ______________________________________\\

let INDEX = 60
let TIME = 0
let W_SCALE = 1
let H_SCALE = 1
let RIGHT = 0
let RATIO = 1

let q = "1fad071e";
let big = "045e512c"
let v = '1b2d62fb'

load('39a8645d')
setTimeout(() => {
  window.requestAnimationFrame(loop);
}, 100);

function load(json) {
  loadJson(json);
  TIME = 300
  setTimeout(() => {
    drawHTML();
    addData()
    setTimeout(() => {
      setParams();
      drawProblems();
    }, 100);
  }, 100);
}

setInterval(() => {
  if (TIME > 0) {
    TIME -= 10
  }
}, 10);

function resizeArea() {
  let ratio = window.innerWidth / window.innerHeight
  if ((RATIO < 2) != (ratio < 2)) {
    area.style.transform = ``
    W_SCALE = 1
    H_SCALE = 1
  }
  let rect = area.getBoundingClientRect()
  let full_width = window.innerWidth - 180
  let og_width = rect.width / W_SCALE
  let og_height = rect.height / H_SCALE
  let og_pos = rect.right - RIGHT
  RIGHT = window.innerWidth - 10 - og_pos
  W_SCALE = full_width / og_width
  H_SCALE = window.innerHeight / og_height
  RATIO = ratio
  if (ratio < 2) {
    area.style.transform = `scale(${W_SCALE}) translateX(${RIGHT}px)`
  } else if (ratio == 2) {
    area.style.transform = ``
    W_SCALE = 1
    H_SCALE = 1
  } else {
    area.style.transform = `scale(${H_SCALE}) translateX(${0}px)`
  }
}

//______________________________________  MENU  ______________________________________\\

function drawResults(query) {
  pane.innerHTML = ''
  let sorted = []
  let scores = []
  let s = ''

  // determine scores
  for (let i = 0; i < menu.length; i++) {
    let name = menu[i];

    let score = 0
    for (let j = 0; j < query.length; j++){
      let substr = query.substring(0, j)
      if (name.includes(substr)) {
        score ++
      }
    }
    scores.push(score)
  }

  // insert into sorted list
  for (let i = 0; i < menu.length; i++) {
    let name = menu[i];
    let score = scores[i]
    let k = sorted.length - 1
    while (k > 0 && score > scores[k-1]) {
      k--
    }
    sorted.splice(k,0,[name,i])
  }

  // draw panel
  for (let i = 0; i < sorted.length; i++) {
    let name = sorted[i][0];
    let index = sorted[i][1]
    s = s+`<p class = 'result' id = '${name}-${index}'> <span> ${index}</span> ${name} </p>`;
  }

  pane.innerHTML = s
 // pane.scrollTo(0, pane.scrollHeight)
}

drawResults('')

id.onclick = () => {
  activate(pane)
}

id.oninput = () => {
  drawResults(id.value)
}



//______________________________________  SEARCH RESULTS  ______________________________________\\




Id('edit-o').onclick = () => {
  Id('it-o').classList.toggle('active')
}

Id('header-o').onclick = () => {
  Id('it-o').classList.toggle('active')
}

Id('apply-o').onclick = () => {
  let val = Id('data-o').value
  try {
    let list = JSON.parse(val)
    setItems(list, 'o')
    Id('it-o').classList.remove('active')
  } catch (e) {
    alert(e)
  }
}


Id('edit-i').onclick = () => {
  Id('it-i').classList.toggle('active')
}

Id('header-i').onclick = () => {
  Id('it-i').classList.toggle('active')
}

Id('apply-i').onclick = () => {
  let val = Id('data-i').value
  try {
    let list = JSON.parse(val)
    setItems(list, 'i')
    Id('it-i').classList.remove('active')
  } catch (e) {
    alert(e)
  }
}



//______________________________________  MOUSE  ______________________________________\\



window.addEventListener("mousemove", (e) => {
  M.o.x = e.clientX;
  M.o.y = e.clientY;
  setMouseCoords();
});

window.addEventListener("mousedown", (e) => {
  STATE.mousedown = true;
});

window.addEventListener("touchstart", (e) => {
  STATE.mousedown = true;
  M.o.x = e.touches[0].clientX;
  M.o.y = e.touches[0].clientY;
  setMouseCoords();
});

window.addEventListener("touchmove", (e) => {
  STATE.mousedown = true;
  M.o.x = e.touches[0].clientX;
  M.o.y = e.touches[0].clientY;
  setMouseCoords();
});

window.addEventListener("mouseup", (e) => {
  STATE.clicked = [];
  STATE.mousedown = false;
  if (pane.classList.contains('active')) {
    id.value = OBJECT.id
    deactivate(pane)
  }
});

window.addEventListener("touchend", (e) => {
  STATE.clicked = [];
  STATE.mousedown = false;
});

window.addEventListener('keyup', e => {
  switch (e.key) {
    case 'Escape':
      STATE.linking = false
      STATE.coloring = false
      document.body.style.cursor = 'default'
      id.value = OBJECT.id
      deactivate(pane)
      break
    case 'l':
      STATE.linking = true
      STATE.coloring = false
      break
    case "ArrowUp":
      if (TIME == 0) {
        if (INDEX > 1) {
          INDEX --
        } else {
          INDEX = menu.length - 1;
        }
        load(menu[INDEX])
      }
      break
    case "ArrowDown":
      if (TIME == 0) {
        if (INDEX < menu.length - 1) {
          INDEX ++
        } else {
          INDEX = 0;
        }
        load(menu[INDEX])
      }
      break
    case "Enter":
      Id('splash').classList.remove('active')
      break
    default:
      break
  }
})

var textFile = null;

function makeTextFile(text) {
  var data = new Blob([text], { type: "text/plain" });

  // If we are replacing a previously generated file we need to
  // manually revoke the object URL to avoid memory leaks.
  if (textFile !== null) {
    window.URL.revokeObjectURL(textFile);
  }

  textFile = window.URL.createObjectURL(data);
  return textFile;
}