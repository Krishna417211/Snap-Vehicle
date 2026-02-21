import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../contexts/AuthContext';
import { Calendar, MapPin, IndianRupee } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { parseImages } from '../utils/imageUtils';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchBookings = async () => {
            try {
                const { data } = await api.get('/bookings/my-bookings');
                const parsed = data.data.bookings.map(b => ({
                    ...b,
                    vehicle: {
                        ...b.vehicle,
                        images: parseImages(b.vehicle.images)
                    }
                }));
                setBookings(parsed);
            } catch (err) {
                toast.error('Failed to fetch bookings');
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [user, navigate]);

    if (loading) return (
        <div className="flex justify-center flex-col items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading your trips...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">Trips</h1>

            {bookings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No trips booked... yet!</h2>
                    <p className="text-gray-500 mb-8 text-lg">Time to dust off your bags and start planning your next adventure.</p>
                    <Link to="/" className="border-2 border-black text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors inline-block">
                        Start searching
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col h-full group">
                            <Link to={`/vehicle/${booking.vehicle.id}`} className="block relative">
                                {booking.vehicle.images && booking.vehicle.images.length > 0 && booking.vehicle.images[0] && (
                                    <div className="h-48 overflow-hidden rounded-t-xl border-b border-gray-100">
                                        <img
                                            src={booking.vehicle.images[0]}
                                            alt={booking.vehicle.model}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-emerald-700 shadow-sm border border-emerald-100 z-10">
                                    {booking.status}
                                </div>
                            </Link>

                            <div className="p-5 flex-grow flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900 mb-1 line-clamp-1">{booking.vehicle.make} {booking.vehicle.model}</h3>
                                    <div className="flex items-center text-gray-500 text-sm mb-4 font-medium">
                                        <MapPin size={14} className="mr-1" />
                                        Kochi, Kerala
                                    </div>

                                    <div className="flex items-center text-gray-700 mb-2 bg-gray-50 rounded-md p-2 border border-gray-100">
                                        <Calendar size={18} className="text-emerald-600 mr-2" />
                                        <span className="text-sm font-semibold">
                                            {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-sm text-gray-500 font-medium">Total Price</span>
                                    <div className="flex items-center font-bold text-emerald-600 text-lg">
                                        <IndianRupee size={16} />
                                        {booking.total_price}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
