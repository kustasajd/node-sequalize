module.exports = {
  removeDuplicates: (data, id) => {
    let unique = []
    data.forEach(element => {
      if (
        unique.filter(item => {
          return item[id] === element[id]
        }).length === 0
      ) {
        unique.push(element)
      }
    })
    return unique
  }
}
