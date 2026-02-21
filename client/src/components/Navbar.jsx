import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Car, User, LogOut, FileText } from 'lucide-react';

export default function Navbar() {
    const { user, logout, switchRole } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center group">
                            <Car className="h-8 w-8 text-[#00FFFF] group-hover:text-[#FF00FF] transition-colors stroke-[2]" />
                            <span className="ml-2 font-bold text-3xl text-white horizon-title hover:text-[#00FFFF] transition-colors">SwiftRent</span>
                        </Link>
                    </div>
                    <div className="flex flex-wrap sm:flex-nowrap items-center space-x-2 sm:space-x-4">
                        {user ? (
                            <>
                                <button
                                    onClick={switchRole}
                                    className="horizon-btn text-sm"
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '1rem' }}
                                >
                                    <span>{user.role === 'HOST' ? 'TO RENTING' : 'TO FESTIVAL'}</span>
                                </button>
                                {user.role === 'HOST' ? (
                                    <Link to="/host" className="horizon-title text-white hover:text-[#00FFFF] px-2 py-1 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#FF00FF] after:opacity-0 hover:after:opacity-100 after:transition-opacity">
                                        FESTIVAL HQ
                                    </Link>
                                ) : (
                                    <Link to="/dashboard" className="horizon-title text-white hover:text-[#00FFFF] flex items-center gap-1 px-2 py-1 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#FF00FF] after:opacity-0 hover:after:opacity-100 after:transition-opacity">
                                        <FileText size={20} className="stroke-[2]" /> MY RENTALS
                                    </Link>
                                )}
                                <div className="flex items-center gap-2 border-l border-white/20 pl-4 ml-2">
                                    <span className="horizon-title text-[#00FFFF] tracking-widest">{user.name}</span>
                                    <button onClick={handleLogout} className="text-white hover:text-[#FF00FF] transition-colors">
                                        <LogOut size={24} className="stroke-[2]" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="horizon-title text-white hover:text-[#00FFFF] px-3 py-2 text-xl relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#FF00FF] after:opacity-0 hover:after:opacity-100 after:transition-opacity">
                                    LOG IN
                                </Link>
                                <Link to="/signup" className="horizon-btn">
                                    <span>SIGN UP</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
