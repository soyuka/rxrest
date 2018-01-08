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

/**
 * UUID generator https://gist.github.com/jed/982883
 */
export function uuid(a: any = '', b: any = '') {
  for (; a++ < 36; b += a * 51 & 52 ? (
    a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4
  ).toString(16) : '-') {
    //
  }
  return b
}
