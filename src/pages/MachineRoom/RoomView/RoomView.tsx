import { useEffect, useRef, useState } from 'react'
import RoomMeta from './RoomMeta'
import Loading from '@/components/Loading'

export default () => {
    const metaRef = useRef<RoomMeta>()
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        metaRef.current = new RoomMeta("#sketch")
        metaRef.current.am.on('ready', () => {
            setLoading(false)
          })
    },[])
    return (
        <div>
            <Loading spin={loading} />
            <div id="sketch"></div>
        </div>
    )
}