import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Success() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading');
    const navigate = useNavigate();

    const sessionId = searchParams.get('session_id');
    const bookingId = searchParams.get('booking_id');

    useEffect(() => {
        if (!sessionId || !bookingId) {
            setStatus('error');
            return;
        }

        const verify = async () => {
            try {
                await api.post('/checkout/verify', {
                    session_id: sessionId,
                    booking_id: bookingId
                });
                setStatus('success');
            } catch (err) {
                toast.error('Verification error: ' + (err.response?.data?.message || err.message));
                setStatus('error');
            }
        };

        verify();
    }, [sessionId, bookingId]);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            {status === 'loading' && (
                <div className="text-center">
                    <Loader2 size={64} className="animate-spin text-[#00FFFF] mx-auto mb-6" />
                    <h1 className="text-4xl horizon-title text-white animate-pulse drop-shadow-[0_0_15px_rgba(0,255,255,0.8)]">VERIFYING BOOKING...</h1>
                </div>
            )}

            {status === 'success' && (
                <div className="text-center max-w-lg border border-white/20 bg-white/5 backdrop-blur-xl p-10 shadow-[0_0_40px_rgba(255,0,255,0.4)]">
                    <CheckCircle size={80} className="text-[#FF00FF] mx-auto mb-6 drop-shadow-[0_0_20px_rgba(255,0,255,1)]" />
                    <h1 className="text-5xl horizon-title text-white mb-4">BOOKING CONFIRMED</h1>
                    <p className="text-white/70 font-bold uppercase tracking-widest text-sm mb-8">
                        Your payment was successful. The host has been notified.
                    </p>
                    <div className="flex flex-col gap-4">
                        <Link to="/explore" className="horizon-btn">
                            <span>RETURN TO CATALOG</span>
                        </Link>
                        <Link to="/dashboard" className="text-[#00FFFF] font-bold tracking-widest hover:text-[#FF00FF] text-sm horizon-title transition-colors py-2">
                            VIEW MY BOOKINGS
                        </Link>
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div className="text-center max-w-lg border border-red-500/50 bg-red-500/10 backdrop-blur-xl p-10">
                    <h1 className="text-5xl horizon-title text-red-500 mb-4 drop-shadow-[0_0_20px_rgba(255,0,0,1)]">BOOKING FAILED</h1>
                    <p className="text-white/70 font-bold uppercase tracking-widest text-sm mb-8">
                        Payment verification failed or session expired. The booking has been cancelled.
                    </p>
                    <button onClick={() => navigate('/explore')} className="horizon-btn bg-red-500 hover:bg-red-600">
                        <span>RETURN TO CATALOG</span>
                    </button>
                </div>
            )}
        </div>
    );
}
