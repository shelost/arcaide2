function Id(arg) {
  return document.getElementById(arg);
}

function Class(arg) {
  return document.getElementsByClassName(arg);
}

function Tag(arg) {
  return document.getElementsByTagName(arg);
}

function El(arg) {
  return document.createElement(arg);
}

function TextNode(arg) {
  return document.createTextNode(arg);
}

function Contains(el, arg) {
  return el.classList.contains(arg);
}

function Add(elem, args) {
  for (let i = 0; i < args.length; i++) {
    elem.appendChild(args[i]);
  }
}

function Classes(elem, arg) {
  var arr = arg.split(" ");

  for (let i = 0; i < arr.length; i++) {
    elem.classList.add(arr[i]);
  }
}

function parse(arg) {
  return JSON.parse(arg);
}

function random(arg) {
  return Math.random() * arg;
}

function floor(arg) {
  return Math.floor(arg);
}

function string(arg) {
  return JSON.stringify(arg);
}

function round(arg) {
  return Math.round(arg);
}

function Search(searchID) {
  if (searchID.length == 6 && !isNaN(searchID)) {
    window.location.search = "id=" + searchID;
  }
}

function trim(arg) {
  return arg.split(" ").join("");
}

function max(arr) {
  if (arr.length == 0) {
    return 0;
  }
  let max = arr[0];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}

function activate(d) {
  d.classList.add("active");
}

function deactivate(d) {
  d.classList.remove("active");
}

function includesArray(big, small) {
  if (big.length == 0 || small.length == 0) {
    return null
  }
  for (let i = 0; i < big.length; i++){
    let little = big[i]
    let match = true
    if (little.length != small.length) {
      match = false
    }
    for (let j = 0; j < big[i].length; j++){
      if (little[j] != small[j]) {
        match = false
      }
    }
    if (match) return i
  }
  return null
}

function findDict(dict, key) {
  for (let i = 0; i < dict.length; i++){
    let entry = dict[i]
    if (entry[0] == key) {
      return entry[1]
    }
  }
  return null
}

function changeDict(dict, key, value) {
  for (let i = 0; i < dict.length; i++){
    let entry = dict[i]
    if (entry[0] == key) {
      entry[1] = value
    }
  }
}

function implantGrid(target, source) {
  for (let i = 0; i < source.length; i++){
    for (let j = 0; j < source[i].length; j++){
      target[i][j] = source[i][j]
    }
  }
}

function equalsGrid(first, second) {
  if (first.length != second.length) {
    return false
  }
  for (let i = 0; i < first.length; i++){
    for (let j = 0; j < first[i].length; j++){
      if (first[i][j] != second[i][j]) {
        return false
      }
    }
  }
  return true
}