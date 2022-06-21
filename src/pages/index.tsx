import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import { NavBar } from '../components/NavBar'
import { createURQLClient } from '../utils'

const Index: NextPage = () => (
  <>
    <NavBar />
    <div>hello world</div>
  </>
)

export default withUrqlClient(createURQLClient)(Index)
