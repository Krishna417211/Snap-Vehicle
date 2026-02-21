import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../utils/api';
import { Car, PlusCircle, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HostDashboard() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        make: '', model: '', year: '', price_per_day: '', description: '', location_lat: 9.9312, location_lng: 76.2673, image: ''
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
                    images: typeof v.images === 'string' ? JSON.parse(v.images) : v.images
                }));
                setVehicles(parsed);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchVehicles();
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                images: formData.image ? [formData.image] : []
            };
            const { data } = await api.post('/vehicles', payload);
            const newV = data.data.vehicle;
            newV.images = typeof newV.images === 'string' ? JSON.parse(newV.images) : newV.images;
            setVehicles([...vehicles, newV]);
            setShowAddForm(false);
            setFormData({ make: '', model: '', year: '', price_per_day: '', description: '', location_lat: 9.9312, location_lng: 76.2673, image: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add vehicle');
        }
    };

    if (loading) return <div className="p-10 text-center text-emerald-600 font-bold">Loading Host Assets...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-gray-900 border-none">My Listings</h1>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm transition-colors"
                >
                    <PlusCircle size={20} />
                    <span>{showAddForm ? 'Cancel' : 'Add Vehicle'}</span>
                </button>
            </div>

            {showAddForm && (
                <div className="mb-10 bg-white p-6 rounded-2xl shadow-lg border border-emerald-100 max-w-3xl">
                    <h2 className="text-2xl font-bold mb-6 text-emerald-800">List a New Vehicle</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Make</label>
                            <input type="text" required placeholder="e.g., Hyundai" value={formData.make} onChange={e => setFormData({ ...formData, make: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-emerald-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Model</label>
                            <input type="text" required placeholder="e.g., i20" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-emerald-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Year</label>
                            <input type="number" required placeholder="2022" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-emerald-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Price per Day (₹)</label>
                            <input type="number" required placeholder="1200" value={formData.price_per_day} onChange={e => setFormData({ ...formData, price_per_day: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-emerald-500" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
                            <input type="url" placeholder="https://images.unsplash..." value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-emerald-500" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                            <textarea required rows="3" placeholder="Describe your vehicle..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-emerald-500"></textarea>
                        </div>
                        <div className="col-span-2">
                            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow mt-2">Publish Listing</button>
                        </div>
                    </form>
                </div>
            )}

            {vehicles.length === 0 && !showAddForm ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                    <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg font-medium">You haven't listed any vehicles yet.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {vehicles.map(v => (
                        <div key={v.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all flex flex-col">
                            {v.images && v.images.length > 0 && v.images[0] && (
                                <div className="h-48 overflow-hidden border-b border-gray-100">
                                    <img src={v.images[0]} alt={v.model} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900 mb-2">{v.make} {v.model} <span className="text-sm font-normal text-gray-500 ml-1">({v.year})</span></h3>
                                    <div className="flex items-center text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg w-max mb-4">
                                        <IndianRupee size={16} className="mr-0.5" />
                                        {v.price_per_day} / day
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium border-t pt-4 border-gray-100 mt-4">
                                    <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Active</span>
                                    <span className="text-gray-500">Edit listing</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
