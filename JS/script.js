
//______________________________________  SETUP  ______________________________________\\

let INDEX = 50
let TIME = 0
let SCALE = 1
let RIGHT = 0

let q = "1fad071e";
let r = "150deff5";
let big = "045e512c"
let v = '1b2d62fb'

load(v)
setTimeout(() => {
  window.requestAnimationFrame(loop);
}, 100);

function load(json) {
  loadJson(json);
  TIME = 300
  setTimeout(() => {
    drawHTML();
    setParams();
    setTimeout(() => {
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
  let rect = area.getBoundingClientRect()
  let full_width = window.innerWidth - 180
  let og_width = rect.width / SCALE
  let og_pos = rect.right - RIGHT
  RIGHT = window.innerWidth - 10 - og_pos
  SCALE = full_width / og_width
  area.style.transform = `scale(${SCALE}) translateX(${RIGHT}px)`
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
    sorted.splice(k,0,name)
  }

  // draw panel
  for (let i = 0; i < sorted.length; i++) {
    let name = sorted[i];
    s = `<p class = 'result' id = '${name}'> ${name} </p>` + s;
  }

  pane.innerHTML = s
  pane.scrollTo(0, pane.scrollHeight)
}

drawResults('')

id.onclick = () => {
  activate(pane)
}

id.oninput = () => {
  drawResults(id.value)
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


//______________________________________  LOOP ______________________________________\\

const loop = () => {

  setParams();
  setActive();
  clearCanvases();
  drawProblems();
  download.href = makeTextFile(JSON.stringify(OBJECT));
  download.download = OBJECT.id + "_annotated.json";

  // log

  log.innerHTML =
   `
    STATE <br><br>

    a-prob   = <span> ${STATE.active_prob} </span> <br>
    a-layers = <span> ${STATE.active_layers.join(" ")} </span> <br>
    a-item   = <span> ${STATE.active_item} </span> <br>
    a-color  = <span> ${STATE.active_color} </span> <br> <br>

    <br>

    # layers = <span> ${STATE.num_layers.join(" ")} </span> <br>

    <br>

    linking = <span> ${STATE.linking} </span> <br>
    mouse = <span> ${STATE.mousedown} </span> <br>
    TIME = <span> ${TIME} </span> <br>
    index = <span> ${INDEX} </span> <br>

    coloring = <span> ${STATE.coloring} </span> <br>
    color= <span> ${STATE.color} </span> <br>
    `;


  //_______________________________  SELECT  _______________________________\\

  // menu
  for (let i = 0; i < Class('result').length; i++){
    let div = Class('result')[i]

    div.onclick = () => {
      load(div.id)
    }
  }


  // splash screen
  Id("start").onclick = () => {
    Id("splash").classList.remove("active");
  };

  // link / unlink
  Id("link").onclick = () => {
    STATE.linking = true
    STATE.coloring = false
  }
  Id("unlink").onclick = () => {
    STATE.linking = false
    for (let i = 0; i < ACTIVE.links.length; i++) {
      let pair = ACTIVE.links[i]
      if (pair[0] == STATE.active_item || pair[1] == STATE.active_item) {
        ACTIVE.links.splice(i, 1)
      }
    }
  }

  // linking state
  for (let i = 0; i < Class("item").length; i++) {
    let div = Class("item")[i];

    let a_sym = STATE.active_item.substring(0, 1)
    let sym = div.id.substring(5, 6)

    if (STATE.linking) {
      //Id('area').style.cursor = 'cell'
      if (a_sym != sym) {
        div.classList.add('pending')
      }
    } else {
      div.classList.remove('pending')
    }
  }

  // coloring state
  if (STATE.coloring) {
    Id('ink').classList.add(`c${STATE.color}`)
    Id('ink').classList.add('active')
    document.body.style.cursor = 'none'
  } else {
    Id('ink').classList.remove(`c${STATE.color}`)
    Id('ink').classList.remove('active')
    document.body.style.cursor = 'default'
  }

  for (let i = 0; i < Class('box').length; i++){
    let div = Class('box')[i]
    div.addEventListener('mouseleave', () => {
      STATE.coloring = false
    })
  }

  // coloring cursor
  Id('ink').style.left = M.o.x + 'px'
  Id('ink').style.top = M.o.y + 'px'

  // select layer
  for (let i = 0; i < Class("thumbnail").length; i++) {
    let div = Class("thumbnail")[i];
    let sym = div.id.substring(10, 11);
    let layer = div.id.substring(11)
    if (layer[0] == '0') {
      layer = layer.substring(1)
    }
    layer = JSON.parse(layer)

    let n = sym == "i" ? 0 : 1;

    div.onclick = () => {

      STATE.active_layers[n] = layer

      if (layer < 10) {
        layer = '0' + layer
      }

      let group_div = Id(`items-${sym}${layer}`).firstElementChild
      let y = group_div.id.substring(6)
      let no = group_div.firstElementChild.firstElementChild.id.substring(9)

      STATE.active_item = y + '-' + no
    };
  }

  // select problem
  for (let i = 0; i < Class("prob").length; i++) {
    let div = Class("prob")[i];
    let n = JSON.parse(div.id.substring(5));

    div.onclick = () => {
      STATE.active_prob = n;
      drawHTML()
      setTimeout(() => {
        drawItems()
      }, 50);
    };
  }

  // select item
  for (let i = 0; i < Class('item').length; i++){
    let div = Class('item')[i]
    let id = div.id.substring(5)

    div.onclick = () => {
      if (STATE.linking) {
        if (STATE.active_item != id) {
          ACTIVE.links.push([STATE.active_item, id])
          STATE.linking = false
        }
      } else {
        STATE.active_item = id
      }
    }
  }

  // change name
  for (let i = 0; i < Class('label').length; i++) {
    let div = Class('label')[i]
    let id = div.id.substring(6)

    div.onchange = () => {
      changeDict(ACTIVE.names, id, div.value)
    }
  }

  // select color
  for (let i = 0; i < Class('color').length; i++){
    let div = Class('color')[i]
    let id = JSON.parse(div.classList[1].substring(1))
    if (id == 10) {
      id = null
    }

    div.onclick = () => {

      Id('ink').classList.remove(`c${STATE.color}`)
      STATE.linking = false
      STATE.coloring = true
      STATE.color = id
      Id('ink').classList.add(`c${STATE.color}`)
    }
  }


  //_______________________________  BUTTONS  _______________________________\\

  // reset layer
  for (let k = 0; k < Class('reset').length; k++){
    let div = Class('reset')[k]
    let id = div.id.substring(6, 7)
    let layer = div.id.substring(7)
    if (layer[0] == '0') {
      layer = layer.substring(1)
    }
    layer = JSON.parse(layer)
    div.onclick = () => {
      let prob = OBJECT.problems[STATE.active_prob - 1]
      let input = id == 'i'
      let grid = input ? prob.input : prob.output
      let panel = input ? ACTIVE.input_layer : ACTIVE.output_layer
      let dims = input ? ACTIVE.input_dim : ACTIVE.output_dim
      let items = input ? ACTIVE.input_items : ACTIVE.output_items

      // reset expansions
      for (let i = 0; i < dims.length; i++){
        while (dims[i] > 0) {
          changeBounds(
            {
              dir: i,
              pm: 'm',
              dims: dims,
              panel: panel,
              items: items
            }
          )
        }
      }

      // redraw grid
      if (layer == 1) {
        implantGrid(panel, grid)
      } else {
        let empty = emptyGrid(grid, null)
        implantGrid(panel, empty)
      }
      drawHTML()
      drawProblems()
      drawItems()
    }
  }

  // clear items
  for (let i = 0; i < Class('clear').length; i++) {
    let div = Class('clear')[i]
    let sym = div.id.substring(6, 7)
    let layer = div.id.substring(7)
    if (layer[0] == '0') {
      layer = layer.substring(1)
    }
    layer = JSON.parse(layer)
    let items = sym == 'i' ? ACTIVE.input_items : ACTIVE.output_items

    div.onclick = () => {
      // find minimum item
      let in_layer = []
      let min = null
      for (let j = 0; j < items.length; j++){
        let item = items[j]
        if (item.layer == layer) {
          in_layer.push(j)
          let benchmark = false
          if (min == null) {
            benchmark = true
          } else {
            benchmark = item.group < items[in_layer[min]].group
          }
          if (benchmark && item.n == 1) {
            min = j
          }
        }
      }
      // delete & modify items
      for (let j = 0; j < in_layer.length; j++){
        let index = in_layer[j]
        if (index == min) {
          let item = items[min]
          let id = item.sym + item.group + '-' + item.n
          if (item.group < 10) {
            id = item.sym + '0' + item.group + '-' + item.n
          }
          STATE.active_item = id
          item.coords.splice(0, item.coords.length)
        } else {
          items.splice(index, 1)
          for (let k = j; k < in_layer.length; k++){
            in_layer[k] --
          }
        }
      }
      drawHTML()
      drawItems()
    }
  }

  // add layer
  for (let i = 0; i < Class("add-layer").length; i++) {
    let div = Class("add-layer")[i];
    let sym = div.id.substring(10);
    let input = sym == "i"
    let prob = OBJECT.problems[STATE.active_prob - 1]
    let og_grid = input ? prob.input : prob.output
    let n = input ? 0 : 1;
    let arr = input ? ACTIVE.input : ACTIVE.output;
    let grid = input ? ACTIVE.input_layer : ACTIVE.output_layer;
    let items = input ? ACTIVE.input_items : ACTIVE.output_items;
    let dims = input ? ACTIVE.input_dims : ACTIVE.output_dims;
    let next = input ? ACTIVE.input_next : ACTIVE.output_next
    div.onclick = () => {
      if (STATE.num_layers[n] < 6) {
        arr.push(emptyGrid(og_grid))
        dims.push([0,0,0,0])
        STATE.num_layers[n] += 1
        items.push({
          layer: STATE.num_layers[n],
          sym: sym,
          group: next,
          n: 1,
          coords: [],
        });
        let group = next
        if (group < 10) {
          group = '0' + group
        }
        let key = sym + group
        let name = sym + '-' + group
        ACTIVE.names.push([key,name])
        STATE.active_layers[n] = STATE.num_layers[n]
        STATE.active_item = sym + group + '-' + 1
        drawHTML();
        drawItems()
      } else {
        alert("Maximum of 6 layers")
      }
    };
  }

  // delete layer
  for (let i = 0; i < Class("del-layer").length; i++) {
    let div = Class("del-layer")[i];
    let sym = div.id.substring(10);
    let input = sym == "i";
    let n = input ? 0 : 1;
    let arr = input ? ACTIVE.input : ACTIVE.output;
    let items = input ? ACTIVE.input_items : ACTIVE.output_items;
    let dims = input ? ACTIVE.input_dims : ACTIVE.output_dims;
    div.onclick = () => {
      if (STATE.num_layers[n] > 1 && STATE.active_layers[n] != 1) {
        // delete items
        let to_delete = [];
        for (let j = 0; j < items.length; j++) {
          let item = items[j];
          if (item.layer == STATE.active_layers[n]) {
            to_delete.push(j);
          }
        }
        for (let j = 0; j < to_delete.length; j++) {
          items.splice(to_delete[j], 1);
        }
        // delete layer
        arr.splice(STATE.active_layers[n] - 1, 1);
        dims.splice(STATE.active_layers[n] - 1, 1);
        STATE.active_layers[n] -= 1
        STATE.num_layers[n] -= 1;
        // set new active item
        let layer = STATE.active_layers[n];
        for (let j = 0; j < items.length; j++) {
          let item = items[j];
          if (item.layer == layer) {
            let id = item.sym + item.group + '0' + item.n
            if (item.group < 10) {
              id = item.sym + '0' + item.group + '-' + item.n
            }
            STATE.active_item = id
          } else if (item.layer >= layer) {
            item.layer--
          }
        }
        drawHTML();
        drawItems()
      } else if (STATE.active_layers[n] == 1) {
        alert("You can't delete your base layer.");
      }else{
        alert("You can't delete your only layer!");
      }
    };
  }

  // add item group
  for (let i = 0; i < Class("add-item").length; i++) {
    let div = Class("add-item")[i];
    let sym = div.id.substring(9, 10);
    let layer = div.id.substring(10)
    if (layer[0] == '0') {
      layer = layer.substring(1)
    }
    layer = JSON.parse(layer)
    let arr = sym == "i" ? ACTIVE.input_items : ACTIVE.output_items;
    let next = sym == "i" ? ACTIVE.input_next : ACTIVE.output_next
    let n = sym == "i" ? 0 : 1;
    div.onclick = () => {
      arr.push({
        layer: layer,
        sym: sym,
        group: next,
        n: 1,
        coords: [],
      });
      let group = next
      let key = sym + group
      let name = sym + '-' + group
      let id = sym + group + '-' + 1
      if (group < 10) {
        key = sym + '0' + group
        name = sym + '-0' + group
        id = sym + '0' + group + '-' + 1
      }
      ACTIVE.names.push([key, name])
      drawHTML();
      drawItems()
      STATE.active_item = id
    };
  }


  // delete item / item group
  for (let i = 0; i < Class("del-item").length; i++) {
    let div = Class("del-item")[i];
    let sym = div.id.substring(9, 10);
    let layer = div.id.substring(10)
    if (layer[0] == '0') {
      layer = layer.substring(1)
    }
    layer = JSON.parse(layer)
    let arr = sym == "i" ? ACTIVE.input_items : ACTIVE.output_items;
    let n = sym == "i" ? 0 : 1;
    div.onclick = () => {
      let split = STATE.active_item.split('-')
      let a_sym = split[0][0]
      let a_group = split[0].substring(1)
      if (a_group[0] == '0') {
        a_group = a_group.substring(1)
      }
      a_group = JSON.parse(a_group)
      let a_n = split[1]
      let index = 0
      let in_group = []
      let in_layer = []
      for (let j = 0; j < arr.length; j++){
        let item = arr[j]
        if (item.sym == a_sym && item.group == a_group && item.n == a_n) {
          index = j
          for (let k = 0; k < arr.length; k++) {
            let item2 = arr[k]
            let id = item2.sym + item2.group + '-' + item2.n
            if (item2.group < 10) {
              id = item2.sym + '0' + item2.group + '-' + item2.n
            }
            if (j != k) {
              if (item.group == item2.group && item.n != item2.n) {
                in_group.push(id)
              }
              if (item.layer == item2.layer) {
                in_layer.push(id)
              }
            }
          }
        }
      }
      if (in_group.length > 0) {
        arr.splice(index, 1)
        STATE.active_item = in_group[in_group.length - 1]
      } else if (in_layer.length > 0) {
        arr.splice(index, 1)
        STATE.active_item = in_layer[in_layer.length-1]
      } else {
        alert('You must have at least one item in a layer.')
      }
      drawHTML()
      drawItems()
    };
  }

  // add item
  for (let i = 0; i < Class("group_add").length; i++) {
    let div = Class("group_add")[i];
    let split = div.id.split('_')
    let sym = split[2][0]
    let group = split[2].substring(1)
    if (group[0] == '0') {
      group = group.substring(1)
    }
    group = JSON.parse(group)
    let layer = split[3]
    if (layer[0] == '0') {
      layer = layer.substring(1)
    }
    layer = JSON.parse(layer)
    let arr = sym == "i" ? ACTIVE.input_items : ACTIVE.output_items;
    let n = sym == "i" ? 0 : 1;
    div.onclick = () => {
      let num = 1;
      for (let j = 0; j < arr.length; j++) {
        if (arr[j].group == group) {
          num += 1;
        }
      }
      arr.push({
        layer: layer,
        sym: sym,
        group: group,
        n: num,
        coords: [],
      });
      drawHTML();
      drawItems()
      let id = sym + group + '-' + num
      if (group < 10) {
        id = sym + '0' + group + '-' + num
      }
      STATE.active_item = id
    };
  }

  //_______________________________  EXPAND  _______________________________\\

  // expand layer
  for (let k = 0; k < Class('exp-btn').length; k++){
    let div = Class('exp-btn')[k]
    let dir = JSON.parse(div.id.substring(4, 5))
    let pm = div.id.substring(6, 7)
    let sym = div.id.substring(10, 11)
    let layer = div.id.substring(11)
    if (layer[0] == '0') {
      layer = layer.substring(1)
    }
    layer = JSON.parse(layer)
    let input = sym == 'i'
    let dims = input ? ACTIVE.input_dim : ACTIVE.output_dim
    let panel = input ? ACTIVE.input_layer : ACTIVE.output_layer
    let items = input ? ACTIVE.input_items : ACTIVE.output_items
    div.onclick = () => {

      changeBounds(
        {
          dir: dir,
          pm: pm,
          dims: dims,
          panel: panel,
          items: items
        }
      )

      drawHTML()
      drawItems()
    }
  }


  //_______________________________  GRID  _______________________________\\

  let arr = [
    {
      grid: ACTIVE.input_layer,
      items: ACTIVE.input_items,
      m: M.in,
      ctx: SPEC.in.ctx,
    },
    {
      grid: ACTIVE.output_layer,
      items: ACTIVE.output_items,
      m: M.out,
      ctx: SPEC.out.ctx,
    },
  ];

  // draw
  for (let k = 0; k < 2; k++) {
    let input = k == 0
    let grid = input ? ACTIVE.input_layer : ACTIVE.output_layer
    let m = input ? M.in : M.out
    let ctx = input ? SPEC.in.ctx : SPEC.out.ctx
    let items = input ? ACTIVE.input_items : ACTIVE.output_items
    let sym = input ? 'i' : 'o'

    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        let cell = grid[i][j];
        let width = grid[0].length;
        let height = grid.length;
        let c = (S * 0.9) / Math.max(width, height);
        let xm = (S - c * width) / 2;
        let ym = (S - c * height) / 2;
        let xs = xm + c * j;
        let ys = ym + c * i;

        if (hover(xs, ys, c, m.x, m.y)) {
          ctx.lineWidth = 3;
          ctx.strokeStyle = "#ffce00";
          ctx.strokeRect(xs, ys, c, c);

          if (STATE.mousedown && !STATE.clicked.includes(sym + '-' + i + '@' + j)) {

            // linked item
            let LINKED = null
            for (let k = 0; k < ACTIVE.links.length; k++){
              let pair = ACTIVE.links[k]
              for (let t = 0; t < 2; t++){
                let t2 = t == 0 ? 1 : 0
                if (pair[t] == STATE.active_item) {
                  let o_id = pair[t2]
                  let split = o_id.split('-')
                  let sym = split[0][0]
                  let group = split[0].substring(1)
                  if (group[0] == 0) {
                    group = group.substring(1)
                  }
                  group = JSON.parse(group)
                  n = JSON.parse(split[1])
                  let o = {
                    sym: sym,
                    group: group,
                    n: n
                  }
                  for (let v = 0; v < items.length; v++){
                    let item = items[v]
                    if (item.sym == o.sym && item.group == o.group && item.n == o.n) {
                      LINKED = item
                    }
                  }
                }
              }
            }
            // coloring movde
            if (STATE.coloring) {
              grid[i][j] = STATE.color
              drawProblems()
            // drawing mode
            } else {
              if (sym == STATE.active_item.substring(0, 1)) {
                STATE.clicked.push(sym + '-' + i + '@' + j)
                let index = includesArray(ACTIVE.item.coords, [i, j])
                if (index == null) {
                  ACTIVE.item.coords.push([i, j])
                } else {
                  ACTIVE.item.coords.splice(index, 1)
                }
                drawItems()
              } else if (LINKED != null) {
                  STATE.clicked.push(LINKED.sym + '-' + i + '@' + j)
                  let index = includesArray(LINKED.coords, [i, j])
                  if (index == null) {
                    LINKED.coords.push([i, j])
                  } else {
                    LINKED.coords.splice(index, 1)
                  }
                drawItems()
              }
            }
          }
        }
      }
    }
  }

  window.requestAnimationFrame(loop);

  resizeArea()
};