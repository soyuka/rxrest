export function objectToMap(map: URLSearchParams | Headers, item: any): any {
  for (let key in item) {
    if (Array.isArray(item[key])) {
      for (let i = 0; i < item[key].length; i++) {
        map.append(key, item[key][i])
      }
    } else {
      map.append(key, item[key])
    }
  }

  return map
}
