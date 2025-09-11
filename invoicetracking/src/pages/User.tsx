import React, { useState } from 'react';
import { User as UserType, Permissions, UserRole } from '../types/auth';
import { Card } from '../components/Card';
import { Section } from '../components/Section';
import { Toolbar } from '../components/Toolbar';
import { Stat } from '../components/Stat';
import { Plus, Search, Filter } from 'lucide-react';
import { useAuth } from '../controllers/useAuth';
import { useUser } from '../hooks/useUser';

/*interface UserManagementProps {
    users: UserType[];
    currentUser: UserType;
    onUpdateUser: (userId: string, updates: Partial<UserType>) => void;
    onCreateUser: (userData: Partial<UserType>) => void;
}*/

export const UserManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [serviceFilter, setServiceFilter] = useState('all');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [userToEdit, setUserToEdit] = useState<UserType | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const { isSuperuser, hasPermission, user } = useAuth();
    const canManageUsers = isSuperuser() || hasPermission('manage_users');
    const canViewAllUsers = isSuperuser() || hasPermission('view_users');
    const { users, createUser, updateUser, deleteUser, loadingUsers } = useUser();
    const canAccess = (permission: string | null): boolean => {
        if (!permission) return true;
        return isSuperuser() || hasPermission(permission);
    };
    

    // Filter users based on permissions
    const visibleUsers = canViewAllUsers 
        ? users || []
        : (users || []).filter(user => user.serviceId === user.serviceId);


    const filteredUsers = visibleUsers.filter(user => {
        const matchesSearch = 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesService = serviceFilter === 'all' || user.serviceId === serviceFilter;
        
        return matchesSearch && matchesRole && matchesService;
    });
    /*const handleCreateUser = async () => {
        const newUser: Partial<UserType> = {
            name: 'New User',
            email: `user${Date.now()}@example.com`,
            role: 'admin',
            isActive: true,
            serviceId: user?.serviceId || 'default',
        };

        try {
            if (userToEdit) {
                await updateUser(userToEdit.id, newUser);
            } else {
                await createUser(newUser);
            }
        } catch (err) {
            console.error('Failed to create user:', err);
        }
    };*/


    const handleDeleteUser = async (userId: string) => {
        confirm('Are you sure you want to delete this user?');
        setConfirmDeleteId(userId)
        if (confirmDeleteId) {
            try {
                await deleteUser(userId); 
            } catch (err) {
                console.error('Failed to delete user:', err);
            }
        }
    };

    // Calculate statistics
    const stats = {
        total: filteredUsers.length,
        active: filteredUsers.filter(u => u.isActive).length,
        admins: filteredUsers.filter(u => u.role === 'admin').length,
        managers: filteredUsers.filter(u => u.role === 'manager').length
    };
    console.log('User from useAuth:', isSuperuser(),user);


    if (!canManageUsers) {
        return (
            <Card>
                <div className="text-center py-8">
                    <div className="text-red-500 text-4xl mb-4">🚫</div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Access Denied
                    </h2>

                    <p className="text-gray-600 dark:text-gray-300">
                        You don't have permission to manage users.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Statistics Overview */}
            <Section>
                <Stat label="Total Users" value={stats.total} />
                <Stat label="Active Users" value={stats.active} subtitle="Currently active" />
                <Stat label="Administrators" value={stats.admins} subtitle="Full access" />
                <Stat label="Managers" value={stats.managers} subtitle="Service managers" />
            </Section>

            {/* Search and Filters */}
            <Card>
                <Toolbar
                    left={
                        <div className="flex flex-col md:flex-row gap-2">
                            <div className="relative">
                                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">admin</option>
                                <option value="manager">manager</option>
                                <option value="user">employee</option>
                            </select>
                            {canViewAllUsers && (
                                <select
                                    value={serviceFilter}
                                    onChange={(e) => setServiceFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Services</option>
                                    <option value="accounting">Accounting</option>
                                    <option value="purchasing">Purchasing</option>
                                    <option value="finance">Finance</option>
                                    <option value="management">Management</option>
                                    <option value="hr">HR</option>
                                </select>
                            )}
                        </div>
                    }
                    right={
                        <button 
                            onClick={() => setShowCreateForm(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New User
                        </button>
                    }
                />
            </Card>
            {showCreateForm && (
                <Card>
                    <form
                        onSubmit={async (e) => {
                            ///type UserRole = 'admin' | 'manager' | 'user';
                            const formData = new FormData(e.currentTarget);

                            const roleValue = formData.get('role');
                            if (!roleValue || typeof roleValue !== 'string') {
                                throw new Error('Invalid role selected');
                            }

                            const role = roleValue as UserRole;
                            e.preventDefault();
                            const newUser: Partial<UserType> = {
                                name: formData.get('name') as string,
                                email: formData.get('email') as string,
                                role,
                                serviceId: formData.get('serviceId') as string,
                                isActive: true
                            };
                            try {
                                if (userToEdit) {
                                    await updateUser(userToEdit.id, newUser);
                                    setUserToEdit(null);
                                } else {
                                    await createUser(newUser);
                                }
                            } catch (err) {
                                console.error('Failed to create user:', err);
                            }
                            setShowCreateForm(false);
                        }}
                    >
                        <input name="name" defaultValue={userToEdit?.name || ''} placeholder="Name" required={!userToEdit}
 />
                        <input name="email" defaultValue={userToEdit?.email || ''} placeholder="Email" required={!userToEdit}
 />
                        <select name="role" defaultValue={userToEdit?.role || 'user'}>
                            <option value="user">employee</option>
                            <option value="manager">manager</option>
                            <option value="admin">admin</option>
                        </select>
                        <input name="serviceId" defaultValue={userToEdit?.serviceId || ''} placeholder="Service ID" required={!userToEdit}
 />
                        <button type="submit">
                            {userToEdit ? 'Update User' : 'Create User'}
                        </button>
                        <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
                    </form>
                </Card>
            )}
            {/* User List */}
            <Section>
                {filteredUsers.map((user) => (
                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                        {user.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    user.role === 'admin' 
                                        ? 'bg-red-100 text-red-800' 
                                        : user.role === 'manager'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {user.role}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    user.isActive 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                            Service: {user.serviceId}
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                            <button
                                onClick={() => { setUserToEdit(user); setShowCreateForm(true); } }
                               className="px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
                            >
                                Update
                            </button>
                            <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md"
                            >
                                Delete
                            </button>
                        </div>
                        
                    </Card>
                ))}
            </Section>

            {filteredUsers.length === 0 && (
                <Card>
                    <div className="text-center py-12">
                        <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No users match the search criteria</p>
                    </div>
                </Card>
            )}
        </div>
    );
};