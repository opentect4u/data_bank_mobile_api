export const removeIndexes = (arr, indexes) => {
  let array = arr
  let indexesToRemove = indexes
  indexesToRemove.sort((a, b) => b - a)
  indexesToRemove.forEach(index => {
    array.splice(index, 1)
  })
  return array
}
