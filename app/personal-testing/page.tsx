import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { personalActor } from '../../src/lib/billing/personal-access'
import { localRuntime, personalReady, trustedLocalHost } from '../../src/lib/billing/personal-security'
import PersonalWorkspace from './workspace'

export const dynamic='force-dynamic'
export const metadata:Metadata={title:'Personal TEST workspace',robots:{index:false,follow:false,noarchive:true},alternates:{canonical:'/personal-testing'}}
export default async function PersonalTestingPage(){
  if(!personalReady()) notFound()
  const local=localRuntime()
  if(local && !trustedLocalHost((await headers()).get('host'))) notFound()
  const owner=await personalActor()
  if(!owner && !local) notFound()
  return <PersonalWorkspace owner={owner} local={local}/>
}
