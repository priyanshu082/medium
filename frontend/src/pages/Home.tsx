import { Appbar } from '../components/Appbar'
import { Auth } from '../components/Auth'
import { useBlogs } from '../hooks'
import { Blogs } from './Blogs'

export const Home = () => {

    const {loading,blogs} = useBlogs()

    if(loading || !blogs){
        return <>
        <Appbar />
        <div className='mt-[-5vw]'>

        <Auth type='signin' />
        </div>
        </>
    }

  return (
    <div>
        <Blogs/>
    </div>
  )
}

