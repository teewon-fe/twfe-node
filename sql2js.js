function sql2js (str) {
  return str.replace(/_(\w)/gm, (m, p1)=>{
    return p1.toUpperCase() 
  })
}