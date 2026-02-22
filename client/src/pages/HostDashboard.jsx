import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../utils/api';
import { Car, PlusCircle, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { parseImages } from '../utils/imageUtils';
import toast from 'react-hot-toast';

export default function HostDashboard() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [liveAlerts, setLiveAlerts] = useState([]);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        make: '', model: '', year: '', price_per_day: '', description: '', location_lat: 9.9312, location_lng: 76.2673, imageFiles: []
    });

    useEffect(() => {
        if (!user || user.role !== 'HOST') {
            navigate('/');
            return;
        }

        const fetchVehicles = async () => {
            try {
                const { data } = await api.get('/vehicles/host');
                const parsed = data.data.vehicles.map(v => ({
                    ...v,
                    images: parseImages(v.images)
                }));
                setVehicles(parsed);
            } catch (err) {
                toast.error('Failed to fetch vehicles');
            } finally {
                setLoading(false);
            }
        };
        fetchVehicles();

        // Socket IO Setup
        const socket = io('http://localhost:5000');
        socket.on('connect', () => {
            socket.emit('join_host_room', user.id);
        });

        socket.on('new_mission', (data) => {
            setLiveAlerts(prev => [data.message, ...prev]);
            setTimeout(() => {
                setLiveAlerts(prev => prev.filter(msg => msg !== data.message));
            }, 8000);
        });

        return () => socket.disconnect();
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let uploadedUrls = [];
            if (formData.imageFiles && formData.imageFiles.length > 0) {
                setUploadingImage(true);
                const uploadData = new FormData();
                Array.from(formData.imageFiles).forEach(file => {
                    uploadData.append('images', file);
                });
                const uploadRes = await api.post('/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedUrls = uploadRes.data.data.urls || [];
            }

            const payload = {
                ...formData,
                images: uploadedUrls
            };
            const { data } = await api.post('/vehicles', payload);
            const newV = data.data.vehicle;
            newV.images = parseImages(newV.images);
            setVehicles([...vehicles, newV]);
            setShowAddForm(false);
            setFormData({ make: '', model: '', year: '', price_per_day: '', description: '', location_lat: 9.9312, location_lng: 76.2673, imageFiles: [] });
            toast.success('Vehicle added successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add vehicle');
        } finally {
            setUploadingImage(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-[#FF00FF] horizon-title text-2xl animate-pulse">BOOTING FESTIVAL UPLINK...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative min-h-[80vh]">

            {/* Live Alerts Overlay */}
            <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {liveAlerts.map((alert, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 100, opacity: 0 }}
                            className="bg-black/80 backdrop-blur-md border border-[#00FFFF] p-4 flex items-center gap-3 shadow-[0_0_20px_rgba(0,255,255,0.4)]"
                        >
                            <Activity className="text-[#FF00FF] animate-pulse" />
                            <span className="horizon-title text-white flex-1">{alert}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="flex justify-between items-center mb-8 border-b border-white/20 pb-4">
                <h1 className="text-4xl horizon-title text-white drop-shadow-[0_0_15px_rgba(255,0,255,0.8)]">MY VEHICLES</h1>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="horizon-btn"
                >
                    <span>{showAddForm ? 'CANCEL' : 'ADD NEW VEHICLE'}</span>
                </button>
            </div>

            {showAddForm && (
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10 bg-white/5 backdrop-blur-xl p-8 border border-white/20 max-w-3xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <h2 className="text-2xl horizon-title mb-6 text-[#00FFFF]">ADD A NEW VEHICLE</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-white/50 mb-1 uppercase tracking-widest">MAKE</label>
                            <input type="text" required placeholder="NISSAN" value={formData.make} onChange={e => setFormData({ ...formData, make: e.target.value })} className="horizon-input w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-white/50 mb-1 uppercase tracking-widest">MODEL</label>
                            <input type="text" required placeholder="SKYLINE GT-R" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} className="horizon-input w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-white/50 mb-1 uppercase tracking-widest">YEAR</label>
                            <input type="number" required placeholder="2024" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} className="horizon-input w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-white/50 mb-1 uppercase tracking-widest">PRICE PER DAY (INR)</label>
                            <input type="number" required placeholder="1200" value={formData.price_per_day} onChange={e => setFormData({ ...formData, price_per_day: e.target.value })} className="horizon-input w-full" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-white/50 mb-1 uppercase tracking-widest">UPLOAD VEHICLE IMAGES</label>
                            <input multiple type="file" accept="image/*" onChange={e => setFormData({ ...formData, imageFiles: e.target.files })} className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#FF00FF] file:text-white hover:file:bg-[#00FFFF] hover:file:text-black transition-all cursor-pointer" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-white/50 mb-1 uppercase tracking-widest">DESCRIPTION</label>
                            <textarea required rows="3" placeholder="Describe your vehicle..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="horizon-input w-full"></textarea>
                        </div>
                        <div className="col-span-2 mt-4">
                            <button type="submit" disabled={uploadingImage} className="horizon-btn w-full !block !py-4">
                                <span>{uploadingImage ? 'UPLOADING...' : 'LIST VEHICLE FORE RENT'}</span>
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {vehicles.length === 0 && !showAddForm ? (
                <div className="text-center py-20 bg-black/30 backdrop-blur-sm border border-white/10">
                    <Car className="mx-auto h-16 w-16 text-white/20 mb-4" />
                    <p className="text-white/50 text-xl horizon-title">YOU HAVE NO VEHICLES LISTED.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {vehicles.map(v => (
                        <div key={v.id} className="bg-white/5 border border-white/10 overflow-hidden flex flex-col group hover:border-[#FF00FF] transition-all duration-300">
                            {v.images && v.images.length > 0 && v.images[0] ? (
                                <div className="h-48 overflow-hidden border-b border-white/10">
                                    <img src={v.images[0]} alt={v.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            ) : (
                                <div className="h-48 bg-black/50 border-b border-white/10 flex items-center justify-center">
                                    <span className="horizon-title text-white/20">NO IMAGE</span>
                                </div>
                            )}
                            <div className="p-6 flex-1 flex flex-col justify-between relative">
                                <div>
                                    <p className="text-[#00FFFF] font-bold text-xs uppercase tracking-widest mb-1">{v.make}</p>
                                    <h3 className="horizon-title text-white text-3xl leading-none mb-4">{v.model}</h3>

                                    <div className="inline-block bg-black/50 border border-white/20 px-3 py-1 font-bold text-white text-sm uppercase">
                                        ₹ {v.price_per_day} <span className="text-[#FF00FF]">/ DAY</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest border-t border-white/20 pt-4 mt-6">
                                    <span className="text-[#00FF00]">ACTIVE LISTING</span>
                                    <span className="text-white/30 hover:text-white cursor-pointer transition-colors">EDIT LISTING</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
