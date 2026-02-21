import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../contexts/AuthContext';
import { Calendar, MapPin, Search, Star, MessageSquare, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VehicleDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [error, setError] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const { data } = await api.get(`/vehicles/${id}`);
                const v = data.data.vehicle;
                v.images = typeof v.images === 'string' ? JSON.parse(v.images) : v.images;
                setVehicle(v);
            } catch (err) {
                setError('Vehicle not found.');
            } finally {
                setLoading(false);
            }
        };
        fetchVehicle();
    }, [id]);

    const images = vehicle?.images || [];
    const mainImage = images.length > 0 ? images[0] : null;

    const calculateDays = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const days = calculateDays();
    const total = vehicle ? days * vehicle.price_per_day : 0;

    const handleBooking = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setBookingLoading(true);
        setError('');
        try {
            // Priority 1: Request pending slot
            const { data } = await api.post('/bookings', {
                vehicle_id: id,
                start_date: startDate,
                end_date: endDate
            });

            const newBooking = data.data.booking;

            // Priority 2: Request Stripe Secure Payment Session
            const checkoutRes = await api.post('/checkout/create-session', {
                booking_id: newBooking.id
            });

            // Redirect to Stripe checkout
            window.location.href = checkoutRes.data.data.sessionUrl;

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to acquire clearance. Vehicle might be booked.');
        } finally {
            setBookingLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) return navigate('/login');
        if (!reviewText.trim()) return;

        setSubmittingReview(true);
        try {
            const { data } = await api.post('/reviews', {
                vehicle_id: id,
                rating: reviewRating,
                comment: reviewText
            });
            // Update local state with new review
            setVehicle({
                ...vehicle,
                reviews: [data.data.review, ...(vehicle.reviews || [])]
            });
            setReviewText('');
            setReviewRating(5);
        } catch (err) {
            alert('Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
    );

    if (error && !vehicle) return <div className="text-center mt-20 text-[#FF00FF] font-bold tracking-widest horizon-title">EVENT FAILED: {error}</div>;

    return (
        <div className="min-h-screen relative pb-24">
            {bookingSuccess && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl animate-fade-in border border-white/10">
                    <motion.h1
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', damping: 10 }}
                        className="text-6xl md:text-8xl horizon-success text-center px-4"
                    >
                        NEW BOOKING CONFIRMED
                    </motion.h1>
                    <p className="text-white/70 tracking-[0.3em] uppercase mt-4">Heading back to Home...</p>
                </div>
            )}

            {/* Nav Back Header */}
            <div className="absolute top-4 left-4 z-50">
                <button onClick={() => navigate(-1)} className="text-white hover:text-[#00FFFF] px-4 py-2 bg-black/30 backdrop-blur-md border border-white/20 flex items-center gap-2 uppercase font-bold tracking-widest transition-colors rounded-full text-sm">
                    <ArrowLeft size={18} /> BACK TO CATALOG
                </button>
            </div>

            {/* Hero Image Section */}
            {mainImage && (
                <motion.div layoutId={`vehicle-image-${vehicle.id}`} className="relative w-full h-[60vh]">
                    <img src={mainImage} className="w-full h-full object-cover" />
                    {/* Vignette Overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0)_40%,rgba(15,15,20,0.9)_100%)] pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-[#101014] to-transparent">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h1 className="text-5xl md:text-7xl horizon-title text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,0,255,0.6)]">{vehicle.make} <span className="text-[#00FFFF]">{vehicle.model}</span></h1>
                            <div className="text-3xl horizon-price mt-2">₹ {String(vehicle.price_per_day).padStart(4, '0')} <span className="text-sm">/ DAY</span></div>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-4 flex flex-col lg:flex-row gap-8">
                {/* Left Info Column */}
                <div className="lg:w-2/3">
                    {/* Data Grid Stats */}
                    <div className="mb-8 border border-white/10 bg-white/5 backdrop-blur-xl p-6 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                        <h3 className="text-3xl horizon-title text-[#00FFFF] mb-6 tracking-widest">PERFORMANCE</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-white font-bold uppercase tracking-widest mb-2 text-sm"><span>SPEED</span><span>8.5</span></div>
                                <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} transition={{ duration: 1, ease: "easeOut", delay: 0.1 }} className="h-full bg-gradient-to-r from-[#00FFFF] to-[#FF00FF]"></motion.div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-white font-bold uppercase tracking-widest mb-2 text-sm"><span>HANDLING</span><span>9.2</span></div>
                                <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: "92%" }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 }} className="h-full bg-gradient-to-r from-[#00FFFF] to-[#FF00FF]"></motion.div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-white font-bold uppercase tracking-widest mb-2 text-sm"><span>ACCELERATION</span><span>7.0</span></div>
                                <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: "70%" }} transition={{ duration: 1, ease: "easeOut", delay: 0.3 }} className="h-full bg-gradient-to-r from-[#00FFFF] to-[#FF00FF]"></motion.div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-white font-bold uppercase tracking-widest mb-2 text-sm"><span>LAUNCH</span><span>8.8</span></div>
                                <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: "88%" }} transition={{ duration: 1, ease: "easeOut", delay: 0.4 }} className="h-full bg-gradient-to-r from-[#00FFFF] to-[#FF00FF]"></motion.div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-white font-bold uppercase tracking-widest mb-2 text-sm"><span>BRAKING</span><span>6.5</span></div>
                                <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} transition={{ duration: 1, ease: "easeOut", delay: 0.5 }} className="h-full bg-gradient-to-r from-[#00FFFF] to-[#FF00FF]"></motion.div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Gallery Horizontal Scroll */}
                    {images.length > 1 && (
                        <div className="mb-8 border border-white/10 bg-white/5 backdrop-blur-xl p-6 rounded-xl">
                            <h3 className="text-3xl horizon-title text-white mb-4 tracking-widest">GALLERY</h3>
                            <div className="flex overflow-x-auto gap-4 pb-2 snap-x hide-scrollbar">
                                {images.map((img, i) => (
                                    <img key={i} src={img} className="h-48 min-w-[300px] object-cover rounded-lg snap-center hover:scale-105 transition-transform duration-300" />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="py-8">
                        <h3 className="text-3xl horizon-title text-[#FF00FF] mb-4">VEHICLE HISTORY</h3>
                        <p className="text-white/80 font-medium leading-relaxed whitespace-pre-wrap">{vehicle.description}</p>
                    </div>

                    <div className="flex justify-between items-center py-6 border-y border-white/10 mt-4 mb-4">
                        <div>
                            <h2 className="text-2xl horizon-title text-white mb-1">
                                HOST: {vehicle.owner.name}
                            </h2>
                            <p className="text-[#00FFFF] font-bold uppercase tracking-widest text-xs py-1">CERTIFIED HOST • {vehicle.year} MODEL</p>
                        </div>
                        <div className="w-16 h-16 rounded-full border-2 border-[#FF00FF] bg-black/50 text-[#FF00FF] flex items-center justify-center text-2xl font-bold horizon-title shadow-[0_0_15px_rgba(255,0,255,0.4)]">
                            {vehicle.owner.name.charAt(0)}
                        </div>
                    </div>

                    {/* Social Reviews */}
                    <div className="py-8">
                        <h3 className="text-3xl horizon-title text-white mb-6 tracking-widest">USER REVIEWS</h3>

                        {/* New Review Form */}
                        <form onSubmit={handleReviewSubmit} className="mb-10 border border-white/10 bg-white/5 backdrop-blur-xl p-6 rounded-xl">
                            <h4 className="text-xl horizon-title text-[#00FFFF] mb-4">LEAVE A REVIEW</h4>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-white/60 font-bold uppercase tracking-widest mr-4 text-xs">RATING:</span>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                        key={star}
                                        onClick={() => setReviewRating(star)}
                                        className={`cursor-pointer ${star <= reviewRating ? 'text-[#FF00FF] fill-[#FF00FF]' : 'text-gray-600'} transition-colors`}
                                        size={24}
                                    />
                                ))}
                            </div>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                className="w-full bg-black/30 border border-white/20 text-white p-4 rounded focus:outline-none focus:border-[#00FFFF] mb-4"
                                rows="3"
                                placeholder="Write your thoughts..."
                                required
                            ></textarea>
                            <button type="submit" disabled={submittingReview} className="horizon-btn w-full">
                                <span>{submittingReview ? 'POSTING...' : 'SUBMIT REVIEW'}</span>
                            </button>
                        </form>

                        {/* Review List */}
                        <div className="space-y-4">
                            {vehicle.reviews && vehicle.reviews.length > 0 ? (
                                vehicle.reviews.map(review => (
                                    <div key={review.id} className="border-l-4 border-[#00FFFF] bg-white/5 backdrop-blur-md p-6 rounded-r-xl">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full border border-[#FF00FF] bg-black/50 flex items-center justify-center text-[#FF00FF] font-bold text-lg horizon-title">
                                                    {review.user.name.charAt(0)}
                                                </div>
                                                <span className="text-white font-bold tracking-widest uppercase text-sm">{review.user.name}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} className="text-[#FF00FF] fill-[#FF00FF]" />)}
                                            </div>
                                        </div>
                                        <p className="text-white/80 font-medium pl-[3.5rem]">{review.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-white/40 font-bold uppercase tracking-widest text-sm text-center py-8">NO REVIEWS FOR THIS VEHICLE YET.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sticky Booking Widget */}
                <div className="lg:w-1/3">
                    <div className="sticky top-28 border border-white/10 bg-white/5 backdrop-blur-2xl p-6 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
                        <div className="flex items-end mb-6">
                            <span className="text-[#00FFFF] mr-1 mb-1 font-bold tracking-widest uppercase text-sm">₹</span>
                            <span className="text-4xl horizon-price">{String(vehicle.price_per_day).padStart(4, '0')}</span>
                            <span className="text-[#00FFFF] ml-2 mb-1 font-bold tracking-widest uppercase text-sm">/ DAY</span>
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500 text-white backdrop-blur-md p-3 text-sm mb-4 rounded">
                                {error}
                            </div>
                        )}

                        <div className="bg-black/30 border border-white/20 rounded-lg mb-4">
                            <div className="flex divide-x divide-white/20">
                                <div className="w-1/2 p-3">
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1">PICK-UP</label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full text-sm outline-none text-white bg-transparent"
                                    />
                                </div>
                                <div className="w-1/2 p-3">
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1">RETURN</label>
                                    <input
                                        type="date"
                                        min={startDate || new Date().toISOString().split('T')[0]}
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full text-sm outline-none text-white bg-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleBooking}
                            disabled={!startDate || !endDate || new Date(startDate) >= new Date(endDate) || bookingLoading}
                            className="horizon-btn w-full mt-4 !block"
                        >
                            <span>{bookingLoading ? 'PROCESSING...' : 'REQUEST BOOKING'}</span>
                        </button>
                        <p className="text-center text-white/40 font-medium text-xs mb-6 mt-4 tracking-widest">DRIVE IT NOW, PAY LATER</p>

                        {days > 0 && (
                            <div className="space-y-4 text-white/80 font-medium text-sm tracking-wider">
                                <div className="flex justify-between">
                                    <span>BASE PRICE x {days}D</span>
                                    <span>₹ {total}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>SERVICE FEE</span>
                                    <span>₹ 800</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>TAXES</span>
                                    <span>₹ {Math.round(total * 0.1)}</span>
                                </div>

                                <div className="pt-4 border-t border-white/20 flex justify-between text-2xl horizon-title mt-4 text-white">
                                    <span>TOTAL</span>
                                    <span className="text-[#00FFFF]">₹ {(total + 800 + Math.round(total * 0.1))}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
