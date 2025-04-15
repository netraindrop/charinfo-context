const fs = require("fs")
const path = require("path")

function ParseContext(texttx) {
  const structureContext = [
    "name","callname","gender",
    "icon","builder","source",
    "language","introduction",
    "personality","moreabouthim",
    "contextchat"
  ]
  const requiredvariable = [
    "name","callname","gender",
    "builder","source",
    "language","introduction",
    "personality"
  ]
  let dataResponses = {}
  for(let nameContext of String(texttx||"").split("\n")) {
    const readingLine = String(nameContext||"").trim()
    const variableContext = String(readingLine?.split(":")[0]||"")?.trim()
    const valueContext = readingLine?.split(":")?.slice(1)?.join(":")
    if(!readingLine.startsWith("#")) {
      if(structureContext.includes(variableContext)) {
        let readingAble = String(valueContext||"").trim()
        if(variableContext === "source") {
          readingAble = readingAble.split(",").map(a => a.trim())
        }
        dataResponses[variableContext] = readingAble
      }
    }
  }
  for(let reqvar of requiredvariable) {
    if(!Object.keys(dataResponses).includes(reqvar)) {
      return {
        error: new Error("RequireVariable")
      }
    }
  }
  return dataResponses
}
function readfileGroup(pathfile) {
  try {
    const a = fs.readFileSync(pathfile,"utf-8")
    const b = JSON.parse(a)
    return {
      data: b
    }
  } catch(e) {
    return {
      error: new Error("Unablereading File:"+e.message)
    }
  }
}
function ReadableContext(pathnow, joinnerpath = []) {
  const pathToRead = path.join(pathnow, ...joinnerpath)
  let listPart = []
  for(let namect of fs.readdirSync(pathToRead)) {
    const pathToReading = path.join(pathToRead, namect)
    if(fs.lstatSync(pathToReading).isDirectory()) {
      const _reading = ReadableContext(pathnow, [...joinnerpath, namect])
      for(let _a of _reading) {
        listPart.push(_a)
      }
    } else {
      if(namect.split(".").pop() === "character") {
        // Read Character
        const readfile = fs.readFileSync(pathToReading, "utf-8")
        const readinfo = readfileGroup(path.join(pathToRead, "aboutgroup.info"))
        const parseing = ParseContext(readfile)
        if(readinfo.error) {
          throw readinfo.error
        }
        if(parseing.error) {
          throw parseing.error
        }
        listPart.push({
          name: parseing.name,
          call: parseing.callname,
          icon: parseing.icon,
          group: readinfo.data.name,
          creator: parseing.builder,
          gslug: joinnerpath.pop(),
          date: new Date().getTime(),
          path: `${joinnerpath.join("/")}/${namect}`
        })
      }
    }
  }
  return listPart
}
function BuildContextList() {
  const start = new Date().getTime()
  const pathnow = path.join(process.cwd(), "data")
  const readableList = ReadableContext(pathnow, [])
  let loadByGroup = {}
  readableList.forEach(a => {
    if(!loadByGroup[a.gslug]) {
      loadByGroup[a.gslug] = {
        group: a.group,
        list: []
      }
    }
    loadByGroup[a.gslug].list.push({
      name: a.name,
      call: a.call,
      icon: a.icon,
      date: a.date,
      creator: a.creator,
      path: a.path,
    })
  })
  let listLoadChar = []
  for(let keys of Object.keys(loadByGroup)) {
    listLoadChar.push(loadByGroup[keys])
  }
  const savefile = path.join(process.cwd(), `list-character-${new Date().getTime()}.json`)
  fs.writeFileSync(savefile, JSON.stringify(listLoadChar,null,2),"utf-8")
  console.log(`# List Character Builder
Total Group: ${listLoadChar.length}
----------
${listLoadChar.map(a => (`## ${a.group}
Total Character: ${a.list.length}
----------`))}`)
  console.log(`\nFinish Listing: ${(new Date().getTime() - start)/1000}s`)
}
BuildContextList()