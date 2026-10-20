// Licensed fonts are bundled bytes, so receipt rendering needs no writable filesystem or network.
import regular from '../../../assets/fonts/NotoSans-Regular.ttf?inline'
import devanagari from '../../../assets/fonts/NotoSansDevanagari-Regular.ttf?inline'
export function documentFontBytes() {
  return [regular,devanagari].map(value=>{
    if(typeof value!=='string' || !/^data:[^,]*;base64,/.test(value)) throw Error('Bundled document font unavailable')
    return Buffer.from(value.slice(value.indexOf(',')+1),'base64')
  })
}
