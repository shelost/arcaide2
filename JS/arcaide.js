
//______________________________________  CONSTANTS  ______________________________________\\

let t = {}
const S = 300

const row = Id("row")
const log = Id("log")
const splash = Id('splash')
const download = Id('download')
const area = Id('area')
const id = Id('id')
const pane = Id('menu')

// mouse variables
let M = {
  o: { x: 0, y: 0 },
  in: { x: 0, y: 0 },
  out: { x: 0, y: 0 },
}

// drawing canvas parameters
let SPEC = {
  in: {
    canvas: null,
    ctx: null,
    rect: 0,
    scale: 0,
  },
  out: {
    canvas: null,
    ctx: null,
    rect: 0,
    scale: 0,
  },
}

// main object
let OBJECT = {
  id: '',
  problems: [],

  inputs: [],
  input_items: [],
  input_dims: [],

  outputs: [],
  output_items: [],
  output_dims: [],

  names: [],
  links: [],
}

// active parts of main object
let ACTIVE = {
  prob: [],

  input: [],
  input_layer: [],
  input_items: [],
  input_dims: [],
  input_dim: [],
  input_next: 0,

  output: [],
  output_layer: [],
  output_items: [],
  output_dims: [],
  output_dim: [],
  output_next: 0,

  item: [],
  names: [],
  links: [],
}

// state variables
let STATE = {
  active_prob: 1,
  active_item: 'i01-1',
  active_layers: [1, 1],
  active_color: 0,
  cum_layers: [1, 1],
  num_layers: [1, 1],
  linking: false,
  coloring: false,
  mousedown: false,
  color: 0,
  clicked: []
}


//______________________________________  SETUP  ______________________________________\\

function loadJson(str) {
  window
    .fetch("data/" + str + ".json")
    .then((response) => response.json())
    .then((json) => {
      OBJECT = {
        problems: [],

        inputs: [],
        input_items: [],
        input_dims: [],

        outputs: [],
        output_items: [],
        output_dims: [],

        names: [],
        links: [],
      }
      OBJECT.problems = json.train.concat(json.test)
      OBJECT.id = str
      id.value = str
      for (let i = 0; i < OBJECT.problems.length; i++) {

        OBJECT.inputs.push([copyGrid(OBJECT.problems[i].input)])
        OBJECT.input_dims.push([[0,0,0,0]])
        OBJECT.input_items.push(
          [{
            layer: 1,
            sym: 'i',
            group: 1,
            n: 1,
            coords: [],
          }]
        )
        ACTIVE.input_items = OBJECT.input_items[0]
        ACTIVE.input_dims = OBJECT.input_dims[0]

        OBJECT.outputs.push([copyGrid(OBJECT.problems[i].output)])
        OBJECT.output_dims.push([[0,0,0,0]])
        OBJECT.output_items.push(
          [{
            layer: 1,
            sym: 'o',
            group: 1,
            n: 1,
            coords: [],
          }]
        )
        ACTIVE.output_items = OBJECT.output_items[0]
        ACTIVE.output_dims = OBJECT.output_dims[0]

        OBJECT.names.push([['i01', 'i-01'], ['o01', 'o-01']])
        OBJECT.links.push([])
        ACTIVE.names = OBJECT.names[0]
        ACTIVE.links = OBJECT.links[0]
      }
    })
}

// set mouse coords
function setMouseCoords() {
  if (SPEC.in.rect != null) {
    M.in.x = (M.o.x - SPEC.in.rect.left) * SPEC.in.scale
    M.in.y = (M.o.y - SPEC.in.rect.top) * SPEC.in.scale
    M.out.x = (M.o.x - SPEC.out.rect.left) * SPEC.out.scale
    M.out.y = (M.o.y - SPEC.out.rect.top) * SPEC.out.scale
  }
}

// return a copy of the 2d matrix
function copyGrid(source) {
  let res = []
  for (let i = 0; i < source.length; i++) {
    res.push([])
    for (let j = 0; j < source[i].length; j++) {
      res[i].push(source[i][j])
    }
  }
  return res
}

function emptyGrid(source, def = null) {
  let res = []
  for (let i = 0; i < source.length; i++) {
    res.push([])
    for (let j = 0; j < source[i].length; j++) {
      res[i].push(def)
    }
  }
  return res
}

function clearCanvases() {
  for (let i = 0; i < Class("canv").length; i++) {
    let ctx = Class("canv")[i].getContext("2d")
    ctx.clearRect(0, 0, S, S)
  }
}

// set constants
function setParams() {

  let p = STATE.active_prob - 1

  ACTIVE.prob = OBJECT.problems[p]
  ACTIVE.links = OBJECT.links[p]
  ACTIVE.names = OBJECT.names[p]

  ACTIVE.input = OBJECT.inputs[p]
  ACTIVE.input_items = OBJECT.input_items[p]
  ACTIVE.input_dims = OBJECT.input_dims[p]
  ACTIVE.input_layer = ACTIVE.input[STATE.active_layers[0] - 1]
  ACTIVE.input_dim = ACTIVE.input_dims[STATE.active_layers[0] - 1]

  ACTIVE.output = OBJECT.outputs[p]
  ACTIVE.output_items = OBJECT.output_items[p]
  ACTIVE.output_dims = OBJECT.output_dims[p]
  ACTIVE.output_layer = ACTIVE.output[STATE.active_layers[1] - 1]
  ACTIVE.output_dim = ACTIVE.output_dims[STATE.active_layers[0] - 1]

  let sym = STATE.active_item.substring(0, 1)
  let group = STATE.active_item.substring(1, 3)
  let n = STATE.active_item.substring(4)
  let items = sym == 'i'? ACTIVE.input_items : ACTIVE.output_items
  for (let i = 0; i < items.length; i++){
    let item = items[i]
    if (item.group == group && item.n == n) {
      ACTIVE.item = item
    }
  }



  let i_id = STATE.active_layers[0]
  if (i_id < 10) {
    i_id = '0' + i_id
  }
  SPEC.in.canvas = Id(`i${i_id}`)
  SPEC.in.ctx = SPEC.in.canvas.getContext("2d")
  SPEC.in.rect = SPEC.in.canvas.getBoundingClientRect()
  SPEC.in.scale = S / SPEC.in.rect.width

  for (let k = 0; k < 2; k++){
    let items = k == 0 ? ACTIVE.input_items : ACTIVE.output_items
    let next = k == 0 ? ACTIVE.input_next : ACTIVE.output_next
    let min = 0
    for (let v = 1; v < 100; v++){
      let match = false
      for (let i = 0; i < items.length; i++){
        let item = items[i]
        if (item.group == v) {
          match = true
        }
      }
      if (!match) {
        min = v
        break
      }
    }
    if (k == 0) {
      ACTIVE.input_next = min
    } else {
      ACTIVE.output_next = min
    }
  }

  let o_id = STATE.active_layers[1]
  if (o_id < 10) {
    o_id = '0' + o_id
  }
  SPEC.out.canvas = Id(`o${o_id}`)
  SPEC.out.ctx = SPEC.out.canvas.getContext("2d")
  SPEC.out.rect = SPEC.out.canvas.getBoundingClientRect()
  SPEC.out.scale = S / SPEC.out.rect.width
}

// return the hex code corresponding to the number
function colorCell(n) {
  switch (n) {
    case null:
      return "rgba(0, 0, 0, 0)"
    case 0:
      return 'black'
    case 1:
      return "#0074d9"
    case 2:
      return "#ff4126"
    case 3:
      return "#2ecc40"
    case 4:
      return "#ffdc00"
    case 5:
      return "#aaaaaa"
    case 6:
      return "#ef11be"
    case 7:
      return "#ff841a"
    case 8:
      return "#7fdbff"
    default:
      return "black"
  }
}

// whether the mouse is hovering over this grid
function hover(xs, ys, c, ex, ey) {
  if (xs < ex && ex < xs + c && ys < ey && ey < ys + c) {
    return true
  }
  return false
}


//______________________________________  HTML  ______________________________________\\

// clear the html
function clearHTML() {
  for (let i = 0; i < Class("layers").length; i++) {
    let div = Class("layers")[i]
    div.innerHTML = ``
  }
  for (let i = 0; i < Class("thumbnails").length; i++) {
    let div = Class("thumbnails")[i]
    div.innerHTML = ``
  }
}

// draw the html
function drawHTML() {
  clearHTML()

  // problems

  let row_str = ``
  for (let i = 1; i < OBJECT.problems.length + 1; i++) {
    row_str += `
      <div id='prob-${i}' class='prob'>
        <canvas id='input-${i}' class='canv input' width = '${S}' height = '${S}'></canvas>
        <canvas id='output-${i}' class='canv output' width = '${S}' height = '${S}'></canvas>
      </div>
      `
  }
  row.innerHTML = row_str

  // layers
  for (let i = 1; i < 3; i++) {
    let input = i == 1
    let sym = input ? "i" : "o"
    let arr = input ? ACTIVE.input_items : ACTIVE.output_items

    for (let j = 1; j < STATE.num_layers[i - 1] + 1; j++) {
      // layer boxes
      let x = sym + j
      if (j < 10) {
        x = sym + '0' + j
      }
      let dims = input ? ACTIVE.input_dims[j-1] : ACTIVE.output_dims[j-1]

      let box_str = `
        <div class = 'box'>
          <h1 id='title-${x}' class = 'title'> Layer ${j} </h2>
          <div class = 'panorama'>

            <div class = 'exp h'>
              <button id='exp-0-min-${x}' class = 'exp-btn min'> - </button>
              <p id='exp-0-${x}' class = 'exp-num'> ${dims[0]} </p>
              <button id='exp-0-plu-${x}' class = 'exp-btn plu'> + </button>
            </div>

            <div class = 'flex'>

              <div class = 'exp v'>
                <button id='exp-3-plu-${x}' class = 'exp-btn plu'> + </button>
                <p id='exp-3-${x}' class = 'exp-num'> ${dims[3]} </p>
                <button id='exp-3-min-${x}' class = 'exp-btn min'> - </button>
              </div>

              <canvas id='${x}' class='canv ${sym}' width='${S}' height='${S}'></canvas>

              <div class = 'exp v'>
                <button id='exp-1-plu-${x}' class = 'exp-btn plu'> + </button>
                <p id='exp-1-${x}' class = 'exp-num'> ${dims[1]} </p>
                <button id='exp-1-min-${x}' class = 'exp-btn min'> - </button>
              </div>

            </div>

            <div class = 'exp h'>
              <button id='exp-2-min-${x}' class = 'exp-btn min'> - </button>
              <p id='exp-2-${x}' class = 'exp-num'> ${dims[2]} </p>
              <button id='exp-2-plu-${x}' class = 'exp-btn plu'> + </button>
            </div>

          </div>
          <div class = 'toolbar' id = 'toolbar-${x}'>
            <button class ='reset del ac' id = 'reset-${x}'> AC </button>
            <div class = 'colors'>
              <div class = 'color c1'></div>
              <div class = 'color c2'></div>
              <div class = 'color c3'></div>
              <div class = 'color c4'></div>
              <div class = 'color c5'></div>
              <div class = 'color c6'></div>
              <div class = 'color c7'></div>
              <div class = 'color c8'></div>
              <div class = 'color c0'></div>
              <div class = 'color c9'>
                <img src = 'assets/null.png' alt = 'null' class = 'null'>
              </div>
            </div>
          </div>
        </div>
        `

      let items_str = `
        <div class = 'bar'>
        <div id = 'items-${x}' class = 'items'>
        `

      // organize items
      let items = []
      for (let k = 0; k < arr.length; k++) {
        let item = arr[k]
        if (items[item.group-1] == null) {
          items[item.group-1] = [item]
        } else {
          items[item.group-1].push(item)
        }
      }

      // add items

      for (let k = 0; k < items.length; k++){
        if (items[k]){
          let temp = items[k][0]
          let y = temp.sym + temp.group
          if (temp.group < 10) {
            y = temp.sym + '0' + temp.group
          }
          let name = findDict(ACTIVE.names, y)

          if (temp.layer == j) {

            items_str +=
              `
              <div id = 'group-${y}' class = 'group'>
                <div id = 'shelf-${y}' class = 'shelf'>
              `

            for (let v = 0; v < items[k].length; v++){
              let item = items[k][v]

              items_str +=
                `<canvas id = 'item-${y}-${item.n}' class = 'item' width = '${S}' height = '${S}'> </canvas>`
            }

            items_str +=
              `
                    <div id = 'group_add_${y}_${j}' class = 'group_add'> + </div>
                  </div>
                <input id = 'label-${y}' class = 'label' value = '${name}'>
              </div>
              `
          }
        }
      }

      items_str +=
        `
        </div>
        <div class = 'buttons'>
          <button id = 'add-item-${x}' class = 'add add-item item-btn'> Add </button>
          <button id = 'del-item-${x}' class = 'del del-item item-btn'> Del </button>
          <button id = 'clear-${x}' class = 'clear ac item-btn'> AC </button>
        </div>
        </div>
        `

      let str = i == 1 ? box_str + items_str : items_str + box_str

      Class("layers")[i - 1].innerHTML +=
        `<div id='layer-${x}' class='layer'> ` + str + `</div>`

      // thumbnails

      Class("thumbnails")[i - 1].innerHTML += `<canvas id="thumbnail-${x}"
      class="thumbnail" width = '${S}' height = '${S}'></canvas>`
    }
    Class("thumbnails")[i - 1].innerHTML += `
       <div class = 'buttons'>
          <button id = 'add-layer-${sym}' class = 'add add-layer layer-btn'> + </button>
          <button id = 'del-layer-${sym}' class = 'del del-layer layer-btn'> - </button>
        </div>
      `
  }
}

// highlight the active objects
function setActive() {

  let i_id = STATE.active_layers[0]
  if (i_id < 10) {
    i_id = '0' + i_id
  }

  let o_id = STATE.active_layers[1]
  if (o_id < 10) {
    o_id = '0' + o_id
  }

  // layers
  for (let i = 0; i < Class("layer").length; i++) {
    let div = Class("layer")[i]
    deactivate(div)
  }
  activate(Id(`layer-i${i_id}`))
  activate(Id(`layer-o${o_id}`))

  // thumbnails
  for (let i = 0; i < Class("thumbnail").length; i++) {
    let div = Class("thumbnail")[i]
    deactivate(div)
  }
  activate(Id(`thumbnail-i${i_id}`))
  activate(Id(`thumbnail-o${o_id}`))

  // problem
  for (let i = 0; i < Class("prob").length; i++) {
    let div = Class("prob")[i]
    deactivate(div)
  }
  activate(Id(`prob-${STATE.active_prob}`))

  // items
  for (let i = 0; i < Class('item').length; i++){
    let div = Class('item')[i]
    deactivate(div)
  }

  activate(Id(`item-${STATE.active_item}`))

  for (let i = 0; i < ACTIVE.links.length; i++) {
    let pair = ACTIVE.links[i]
    if (pair[0] == STATE.active_item) {
      activate(Id(`item-${pair[1]}`))
    }
    if (pair[1] == STATE.active_item) {
      activate(Id(`item-${pair[0]}`))
    }
  }
}

//______________________________________  DRAW  ______________________________________\\


// draw problems on canvases
function drawProblems() {

  // problems
  for (let i = 0; i < OBJECT.problems.length; i++) {
    let prob = OBJECT.problems[i]
    let icanv = Id(`input-${i + 1}`)
    let ocanv = Id(`output-${i + 1}`)
    if (icanv && ocanv) {
      let itx = icanv.getContext("2d")
      let otx = ocanv.getContext("2d")
      drawProblem(prob.input, itx)
      drawProblem(prob.output, otx)
    }
  }

  // squares
  drawProblem(ACTIVE.prob.input, Id("i").getContext("2d"))
  drawProblem(ACTIVE.prob.output, Id("o").getContext("2d"))

  // layers
  for (let i = 0; i < 2; i++) {
    let input = i == 0
    let sym = input ? "i" : "o"
    let arr = input ? ACTIVE.input : ACTIVE.output
    let items = input ? ACTIVE.input_items : ACTIVE.output_items
    let dims = input ? ACTIVE.input_dim : ACTIVE.output_dim
    for (let j = 0; j < arr.length; j++) {
      let grid = arr[j]
      let i_id = j + 1
      if (i_id < 10) {
        i_id = '0' + i_id
      }
      let ctx = Id(`${sym}${i_id}`).getContext("2d")
      drawProblem(grid, ctx)
      drawProblem(grid, Id(`thumbnail-${sym}${i_id}`).getContext("2d"))
      drawBounds(grid, items, ctx)
    }
  }

  // stacked
  for (let k = 0; k < 2; k++) {
    let prob = OBJECT.problems[STATE.active_prob - 1]
    let input = k == 0
    let sym = input ? "i" : "o"
    let grid = input? prob.input : prob.output
    let arr = input ? ACTIVE.input : ACTIVE.output
    let dims = input ? ACTIVE.input_dims : ACTIVE.output_dims
    let stacked = emptyGrid(grid, null)

    for (let v = 0; v < arr.length; v++){
      let layer = arr[v]
      let dim = dims[v]

      for (let i = 0; i < grid.length; i++){
        for (let j = 0; j < grid[i].length; j++){
          let i1 = i + dim[0]
          let j1 = j + dim[3]
          let val = layer[i1][j1]
          if (val != null) {
            stacked[i][j] = val
          }
        }
      }
    }

    let canv = Id(`preview-${sym}`)
    let ctx = canv.getContext('2d')

    if (!equalsGrid(stacked, grid)) {
      canv.classList.add('incorrect')
    } else {
      canv.classList.remove('incorrect')
    }

    drawProblem(stacked, ctx, 0.5)
  }

}

// draw grid on canvas
function drawProblem(grid, ctx, alpha = 1) {

  let width = grid[0].length
  let height = grid.length

  let c = (S * 0.9) / Math.max(width, height)
  let xm = (S - c * width) / 2
  let ym = (S - c * height) / 2

  ctx.globalAlpha = alpha
  ctx.clearRect(0, 0, S, S)
  ctx.strokeStyle = "#909090"
  ctx.lineWidth = 0.3


  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      ctx.fillStyle = colorCell(grid[i][j])
      ctx.fillRect(xm + c * j, ym + c * i, c, c)
      ctx.strokeRect(xm + c * j, ym + c * i, c, c)
    }
  }

  /*
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      let i1 = i - dims[0]
      let j1 = j - dims[3]

      if (i < dims[0] || i > grid.length-1 + dims[0] ||
        j < dims[3] || j > grid[0].length-1 + dims[3]) {
        ctx.fillStyle = colorCell(null)
      } else {
        ctx.fillStyle = colorCell(grid[i1][j1])
      }
      ctx.fillRect(xm + c * j, ym + c * i, c, c)
      ctx.strokeRect(xm + c * j, ym + c * i, c, c)
    }
  }
  */

  ctx.globalAlpha = 1
}

function drawBounds(grid, items, ctx) {

  let width = grid[0].length
  let height = grid.length

  let c = (S * 0.9) / Math.max(width, height)
  let xm = (S - c * width) / 2
  let ym = (S - c * height) / 2

  // determine bounds

  let data = []
  for (let k = 0; k < items.length; k++) {

    let item = items[k]
    let id = item.sym + item.group + '-' + item.n
    let d = [item]

    for (let v = 0; v < item.coords.length; v++){

      let coord = item.coords[v]
      let i = coord[0]
      let j = coord[1]

      // top, right, bottom, left
      let cardinal = [true, true, true, true]

      for (let t = 0; t < item.coords.length; t++){
        let coord2 = item.coords[t]
        let i2 = coord2[0]
        let j2 = coord2[1]

        if (i2 == i) {
          if (j2 == j + 1) {
            cardinal[1] = false
          } else if (j2 == j - 1) {
            cardinal[3] = false
          }
        }

        if (j2 == j) {
          if (i2 == i + 1) {
            cardinal[2] = false
          } else if (i2 == i - 1){
            cardinal[0] = false
          }
        }
      }
      d.push([[i, j], cardinal])
    }
    data.push(d)
  }

  // draw bounds

  for (let k = 0; k < data.length; k++){
    let d = data[k]
    let item = d[0]
    let id = item.sym + item.group + '-' + item.n
    if (item.group < 10) {
      id = item.sym + '0' + item.group + '-' + item.n
    }
    let n = item.sym == "i" ? 0 : 1
    for (let v = 1; v < d.length; v++){
      let coord = d[v][0]
      let cardinal = d[v][1]
      let i = coord[0]
      let j = coord[1]
      let left = xm + c * j
      let right = left + c
      let top = ym + c * i
      let bottom = top + c
      if (item.layer == STATE.active_layers[n]) {

        ctx.strokeStyle = "#909090"
        ctx.lineWidth = 5

        let linked = null

        for (let k = 0; k < ACTIVE.links.length; k++){
          let pair = ACTIVE.links[k]
          for (let t = 0; t < 2; t++){
            let t2 = t == 0 ? 1 : 0
            if (pair[t] == STATE.active_item) {
              linked = pair[t2]
            }
          }
        }

        if (STATE.active_item == id ||
            linked == id) {
          ctx.strokeStyle = "black"
          ctx.lineWidth = 6
        }

        ctx.beginPath()
        ctx.lineCap = 'round'
        if (cardinal[0]) {
          ctx.moveTo(left, top)
          ctx.lineTo(right, top)
        }
        if (cardinal[1]) {
          ctx.moveTo(right, top)
          ctx.lineTo(right, bottom)
        }
        if (cardinal[2]) {
          ctx.moveTo(left, bottom)
          ctx.lineTo(right, bottom)
        }
        if (cardinal[3]) {
          ctx.moveTo(left, top)
          ctx.lineTo(left, bottom)
        }
        ctx.closePath()
        ctx.stroke()
      }
    }
  }

  for (let k = 0; k < data.length; k++){
    let d = data[k]
    let item = d[0]
    let id = item.sym + item.group + '-' + item.n
    let n = item.sym == "i" ? 0 : 1
    for (let v = 1; v < d.length; v++){
      let coord = d[v][0]
      let cardinal = d[v][1]
      let i = coord[0]
      let j = coord[1]
      let left = xm + c * j
      let right = left + c
      let top = ym + c * i
      let bottom = top + c
      if (item.layer == STATE.active_layers[n]) {
        ctx.strokeStyle = "white"
        ctx.lineWidth = 3
        if (STATE.active_item == id){
          ctx.strokeStyle = "white"
          ctx.lineWidth = 4
        }
        ctx.beginPath()
        ctx.lineCap = 'round'
        if (cardinal[0]) {
          ctx.moveTo(left, top)
          ctx.lineTo(right, top)
        }
        if (cardinal[1]) {
          ctx.moveTo(right, top)
          ctx.lineTo(right, bottom)
        }
        if (cardinal[2]) {
          ctx.moveTo(left, bottom)
          ctx.lineTo(right, bottom)
        }
        if (cardinal[3]) {
          ctx.moveTo(left, top)
          ctx.lineTo(left, bottom)
        }
        ctx.closePath()
        ctx.stroke()
      }
    }
  }
}

// draw items
function drawItems() {
  for (let k = 0; k < 2; k++){
    let input = k == 0
    let items = input ? ACTIVE.input_items : ACTIVE.output_items
    let arr = input ? ACTIVE.input_layer : ACTIVE.output_layer
    for (let i = 0; i < items.length; i++){
      let item = items[i]
      let id = item.sym + item.group + '-' + item.n
      if (item.group < 10) {
        id = item.sym + '0' + item.group + '-' + item.n
      }
      let canv = Id(`item-${id}`)
      let ctx = canv.getContext('2d')
      drawItem(arr, item.coords, ctx)

    }
  }
}

function drawItem(grid, coords, ctx) {

  let b = {
    xmin: grid[0].length,
    xmax: 0,
    ymin: grid.length,
    ymax: 0,
  };

  for (let k = 0; k < coords.length; k++){
    let coord = coords[k]
    let i = coord[0]
    let j = coord[1]

    if (i < b.ymin) {
      b.ymin = i;
    }
    if (i > b.ymax) {
      b.ymax = i;
    }
    if (j < b.xmin) {
      b.xmin = j;
    }
    if (j > b.xmax) {
      b.xmax = j;
    }
  }

  // draw

  let width = b.xmax - b.xmin + 1;
  let height = b.ymax - b.ymin + 1;

  let c = (S * 0.9) / Math.max(width, height);
  let xm = (S - c * width) / 2;
  let ym = (S - c * height) / 2;
  ctx.clearRect(0, 0, S, S);

  for (let k = 0; k < coords.length; k++) {
    let i = coords[k][0];
    let j = coords[k][1];
    let i2 = i - b.ymin;
    let j2 = j - b.xmin;

    if (grid[i][j] || grid[i][j] == 0) {
      ctx.fillStyle = colorCell(grid[i][j]);
      console.log(grid[i][j], ctx.fillStyle)
      ctx.strokeStyle = "#d0d0d0";
      ctx.fillRect(xm + c * j2, ym + c * i2, c, c);
      ctx.strokeRect(xm + c * j2, ym + c * i2, c, c);
    }
  }
}

// change bounds
function changeBounds(d) {

  let [dir, pm, dims, panel, items] =
    [d.dir, d.pm, d.dims, d.panel, d.items]

  let empty_row = []
    for (let j = 0; j < panel[0].length; j++){
      empty_row.push(null)
    }

  if (pm == 'p') {

    dims[dir]++

    switch (dir) {

      case 0: // top
        panel.splice(0, 0, empty_row)
        // move everything else
        for (let i = 0; i < items.length; i++){
            let coords = items[i].coords
            for (let j = 0; j < coords.length; j++){
              coords[j][0] ++
            }
          }
          break

      case 1: // right
          for (let i = 0; i < panel.length; i++) {
            let row = panel[i]
            row.push(null)
          }
          break

      case 2: // bottom
          panel.push(empty_row)
          break

      case 3: // left
          for (let i = 0; i < panel.length; i++) {
            let row = panel[i]
            row.splice(0,0,null)
          }
          // move everything else
          for (let i = 0; i < items.length; i++){
            let coords = items[i].coords
            for (let j = 0; j < coords.length; j++){
              coords[j][1] ++
            }
          }
          break

      default:
          break
      }

  } else if (dims[dir] > 0) {

      dims[dir]--

    switch (dir) {

      case 0: // top

          // delete cells
          panel.splice(0, 1)
          // delete items
          for (let i = 0; i < items.length; i++){
            let coords = items[i].coords
            let to_del = []
            for (let j = 0; j < coords.length; j++){
              if (coords[j][0] == 0) {
                to_del.push(j)
              }
            }
            for (let j = 0; j < to_del.length; j++){
              coords.splice(to_del[j], 1)
              for (let v = j; v < to_del.length; v++){
                to_del[v] --
              }
            }
            // move everything else
            for (let j = 0; j < coords.length; j++){
              coords[j][0] --
            }
          }
          break

      case 1: // right

          // delete cells
          for (let i = 0; i < panel.length; i++) {
            let row = panel[i]
            row.splice(row.length-1, 1)
          }
          // delete items
          for (let i = 0; i < items.length; i++){
            let coords = items[i].coords
            let to_del = []
            for (let j = 0; j < coords.length; j++){
              if (coords[j][1] == panel[0].length) {
                to_del.push(j)
              }
            }
            for (let j = 0; j < to_del.length; j++){
              coords.splice(to_del[j], 1)
              for (let v = j; v < to_del.length; v++){
                to_del[v] --
              }
            }
          }
          break

      case 2: // bottom

          // delete cells
          panel.splice(panel.length - 1, 1)
          // delete items
          for (let i = 0; i < items.length; i++){
            let coords = items[i].coords
            let to_del = []
            for (let j = 0; j < coords.length; j++){
              if (coords[j][0] == panel.length) {
                to_del.push(j)
              }
            }
            for (let j = 0; j < to_del.length; j++){
              coords.splice(to_del[j], 1)
              for (let v = j; v < to_del.length; v++){
                to_del[v] --
              }
            }
          }
          break

      case 3: // left

          // delete cells
          for (let i = 0; i < panel.length; i++) {
            let row = panel[i]
            row.splice(0,1)
          }
          // delete items
          for (let i = 0; i < items.length; i++){
            let coords = items[i].coords
            let to_del = []
            for (let j = 0; j < coords.length; j++){
              if (coords[j][1] == 0) {
                to_del.push(j)
              }
            }
            for (let j = 0; j < to_del.length; j++){
              coords.splice(to_del[j], 1)
              for (let v = j; v < to_del.length; v++){
                to_del[v] --
              }
            }
            // move everything else
            for (let j = 0; j < coords.length; j++){
              coords[j][1] --
            }
          }
          break

      default:
          break
      }
  }
}
