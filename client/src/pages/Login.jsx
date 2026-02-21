import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Car } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Car className="h-16 w-16 text-[#00FFFF] drop-shadow-[0_0_15px_rgba(0,255,255,0.8)]" />
                </div>
                <h2 className="mt-6 text-center text-4xl horizon-title text-white drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">SIGN IN</h2>
                <p className="mt-2 text-center text-sm font-bold tracking-widest uppercase text-white/50">
                    OR <Link to="/signup" className="text-[#00FFFF] hover:text-[#FF00FF] transition-colors">CREATE A NEW ACCOUNT</Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/5 py-8 px-4 sm:rounded-xl sm:px-10 border border-white/20 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/20 text-white p-3 rounded text-sm border border-red-500">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-white/70 uppercase tracking-widest">EMAIL ADDRESS</label>
                            <div className="mt-1">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-3 border border-white/20 rounded bg-black/30 text-white placeholder-white/30 focus:outline-none focus:border-[#00FFFF] sm:text-sm"
                                    placeholder="your-email@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-white/70 uppercase tracking-widest">PASSWORD</label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-3 border border-white/20 rounded bg-black/30 text-white placeholder-white/30 focus:outline-none focus:border-[#00FFFF] sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 bg-black border-white/20 rounded text-[#FF00FF] focus:ring-0" />
                                <label className="ml-2 block text-xs font-bold uppercase tracking-widest text-white/60">REMEMBER ME</label>
                            </div>
                            <div className="text-xs transition-colors">
                                <a href="#" className="font-bold text-[#FF00FF] hover:text-[#00FFFF] tracking-widest uppercase">FORGOT PASSWORD?</a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="horizon-btn w-full !block !py-3"
                            >
                                <span>{loading ? 'SIGNING IN...' : 'SIGN IN'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
