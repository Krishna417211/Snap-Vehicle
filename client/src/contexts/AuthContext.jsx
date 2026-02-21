import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await api.get('/auth/me');
                setUser(data.data.user);
            } catch (err) {
                // User not logged in, or invalid token
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        setUser(data.data.user);
    };

    const signup = async (email, password, name, role) => {
        const { data } = await api.post('/auth/signup', { email, password, name, role });
        setUser(data.data.user);
    };

    const logout = async () => {
        await api.get('/auth/logout');
        setUser(null);
    };

    const switchRole = async () => {
        const { data } = await api.post('/auth/switch-role');
        setUser(data.data.user);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, switchRole, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
