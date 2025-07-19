import React, { useEffect, useState } from 'react'
import HotelCard from './HotelCard'
import Title from './Title'
import { useAppContext } from '../context/AppContext'

const RecommendedHotels = () => {
  const { rooms, searchedCities } = useAppContext();
  const [recommended,setRecommended]=useState([])

  const filterHotels=()=>{
    const filteredHotels=rooms.slice().filter(room=>searchedCities.includes(room.hotel.city))
    setRecommended(filteredHotels)
  }

  useEffect(()=>{
    filterHotels()
  },[rooms,searchedCities])

  // Defensive: only display if array and not empty
  if (!Array.isArray(recommended) || recommended.length === 0) return null;

  return (
    <div className='flex flex-col items-center px-5 md:px-10 bg-slate-50 py-20'>
      <Title
        title='Recommended Hotels'
        subTitle='Discover our handpicked selection of exceptional properties around the world, offering unparalleled luxury and unforgettable experiences.'
      />
      <div className='flex flex-wrap items-center justify-center gap-5 mt-20'>
        {recommended.slice(0, 4).map((room, index) => (
          <HotelCard key={room._id} room={room} index={index} />
        ))}
      </div>
    </div>
  );
}

export default RecommendedHotels
