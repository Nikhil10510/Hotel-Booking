import React, { useEffect, useState } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MyBookings = () => {
    const {axios,getToken,user}=useAppContext()

    const [bookings,setBookings]=useState([])
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const [cardNumber, setCardNumber] = useState("")
    const [expiry, setExpiry] = useState("")
    const [cvc, setCvc] = useState("")
    const [cardName, setCardName] = useState("")

    const fetchUserBookings=async()=>{
        try {
            const {data}=await axios.get('/api/bookings/user',{ headers: { Authorization: `Bearer ${await getToken()}` } })
            if(data.success){
                setBookings(data.bookings)
            }
            else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const openPaymentModal = (booking) => {
        setSelectedBooking(booking)
        setShowPaymentModal(true)
    }

    const handlePaymentSubmit = async (e) => {
        e.preventDefault()
        if (!selectedBooking) return
        
        setIsProcessing(true)
        
        // Simulate a 1.5s Stripe transaction processing delay
        setTimeout(async () => {
            try {
                const {data}=await axios.post('/api/bookings/pay',{bookingId: selectedBooking._id},{ headers: { Authorization: `Bearer ${await getToken()}` } })
                if(data.success){
                    toast.success("Payment Successful via Stripe!")
                    setShowPaymentModal(false)
                    // Reset fields
                    setCardNumber("")
                    setExpiry("")
                    setCvc("")
                    setCardName("")
                    fetchUserBookings()
                }
                else{
                    toast.error(data.message)
                }
            } catch (error) {
                toast.error(error.message)
            } finally {
                setIsProcessing(false)
            }
        }, 1500)
    }

    useEffect(()=>{
        if(user){
            fetchUserBookings()
        }
    },[user])

    return (
        <div className='py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32'>
            <Title title='My Bookings' subTitle='Easily manage your past, current, and upcoming hotel reservations in one place. Plan your trips seamlessly with just a few clicks' align='left'/>

            <div className='max-w-6xl mt-8 w-full text-gray-800'>
                <div className='hidden md:grid md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3'>
                    <div className='w-1/3'>Hotels</div>
                    <div className='w-1/3'>Date & Timings</div>
                    <div className='w-1/3'>Payment</div>
                </div>

                {bookings.map((bookings)=>(
                    <div key={bookings._id} className='grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 py-6 first:border-t'>
                        {/* Hotel details */}
                        <div className='flex flex-col md:flex-row'>
                            <img src={bookings.room.images[0]} alt="hotel-img" className='min-md:w-44 rounded shadow object-cover'/>
                            <div className='flex flex-col gap-1.5 max-wd:mt-3 min-md:ml-4'>
                                <p className='font-playfair text-2xl'>{bookings.hotel.name}
                                <span className='font-inter text-sm'> ({bookings.room.roomType})</span>
                                </p>
                                <div className='flex items-center gap-1 text-sm text-gray-500'>
                                    <img src={assets.locationIcon} alt="location-icon"/>
                                    <span>{bookings.hotel.address}</span>
                                </div>
                                <div className='flex items-center gap-1 text-sm text-gray-500'>
                                    <img src={assets.guestsIcon} alt="guests-icon"/>
                                    <span>Guests: {bookings.guests}</span>
                                </div>
                                <p className='text-base'>Total: ${bookings.totalPrice}</p>
                            </div>
                        </div>
                        {/* Date & Timings */}
                        <div className='flex flex-row md:items-center md:gap-12 mt-3 gap-8'>
                            <div>
                                <p>Check-In</p>
                                <p className='text-gray-500 text-sm'>
                                    {new Date(bookings.checkInDate).toDateString()}
                                </p>
                            </div>
                            <div>
                                <p>Check-Out</p>
                                <p className='text-gray-500 text-sm'>
                                    {new Date(bookings.checkOutDate).toDateString()}
                                </p>
                            </div>
                        </div>
                        {/* Payment Status*/}
                        <div className='flex flex-col items-start justify-center pt-3'>
                             <div className='flex items-center gap-2'>
                                <div className={`h-3 w-3 rounded-full ${bookings.isPaid ? "bg-green-500" : "bg-red-500"}`}></div>
                                <p className={`text-sm ${bookings.isPaid ? "text-green-500" : "text-red-500"}`}>
                                    {bookings.isPaid ? "Paid" : "Unpaid"}
                                </p>
                             </div>
                             {!bookings.isPaid && (
                                <button onClick={()=>openPaymentModal(bookings)} className='px-4 py-1.5 mt-4 text-xs border border-gray-400 rounded-full hover:bg-gray-50 transition-all cursor-pointer'>Pay Now</button>
                             )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Simulated Payment Modal - matching HotelReg style */}
            {showPaymentModal && selectedBooking && (
                <div onClick={() => setShowPaymentModal(false)} className='fixed top-0 bottom-0 left-0 right-0 z-[100] flex items-center justify-center bg-black/70'>
                    <form onSubmit={handlePaymentSubmit} onClick={(e) => e.stopPropagation()} className='bg-white rounded-xl w-full max-w-md p-8 relative mx-4'>
                        <img src={assets.closeIcon} alt="close-icon" className='absolute top-4 right-4 h-4 w-4 cursor-pointer'
                        onClick={() => setShowPaymentModal(false)}/>
                        
                        <p className='text-2xl font-semibold mt-4 text-center'>Payment Details</p>
                        
                        <div className='bg-gray-50 p-4 rounded-lg flex justify-between items-center mt-6 border border-gray-100'>
                            <p className='font-medium text-gray-600 text-sm'>{selectedBooking.hotel.name}</p>
                            <p className='text-lg font-semibold text-indigo-600 font-inter'>Total: ${selectedBooking.totalPrice}</p>
                        </div>

                        {/* Card Name */}
                        <div className='w-full mt-4'>
                            <label htmlFor="cardName" className='font-medium text-gray-500 text-sm'>Cardholder Name</label>
                            <input 
                                id='cardName' 
                                onChange={(e) => setCardName(e.target.value)} 
                                value={cardName} 
                                type="text" 
                                placeholder='John Doe' 
                                className='border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light text-sm' 
                                required
                            />
                        </div>

                        {/* Card Number */}
                        <div className='w-full mt-4'>
                            <label htmlFor="cardNumber" className='font-medium text-gray-500 text-sm'>Card Number</label>
                            <input 
                                id='cardNumber' 
                                onChange={(e) => {
                                    let val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                                    setCardNumber(val);
                                }} 
                                value={cardNumber} 
                                type="text" 
                                placeholder='4242 4242 4242 4242' 
                                maxLength="19"
                                className='border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light text-sm tracking-widest' 
                                required
                            />
                        </div>

                        {/* Expiry and CVC */}
                        <div className='flex gap-4 mt-4 w-full'>
                            <div className='w-1/2'>
                                <label htmlFor="expiry" className='font-medium text-gray-500 text-sm'>Expiry Date</label>
                                <input 
                                    id='expiry' 
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, '');
                                        if (val.length > 2) {
                                            val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                        }
                                        setExpiry(val);
                                    }} 
                                    value={expiry} 
                                    type="text" 
                                    placeholder='MM/YY' 
                                    maxLength="5"
                                    className='border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light text-sm text-center' 
                                    required
                                />
                            </div>
                            <div className='w-1/2'>
                                <label htmlFor="cvc" className='font-medium text-gray-500 text-sm'>CVC / CVV</label>
                                <input 
                                    id='cvc' 
                                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))} 
                                    value={cvc} 
                                    type="password" 
                                    placeholder='•••' 
                                    maxLength="3"
                                    className='border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light text-sm text-center tracking-widest' 
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isProcessing}
                            className='bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition-all text-white w-full py-2.5 rounded cursor-pointer mt-6 font-medium flex items-center justify-center gap-2'
                        >
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                `Pay $${selectedBooking.totalPrice}`
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}

export default MyBookings
