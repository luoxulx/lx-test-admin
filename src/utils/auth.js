import Cookies from 'js-cookie'
const TempJWTKey = 'temp_jwt_token'
export function getJWTToken() {
  return Cookies.get(TempJWTKey)
}

export function setJWTToken(value) {
  return Cookies.set(TempJWTKey, value)
}

export function removeJWTToken() {
  return Cookies.remove(TempJWTKey)
}

export function setNowUserInfo(value) {
  return Cookies.set('now_user_info', value)
}

export function removeUserInfo() {
  return Cookies.remove('now_user_info')
}

export function getNowUserInfo() {
  return Cookies.get('now_user_info')
}

