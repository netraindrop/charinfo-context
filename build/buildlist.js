const fs = require("fs")
const path = require("path")

/**
 * Parses character file content into structured data
 * @param {string} texttx - Content of the character file
 * @returns {object} Parsed character data or error
 */
function ParseContext(texttx) {
  const structureContext = [
    "name", "callname", "gender",
    "icon", "builder", "source",
    "language", "introduction",
    "personality", "moreabouthim",
    "contextchat"
  ]
  const requiredvariable = [
    "name", "callname", "gender",
    "builder", "source",
    "language", "introduction",
    "personality"
  ]
  let dataResponses = {}
  
  // Handle case where texttx might be undefined
  if (!texttx) {
    return { error: new Error("Empty file content") }
  }

  for(let nameContext of String(texttx).split("\n")) {
    const readingLine = String(nameContext || "").trim()
    if(!readingLine || readingLine.startsWith("#")) continue // Skip empty lines and comments
    
    const colonIndex = readingLine.indexOf(':')
    if (colonIndex === -1) continue // Skip lines without colon separator
    
    const variableContext = readingLine.substring(0, colonIndex).trim()
    const valueContext = readingLine.substring(colonIndex + 1).trim()
    
    if(structureContext.includes(variableContext)) {
      let readingAble = valueContext
      if(variableContext === "source") {
        readingAble = readingAble.split(",").map(a => a.trim())
      }
      dataResponses[variableContext] = readingAble
    }
  }
  
  // Check required variables
  for(let reqvar of requiredvariable) {
    if(!Object.keys(dataResponses).includes(reqvar)) {
      return {
        error: new Error(`RequireVariable: Missing required field '${reqvar}'`)
      }
    }
  }
  return dataResponses
}

/**
 * Reads and parses a JSON file
 * @param {string} pathfile - Path to the JSON file
 * @returns {object} Parsed JSON data or error
 */
function readfileGroup(pathfile) {
  try {
    const a = fs.readFileSync(pathfile, "utf-8")
    const b = JSON.parse(a)
    return {
      data: b
    }
  } catch(e) {
    return {
      error: new Error(`Unable reading File: ${pathfile} - ${e.message}`)
    }
  }
}

/**
 * Recursively reads character files from directories
 * @param {string} pathnow - Base directory path
 * @param {Array<string>} joinnerpath - Array of path segments to join
 * @returns {Array<object>} List of character data
 */
function ReadableContext(pathnow, joinnerpath = []) {
  const pathToRead = path.join(pathnow, ...joinnerpath)
  let listPart = []
  
  try {
    const dirEntries = fs.readdirSync(pathToRead)
    
    for(let namect of dirEntries) {
      const pathToReading = path.join(pathToRead, namect)
      
      try {
        const stats = fs.lstatSync(pathToReading)
        
        if(stats.isDirectory()) {
          // Process subdirectory - recursive call
          const subResults = ReadableContext(pathnow, [...joinnerpath, namect])
          listPart = listPart.concat(subResults)
        } else {
          // Process file - only .character files
          if(namect.endsWith('.character')) {
            try {
              // Read Character
              const readfile = fs.readFileSync(pathToReading, "utf-8")
              
              // Get group slug - we should make a copy to not modify the original
              const currentGroup = joinnerpath.length > 0 ? joinnerpath[joinnerpath.length - 1] : ""
              
              // Check if aboutgroup.info exists
              const aboutGroupPath = path.join(pathToRead, "aboutgroup.info")
              let groupInfo = { name: currentGroup } // Default group name
              
              if (fs.existsSync(aboutGroupPath)) {
                const readinfo = readfileGroup(aboutGroupPath)
                if(readinfo.error) {
                  console.warn(`Warning: Error reading group info at ${aboutGroupPath}: ${readinfo.error.message}`)
                } else {
                  groupInfo = readinfo.data
                }
              }
              
              const parsing = ParseContext(readfile)
              if(parsing.error) {
                console.warn(`Warning: Error parsing character ${pathToReading}: ${parsing.error.message}`)
                continue
              }
              
              listPart.push({
                name: parsing.name,
                call: parsing.callname,
                icon: parsing.icon || null,
                group: groupInfo.name,
                creator: parsing.builder,
                gslug: currentGroup,
                date: new Date().getTime(),
                path: joinnerpath.join("/") + "/" + namect
              })
            } catch (fileError) {
              console.warn(`Warning: Error processing character file ${pathToReading}: ${fileError.message}`)
            }
          }
        }
      } catch (statError) {
        console.warn(`Warning: Cannot access ${pathToReading}: ${statError.message}`)
      }
    }
  } catch (dirError) {
    console.error(`Error reading directory ${pathToRead}: ${dirError.message}`)
  }
  
  return listPart
}

/**
 * Builds character list and saves it to a JSON file
 */
function BuildContextList() {
  const start = new Date().getTime()
  const pathnow = path.join(process.cwd(), "data")
  
  // Check if data directory exists
  if (!fs.existsSync(pathnow)) {
    console.error(`Error: Data directory not found at ${pathnow}`)
    return
  }
  
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
  
  const timestamp = new Date().getTime()
  const savefile = path.join(process.cwd(), `list-character-${timestamp}.json`)
  
  try {
    fs.writeFileSync(savefile, JSON.stringify(listLoadChar, null, 2), "utf-8")
    console.log(`Successfully saved character list to ${savefile}`)
    
    console.log(`\n# List Character Builder`)
    console.log(`Total Group: ${listLoadChar.length}`)
    console.log(`----------`)
    
    listLoadChar.forEach(group => {
      console.log(`## ${group.group}`)
      console.log(`Total Character: ${group.list.length}`)
      console.log(`----------`)
    })
    
    console.log(`\nFinish Listing: ${(new Date().getTime() - start)/1000}s`)
  } catch (saveError) {
    console.error(`Error saving character list: ${saveError.message}`)
  }
}

BuildContextList()