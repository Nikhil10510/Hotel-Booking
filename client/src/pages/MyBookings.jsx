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

            {/* Simulated Stripe Payment Modal */}
            {showPaymentModal && selectedBooking && (
                <div className='fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
                    <div className='bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200'>
                        {/* Header */}
                        <div className='bg-slate-900 p-5 text-white flex justify-between items-center'>
                            <div className='flex items-center gap-2'>
                                <svg className="h-5 text-indigo-400 fill-current" viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M59.64 14.28c0-3.92-2.07-6.55-5.91-6.55-3.93 0-6.12 2.63-6.12 6.55 0 4.19 2.29 6.57 6.3 6.57 1.9 0 3.73-.4 4.97-1.15l-.75-2.22c-.93.5-2.26.85-3.89.85-2.08 0-3.32-1.09-3.4-2.82h12.7c.07-.4.1-.88.1-1.23zm-9.08-1.74c.05-1.57.96-2.5 2.19-2.5 1.18 0 2.06.93 2.06 2.5h-4.25zm-6.27-5.99c-1.84 0-2.87 1.09-3.23 1.63V8.08h-2.92v17.47l3.22-.68v-5.26c.4.45 1.4 1.39 3.09 1.39 3.4 0 5.48-2.6 5.48-6.66-.02-4.14-2.12-6.57-5.64-6.57zm-.92 8.78c0 2.45-1.13 3.8-2.6 3.8-1.28 0-2.08-.85-2.08-2.22V11.2c.48-.68 1.4-1.39 2.62-1.39 1.43 0 2.06 1.32 2.06 3.52zm-12.7-8.78c-1.63 0-2.83.62-3.4 1.25V1.27l-3.22.68v18.7h3.22v-9.35c.57-.75 1.55-1.3 2.62-1.3 1.8 0 2.37 1.2 2.37 3.03v7.62h3.22v-8.23c0-3.64-1.77-5.87-4.81-5.87zM18.7 8.08H15.8V2.73l-3.22.68v4.67H9.95v2.6h2.63v7.35c0 3.1 1.7 4.67 4.7 4.67.99 0 1.94-.15 2.58-.45l-.47-2.45c-.47.2-.99.3-1.6.3-1.38 0-1.99-.7-1.99-2.22v-7.25h3.1l-.2-2.6zM6.92 8.08c-.73-.5-1.84-1-3.25-1C1.33 7.08 0 8.35 0 10.42c0 3.65 4.96 3.08 4.96 4.68 0 .62-.57.99-1.46.99-1.25 0-2.69-.53-3.69-1.15l-.83 2.32c1.07.68 2.76 1.15 4.4 1.15 2.52 0 4.19-1.22 4.19-3.32.02-3.8-4.97-3.13-4.97-4.7 0-.5.53-.9 1.28-.9.99 0 2.14.38 2.97.93l.08-2.39z"/>
                                </svg>
                                <span className='text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded uppercase tracking-wider'>Secure Pay</span>
                            </div>
                            <button onClick={() => setShowPaymentModal(false)} className='text-gray-400 hover:text-white transition-all text-xl cursor-pointer'>✕</button>
                        </div>

                        {/* Content */}
                        <form onSubmit={handlePaymentSubmit} className='p-6 space-y-4'>
                            {/* Amount Info */}
                            <div className='bg-slate-50 p-4 rounded-xl flex justify-between items-center border border-slate-100'>
                                <div>
                                    <p className='text-xs text-gray-500 font-medium'>Hotel Booking</p>
                                    <p className='text-sm font-semibold text-slate-800'>{selectedBooking.hotel.name}</p>
                                </div>
                                <div className='text-right'>
                                    <p className='text-xs text-gray-500 font-medium'>Total Price</p>
                                    <p className='text-lg font-bold text-indigo-600'>${selectedBooking.totalPrice}</p>
                                </div>
                            </div>

                            {/* Cardholder Name */}
                            <div>
                                <label className='block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1'>Cardholder Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="John Doe"
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value)}
                                    className='w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 transition-all text-sm font-light'
                                />
                            </div>

                            {/* Card Number */}
                            <div>
                                <label className='block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1'>Card Number</label>
                                <div className='relative flex items-center'>
                                    <input 
                                        type="text" 
                                        required
                                        maxLength="19"
                                        placeholder="4242 4242 4242 4242"
                                        value={cardNumber}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                                            setCardNumber(val);
                                        }}
                                        className='w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 transition-all text-sm font-light tracking-widest'
                                    />
                                    <div className='absolute right-3 text-gray-400'>
                                        <svg className="h-5 w-7 fill-current" viewBox="0 0 36 24">
                                            <path d="M32 3H4c-1.6 0-3 1.4-3 3v12c0 1.6 1.4 3 3 3h28c1.6 0 3-1.4 3-3V6c0-1.6-1.4-3-3-3zm0 15H4V10h28v8zm0-11H4V6h28v1z"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Expiry & CVC */}
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1'>Expiration Date</label>
                                    <input 
                                        type="text" 
                                        required
                                        maxLength="5"
                                        placeholder="MM/YY"
                                        value={expiry}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length > 2) {
                                                val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                            }
                                            setExpiry(val);
                                        }}
                                        className='w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 transition-all text-sm font-light text-center'
                                    />
                                </div>
                                <div>
                                    <label className='block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1'>CVC / CVV</label>
                                    <input 
                                        type="password" 
                                        required
                                        maxLength="3"
                                        placeholder="•••"
                                        value={cvc}
                                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                                        className='w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 transition-all text-sm font-light text-center tracking-widest'
                                    />
                                </div>
                            </div>

                            {/* Pay Button */}
                            <button 
                                type="submit" 
                                disabled={isProcessing}
                                className={`w-full py-3 rounded-xl text-white font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2
                                  ${isProcessing ? 'bg-indigo-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-[0.98]'}`}
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
                </div>
            )}
        </div>
    )
}

export default MyBookings
