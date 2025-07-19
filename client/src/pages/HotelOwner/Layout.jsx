import React, { useEffect } from 'react'
import Navbar from '../../components/HotelOwner/Navbar'
import Sidebar from '../../components/HotelOwner/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const Layout = () => {
    const { isOwner, navigate, loading } = useAppContext()

    useEffect(() => {
        if (loading) return;
        if (!isOwner) navigate('/');
    }, [isOwner, loading]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className='flex flex-col min-h-screen'>
            <Navbar />
            <div className='flex flex-1 h-full'>
                <Sidebar />
                <div className='flex-1 p-4 pt-10 md:px-10 h-full overflow-auto'>
                    <Outlet />
                </div>
            </div>
        </div>

    )
}

export default Layout
