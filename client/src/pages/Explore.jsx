import { useState, useEffect } from 'react';
import api from '../utils/api';
import VehicleCard from '../components/VehicleCard';
import { Search, Map as MapIcon, SlidersHorizontal } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { parseImages } from '../utils/imageUtils';
import toast from 'react-hot-toast';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function Explore() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [maxPrice, setMaxPrice] = useState(5000);
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const { data } = await api.get('/vehicles');
                const parsedData = data.data.vehicles.map(v => ({
                    ...v,
                    images: parseImages(v.images)
                }));
                setVehicles(parsedData);
            } catch (err) {
                toast.error('Failed to load catalog');
            } finally {
                setLoading(false);
            }
        };
        fetchVehicles();
    }, []);

    const filteredVehicles = vehicles.filter(v => {
        const matchesSearch = `${v.make} ${v.model}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPrice = v.price_per_day <= maxPrice;
        return matchesSearch && matchesPrice;
    });

    const kochiCenter = [9.9312, 76.2673];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header & Search */}
            <div className="mb-8 md:flex md:items-center md:justify-between space-y-4 md:space-y-0 border-b border-white/20 pb-4">
                <h1 className="text-5xl horizon-title text-white drop-shadow-[0_0_15px_rgba(0,255,255,0.8)]">VEHICLE CATALOG</h1>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative border border-white/20 bg-white/5 backdrop-blur-md rounded focus-within:border-[#00FFFF]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-[#00FFFF]" />
                        </div>
                        <input
                            type="text"
                            placeholder="SEARCH VEHICLES..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full sm:w-64 bg-transparent text-white placeholder-white/50 font-bold uppercase focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-md border border-white/20 px-3 py-2 rounded">
                        <SlidersHorizontal size={18} className="text-[#FF00FF]" />
                        <span className="text-sm font-bold text-white whitespace-nowrap uppercase tracking-wider">MAX: ₹{String(maxPrice).padStart(5, '0')}</span>
                        <input
                            type="range"
                            min="500"
                            max="10000"
                            step="100"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                            className="w-24 accent-[#00FFFF]"
                        />
                    </div>

                    <button
                        onClick={() => setShowMap(!showMap)}
                        className="horizon-btn"
                    >
                        <span><MapIcon size={18} className="inline mr-2 stroke-[2]" />
                            {showMap ? 'HIDE MAP' : 'SHOW MAP'}</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Listings */}
                <div className={`${showMap ? 'lg:w-1/2' : 'w-full'}`}>
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin h-12 w-12 border-b-4 border-[#00FFFF] rounded-full"></div>
                        </div>
                    ) : filteredVehicles.length > 0 ? (
                        <div className={`grid gap-6 ${showMap ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                            {filteredVehicles.map((vehicle) => (
                                <VehicleCard key={vehicle.id} vehicle={vehicle} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border border-white/20 bg-white/5 backdrop-blur-md rounded-lg">
                            <p className="text-white font-bold tracking-widest text-lg uppercase">NO VEHICLES FOUND FOR THIS PRICE RANGE.</p>
                            <button
                                onClick={() => { setSearchTerm(''); setMaxPrice(10000); }}
                                className="horizon-btn mt-4"
                            >
                                <span>SHOW ALL VEHICLES</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Map View */}
                {showMap && (
                    <div className="lg:w-1/2 h-[600px] sticky top-28 border border-white/20 shadow-[0_0_20px_rgba(0,255,255,0.2)] z-0 relative p-1 bg-white/5 backdrop-blur-md rounded-xl overflow-hidden">
                        <MapContainer center={kochiCenter} zoom={11} scrollWheelZoom={true} className="h-full w-full rounded-lg">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {filteredVehicles.filter(v => v.location_lat && v.location_lng).map(v => (
                                <Marker key={v.id} position={[v.location_lat, v.location_lng]}>
                                    <Popup className="horizon-popup">
                                        <Link to={`/vehicle/${v.id}`} className="block border border-white/20 bg-black/80 backdrop-blur-md p-2 rounded">
                                            <strong className="block text-xl horizon-title text-white uppercase">{v.make} {v.model}</strong>
                                            <span className="text-[#00FFFF] font-bold text-xl horizon-title tracking-widest">₹ {String(v.price_per_day).padStart(4, '0')}</span>
                                            <div className="mt-2 text-sm text-center bg-[#FF00FF] font-black tracking-widest text-white uppercase py-1 px-3 skew-x-[-10deg]">VIEW SPECS</div>
                                        </Link>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
