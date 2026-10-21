'use client'
import { useEffect } from 'react'

export default function HomeMotionObserver(){
  useEffect(()=>{
    const root=document.querySelector<HTMLElement>('[data-cm-home]')
    if(!root)return
    const nodes=Array.from(root.querySelectorAll<HTMLElement>('[data-cm-reveal]'))
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if(reduced||!('IntersectionObserver' in window)){
      nodes.forEach(node=>node.setAttribute('data-cm-revealed','1'))
      return
    }
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return
        const node=entry.target as HTMLElement
        node.setAttribute('data-cm-revealed','1')
        observer.unobserve(node)
      })
    },{rootMargin:'0px 0px -25px 0px',threshold:.07})
    nodes.forEach(node=>{
      if(node.getBoundingClientRect().top<window.innerHeight)node.setAttribute('data-cm-revealed','1')
      else observer.observe(node)
    })
    root.setAttribute('data-cm-motion-ready','1')
    return ()=>{observer.disconnect();root.removeAttribute('data-cm-motion-ready')}
  },[])
  return null
}
