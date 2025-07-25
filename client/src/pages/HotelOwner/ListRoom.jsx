import React, { useState } from 'react'
import Title from '../../components/Title'
import { useAppContext } from '../../context/AppContext'
import { useEffect } from 'react'
import toast from 'react-hot-toast'


const ListRoom = () => {

    const [rooms, setRooms] = useState([])
    const { axios, getToken, user, currency } = useAppContext()
    const [loading, setLoading] = useState(true)

    const fetchRooms = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/rooms/owner', { headers: { Authorization: `Bearer ${await getToken()}` } })
      if (data.success) setRooms(data.rooms)
      else toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async (roomId) => {
    try {
      const { data } = await axios.post('/api/rooms/toggle-availability', { roomId }, { headers: { Authorization: `Bearer ${await getToken()}` } })
      if (data.success) {
        toast.success(data.message)
        fetchRooms()
      }
      else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } 
  }

   useEffect(() => {
    if (user) fetchRooms()
  }, [user])

  return (
    <div>
      <Title align='left' font='outfit' title='Room Listing'
        subTitle='View, edit, or manage all listed rooms. Keep the information up-to-date to provide the best experience for users.' />
      <p className='text-gray-500 mt-8'>All Rooms</p>

      <div className='w-full max-w-3xl text-left border border-gray-300 rounded-lg max-h-80 overflow-y-scroll mt-3'>
        <table className='w-full'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='py-3 px-4 text-gray-800 font-medium'>Name</th>
              <th className='py-3 px-4 text-gray-800 font-medium max-sm:hidden'>Facility</th>
              <th className='py-3 px-4 text-gray-800 font-medium'>Price / night</th>
              <th className='py-3 px-4 text-gray-800 font-medium text-center'>Action</th>
            </tr>
          </thead>
          <tbody className='text-sm'>
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={4} className='text-center py-8 text-gray-400'>
                  No rooms listed yet.
                </td>
              </tr>
            ) : (
              rooms.map((item) => (
                <tr key={item._id}>
                  <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>
                    {item.roomType}
                  </td>
                  <td className='py-3 px-4 text-gray-700 border-t border-gray-300 max-sm:hidden'>
                    {Array.isArray(item.amenities) ? item.amenities.join(', ') : ''}
                  </td>
                  <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>
                    $ {item.pricePerNight}
                  </td>
                  <td className='py-3 px-4 border-t border-gray-300 text-sm text-red-500 text-center'>
                    <label className='relative inline-flex items-center cursor-pointer text-gray-900 gap-3'>
                      <input onChange={() => toggleAvailability(item._id)}
                        type="checkbox"
                        className='sr-only peer'
                        checked={item.isAvailable}
                        readOnly
                      />
                      <div className='w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-300'></div>
                      <span className='dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5'></span>
                    </label>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ListRoom
