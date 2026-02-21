import { Link } from 'react-router-dom';
import { MapPin, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

import { parseImages } from '../utils/imageUtils';

export default function VehicleCard({ vehicle }) {
    // Parse images safely
    const images = parseImages(vehicle.images);
    const mainImage = images.length > 0 ? images[0] : null;

    // Fake the Horizon stats
    const piScore = Math.min(999, Math.floor(vehicle.price_per_day / 2) + 500);
    const piClass = piScore > 900 ? 'S2' : piScore > 800 ? 'S1' : piScore > 700 ? 'A' : 'B';
    const rarity = piScore > 900 ? 'bg-[#FFD700]' : piScore > 800 ? 'bg-[#FF00FF]' : piScore > 700 ? 'bg-[#00FFFF]' : 'bg-[#00FF00]';

    return (
        <motion.div
            whileHover={{ scale: 1.05, rotateZ: -1 }}
            className="horizon-card flex flex-col sm:flex-row relative mt-2 group"
        >
            {/* Rarity Stripe */}
            <div className={`absolute bottom-0 left-0 w-full h-[4px] ${rarity} z-10`} />

            <Link to={`/vehicle/${vehicle.id}`} className="flex-1 flex flex-col sm:flex-row p-0">

                {/* Image Section - Left */}
                <div className="sm:w-2/5 p-4 border-b sm:border-b-0 sm:border-r border-white/10 relative overflow-hidden flex items-center justify-center">
                    {/* PI Badge */}
                    <div className="absolute top-2 left-2 flex font-bold z-20 shadow-lg">
                        <span className="bg-white text-black px-2 py-1 text-xs">{piClass}</span>
                        <span className="bg-[#FF00FF] text-white px-2 py-1 text-xs">{piScore}</span>
                    </div>

                    {mainImage ? (
                        <motion.div layoutId={`vehicle-image-${vehicle.id}`} className="w-full h-40 relative">
                            <img
                                src={mainImage}
                                alt={`${vehicle.make} ${vehicle.model}`}
                                className="w-full h-full object-contain filter drop-shadow-2xl"
                            />
                        </motion.div>
                    ) : (
                        <div className="w-full h-40 bg-white/5 flex items-center justify-center">
                            <span className="text-white/50 text-xs tracking-widest uppercase">No Image</span>
                        </div>
                    )}
                </div>

                {/* Details Section - Right */}
                <div className="sm:w-3/5 p-4 flex flex-col justify-between">
                    <div>
                        <p className="text-xs font-bold text-[#00FFFF] tracking-widest uppercase mb-1">{vehicle.make}</p>
                        <h3 className="text-2xl horizon-title text-white leading-none group-hover:text-[#FF00FF] transition-colors">
                            {vehicle.model}
                        </h3>
                    </div>

                    <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center text-xs font-medium text-white/70 uppercase tracking-widest gap-2">
                            <MapPin size={14} className="text-[#FF00FF]" /> VEHICLE LOCATION
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-white/50 tracking-wdest uppercase block mb-1">PRICE / DAY</span>
                            <div className="text-2xl horizon-price text-white">
                                ₹ {String(vehicle.price_per_day).padStart(4, '0')}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
