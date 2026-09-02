import type { Metadata } from 'next'; import SiteFrame from '../components/SiteFrame'; import WatchlistClient from './WatchlistClient'
export const metadata:Metadata={title:'Watchlist',description:'Track Indian equities with verified market quotes and personal alerts.',alternates:{canonical:'/watchlist'}}
export default function Page(){return <SiteFrame><WatchlistClient/></SiteFrame>}
