import React, { useState } from 'react';
import { User as UserType, UserRole } from '../types/auth';
import { Card } from '../components/Card';
import { Section } from '../components/Section';
import { Toolbar } from '../components/Toolbar';
import { Stat } from '../components/Stat';
import { Plus, Search, Filter } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { useDepartments } from '../hooks/useDepartments';

export const UserManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [serviceFilter, setServiceFilter] = useState('all');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [userToEdit, setUserToEdit] = useState<UserType | null>(null);

    const { isSuperuser, hasPermission, user, isLoading } = useAuth();
    const { users, createUser, updateUser, deleteUser } = useUser();
    const { departments, loading: depsLoading, error: depsError } = useDepartments();

    const canManageUsers = isSuperuser() || hasPermission('manage_users');
    const canViewAllUsers = isSuperuser() || hasPermission('view_users');

    // Visible scope
    const visibleUsers = canViewAllUsers
        ? users || []
        : (users || []).filter((u) => u.service_id === user?.service_id);

    // Filters
    const filteredUsers = visibleUsers.filter((u) => {
        const matchesSearch =
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        const matchesService =
            serviceFilter === 'all' || u.service === serviceFilter;

        return matchesSearch && matchesRole && matchesService;
    });

    const handleDeleteUser = async (userId: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(userId);
            } catch (err) {
                console.error('Failed to delete user:', err);
            }
        }
    };

    const stats = {
        total: filteredUsers.length,
        active: filteredUsers.filter((u) => u.is_active).length,
        admins: filteredUsers.filter((u) => u.role === 'admin').length,
        managers: filteredUsers.filter((u) => u.role === 'manager').length,
    };

    if (!canManageUsers) {
        return (
            <Card className="p-6 text-center">
                <div className="text-red-500 text-5xl mb-4">🚫</div>
                <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    You don't have permission to manage users.
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <Section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Stat label="Total Users" value={stats.total} />
                <Stat label="Active Users" value={stats.active} subtitle="Currently active" />
                <Stat label="Administrators" value={stats.admins} subtitle="Full access" />
                <Stat label="Managers" value={stats.managers} subtitle="Service managers" />
            </Section>

            {/* Filters & Actions */}
            <Card>
                <Toolbar
                    left={
                        <div className="flex flex-col md:flex-row gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>

                            {/* Role filter */}
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                                <option value="user">Employee</option>
                            </select>

                            {/* Department filter */}
                            {canViewAllUsers && (
                                <select
                                    value={serviceFilter}
                                    onChange={(e) => setServiceFilter(e.target.value)}
                                    disabled={isLoading || depsLoading}
                                    className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">
                                        {depsLoading
                                            ? 'Loading...'
                                            : depsError
                                                ? 'Failed to load'
                                                : 'All Departments'}
                                    </option>
                                    {departments.map((d) => (
                                        <option key={d.service_id} value={d.name}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    }
                    right={
                        <button
                            onClick={() => {
                                setUserToEdit(null);
                                setShowCreateForm(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center shadow transition-transform hover:scale-105"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New User
                        </button>
                    }
                />
            </Card>

            {/* Create / Update Form */}
            {showCreateForm && (
                <Card className="p-6">
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const role = formData.get('role') as UserRole;
                            const newUser: Partial<UserType> = {
                                name: formData.get('name') as string,
                                email: formData.get('email') as string,
                                role,
                                service_id: formData.get('serviceId') as string,
                                is_active: true,
                            };

                            try {
                                if (userToEdit) {
                                    await updateUser(userToEdit.id, newUser);
                                    setUserToEdit(null);
                                } else {
                                    await createUser(newUser);
                                }
                            } catch (err) {
                                console.error('Failed to save user:', err);
                            }
                            setShowCreateForm(false);
                        }}
                        className="grid gap-4"
                    >
                        <input
                            name="name"
                            defaultValue={userToEdit?.name || ''}
                            placeholder="Name"
                            required
                            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            name="email"
                            defaultValue={userToEdit?.email || ''}
                            placeholder="Email"
                            required
                            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            name="role"
                            defaultValue={userToEdit?.role || 'user'}
                            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="user">Employee</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>

                        {/* Department select */}
                        <select
                            name="serviceId"
                            defaultValue={userToEdit?.service_id || ''}
                            disabled={isLoading || depsLoading}
                            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">
                                {depsLoading
                                    ? 'Loading...'
                                    : depsError
                                        ? 'Failed to load'
                                        : 'Select Department'}
                            </option>
                            {departments.map((d) => (
                                <option key={d.service_id} value={d.service_id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow"
                            >
                                {userToEdit ? 'Update User' : 'Create User'}
                            </button>
                        </div>
                    </form>
                </Card>
            )}

            {/* User list */}
            <Section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredUsers.map((u) => (
                    <Card key={u.id} className="p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                                {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-medium">{u.name}</h3>
                                <p className="text-sm text-gray-500">{u.email}</p>
                                <p className="text-xs text-gray-400">
                                    {u.service || 'No department'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <span
                                className={`px-2 py-1 text-xs rounded-full ${u.role === 'admin'
                                        ? 'bg-red-100 text-red-700'
                                        : u.role === 'manager'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {u.role}
                            </span>
                            <span
                                className={`px-2 py-1 text-xs rounded-full ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {u.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            {canManageUsers && (
                                <>
                                    <button
                                        onClick={() => {
                                            setUserToEdit(u);
                                            setShowCreateForm(true);
                                        }}
                                        className="px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
                                    >
                                        Update
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(u.id)}
                                        className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md"
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </Card>
                ))}
            </Section>

            {/* Empty state */}
            {filteredUsers.length === 0 && (
                <Card className="p-10 text-center">
                    <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No users match the search criteria</p>
                </Card>
            )}
        </div>
    );
};
