'use client'
import { useEffect, useRef } from 'react'
import styles from './site-scroll-progress.module.css'

export default function SiteScrollProgress(){
  const bar=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    let frame=0
    const update=()=>{
      window.cancelAnimationFrame(frame)
      frame=window.requestAnimationFrame(()=>{
        const max=Math.max(0,document.documentElement.scrollHeight-window.innerHeight)
        const fraction=max===0?0:Math.max(0,Math.min(1,window.scrollY/max))
        if(bar.current)bar.current.style.transform=`scaleX(${fraction})`
      })
    }
    update()
    window.addEventListener('scroll',update,{passive:true})
    window.addEventListener('resize',update)
    return ()=>{window.cancelAnimationFrame(frame);window.removeEventListener('scroll',update);window.removeEventListener('resize',update)}
  },[])
  return <div className={styles.track} aria-hidden="true"><div className={styles.progress} ref={bar}/></div>
}
