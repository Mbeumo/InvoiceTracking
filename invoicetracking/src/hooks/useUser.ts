// hooks/useUser.ts
import { useState, useEffect } from 'react';
import { User } from '../types/auth';
import { UserService } from '../services/apiService';

export const useUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Fetch all users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await UserService.getUsers();
                setUsers(data);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchUsers();
    }, []);

    // Create new user
    const createUser = async (userData: Partial<User>) => {
        try {
            const newUser = await UserService.createUser(userData);
            setUsers(prev => [...prev, newUser]);
            return newUser;
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    };

    // Optional: update user
    const updateUser = async (id: string, updates: Partial<User>) => {
        try {
            const updated = await UserService.updateUser(id, updates);
            setUsers(prev => prev.map(u => (u.id === id ? updated : u)));
            return updated;
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    };

    // Optional: delete user
    const deleteUser = async (id: string) => {
        try {
            await UserService.deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    };

    return {
        users,
        loadingUser,
        loadingUsers,
        error,
        createUser,
        updateUser,
        deleteUser
    };
};