import Head from 'next/head'
import GrantStatus from '../components/GrantStatus'
import RedeemSnx from '../components/RedeemSnx'
import RecentActivity from '../components/RecentActivity'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Basic Panel</title>
      </Head>

      <main>
        <GrantStatus />
        <RedeemSnx />
        <RecentActivity />
      </main>
    </div >
  )
}
