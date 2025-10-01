import React, { useEffect, useState } from "react";
import { Save, User, Bell, Palette, Shield, Crown, Users, Key } from "lucide-react";
import Card from "../components/Card";
import { useSettings } from "../hooks/useSettings";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../i18n";
import { UserService } from "../services/apiService";

export const Settings = () => {
    const { settings, updateSetting, saveSettings, loading } = useSettings();
    const [activeTab, setActiveTab] = useState("profile");
    const [saving, setSaving] = useState(false);
    const { isSuperuser ,hasPermission } = useAuth();

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "appearance", label: "Appearance", icon: Palette },
        { id: "security", label: "Security", icon: Shield },
        ...(isSuperuser() || hasPermission("manage_users")
            ? [
                { id: "superuser", label: "Superuser", icon: Crown },
                { id: "permissions", label: "Permissions", icon: Key },
                { id: "groups", label: "Groups", icon: Users }
            ]
            : []),
    ];

    const handleSave = async () => {
        setSaving(true);
        await saveSettings();
        setSaving(false);
    };
    
    const { t } = useI18n();
    if (loading || !settings) {
        return <div className="text-gray-500 p-6">Loading settings...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Settings
                </h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <Card title="Settings">
                        <nav className="space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700"
                                            }`}
                                    >
                                        {Icon && <Icon className="w-4 h-4 mr-3" />}
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </Card>
                </div>

                {/* Content */}
                <div className="lg:col-span-3 space-y-6">
                    {activeTab === "profile" && (
                        <Card title="Profile Settings">
                            <h2 className="text-lg font-semibold mb-2">Profile</h2>
                            <input
                                defaultValue={settings.profile?.name || ""}
                                type="text"
                                placeholder="Full Name"
                                className="w-full mb-3 px-3 py-2 border rounded-lg dark:bg-gray-700"
                            />
                            <input
                                defaultValue={settings.profile?.email || ""}
                                type="email"
                                placeholder="Email"
                                className="w-full mb-3 px-3 py-2 border rounded-lg dark:bg-gray-700"
                            />
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Language
                                </label>
                                <select
                                    value={settings.appearance.language}
                                    onChange={(e) =>
                                        updateSetting("appearance", "language", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                                >
                                    <option value="en">English</option>
                                    <option value="fr">Français</option>
                                    {/*<option value="es">Español</option>
                                    <option value="de">Deutsch</option>*/}
                                </select>
                            </div>
                        </Card>
                    )}

                    {activeTab === "notifications" && (
                        <Card title="Notifications">
                            <div className="flex items-center justify-between mb-3">
                                <span>Email Notifications</span>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.email}
                                    onChange={(e) =>
                                        updateSetting(
                                            "notifications",
                                            "email",
                                            e.target.checked
                                        )
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span>SMS Notifications</span>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.sms}
                                    onChange={(e) =>
                                        updateSetting(
                                            "notifications",
                                            "sms",
                                            e.target.checked
                                        )
                                    }
                                />
                            </div>
                        </Card>
                    )}

                    {activeTab === "appearance" && (
                        <Card title="Appearance">
                            <h2 className="text-lg font-semibold mb-2">Appearance</h2>
                            <label className="block text-sm font-medium mb-1">Theme</label>
                            <select
                                value={settings.appearance.theme}
                                onChange={(e) =>
                                    updateSetting("appearance", "theme", e.target.value)
                                }
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                            >
                                <option value="light">{t('settings.theme.light')}</option>
                                <option value="dark">{t('settings.theme.dark')}</option>
                            </select>
                        </Card>
                    )}

                    {activeTab === "security" && (
                        <Card title="Security">
                            <h2 className="text-lg font-semibold mb-2">Security</h2>
                            <div className="flex items-center justify-between mb-3">
                                <span>Session Timeout (minutes)</span>
                                <input
                                    type="number"
                                    value={settings.security.sessionTimeout}
                                    onChange={(e) =>
                                        updateSetting(
                                            "security",
                                            "sessionTimeout",
                                            Number(e.target.value)
                                        )
                                    }
                                    className="w-24 px-2 py-1 border rounded-lg dark:bg-gray-700"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Multi-Factor Authentication</span>
                                <input
                                    type="checkbox"
                                    checked={settings.security.mfaEnabled}
                                    onChange={(e) =>
                                        updateSetting(
                                            "security",
                                            "mfaEnabled",
                                            e.target.checked
                                        )
                                    }
                                />
                            </div>
                        </Card>
                    )}

                    {activeTab === "superuser" && (
                        <Card title="Superuser Controls">
                            <div className="flex items-center justify-between mb-3">
                                <span>Enable Audit Logs</span>
                                <input
                                    type="checkbox"
                                    checked={settings.superuser?.auditLogsEnabled || false}
                                    onChange={(e) =>
                                        updateSetting(
                                            "superuser",
                                            "auditLogsEnabled",
                                            e.target.checked
                                        )
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between mb-3">
                                <span>Allow User Impersonation</span>
                                <input
                                    type="checkbox"
                                    checked={settings.superuser?.allowUserImpersonation || false}
                                    onChange={(e) =>
                                        updateSetting(
                                            "superuser",
                                            "allowUserImpersonation",
                                            e.target.checked
                                        )
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span>System-wide Notifications</span>
                                <input
                                    type="checkbox"
                                    checked={settings.superuser?.systemWideNotifications || false}
                                    onChange={(e) =>
                                        updateSetting(
                                            "superuser",
                                            "systemWideNotifications",
                                            e.target.checked
                                        )
                                    }
                                />
                            </div>
                        </Card>
                    )}

                    {activeTab === "permissions" && (
                        <PermissionsManager />
                    )}

                    {activeTab === "groups" && (
                        <GroupsManager />
                    )}
                </div>
            </div>
        </div>
    );
};

const PermissionsManager: React.FC = () => {
    const [allPermissions, setAllPermissions] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedCodenames, setSelectedCodenames] = useState<Set<string>>(new Set());

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [perms, userList] = await Promise.all([
                    UserService.listPermissions(),
                    UserService.getUsers(),
                ]);
                setAllPermissions(perms);
                setUsers(userList);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const onSelectUser = async (id: string) => {
        setSelectedUserId(id);
        const user = await UserService.getUser(id);
        setSelectedCodenames(new Set((user.permissions || []).map((p: any) => p.codename)));
    };

    const togglePerm = (codename: string) => {
        const next = new Set(selectedCodenames);
        if (next.has(codename)) next.delete(codename); else next.add(codename);
        setSelectedCodenames(next);
    };

    const save = async () => {
        if (!selectedUserId) return;
        setSaving(true);
        try {
            const current = new Set(selectedCodenames);
            const all = new Set(allPermissions.map(p => p.codename));
            // We need deltas vs current user state; fetch fresh
            const user = await UserService.getUser(selectedUserId);
            const existing = new Set((user.permissions || []).map((p: any) => p.codename));
            const add: string[] = Array.from(current).filter(c => !existing.has(c));
            const removed:any = Array.from(existing).filter(c => !current.has(c));
            await UserService.updateUserPermissions(selectedUserId, { add_permissions: add, remove_permissions: removed });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Card title="Permissions"><div>Loading...</div></Card>;

    return (
        <Card title="User Permissions">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">User</label>
                    <select className="w-full border rounded px-2 py-1" value={selectedUserId} onChange={e => onSelectUser(e.target.value)}>
                        <option value="">Select a user</option>
                        {users.map((u: any) => (
                            <option key={u.id} value={u.id}>{u.name || u.email}</option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Permissions</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-auto border rounded p-2">
                        {allPermissions.map((p: any) => (
                            <label key={p.id} className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={selectedCodenames.has(p.codename)} onChange={() => togglePerm(p.codename)} />
                                <span className="text-gray-700">{p.content_type.app_label}.{p.codename}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-4 flex justify-end">
                <button disabled={!selectedUserId || saving} onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            </div>
        </Card>
    );
};

const GroupsManager: React.FC = () => {
    const [groups, setGroups] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [selectedGroupNames, setSelectedGroupNames] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [groupList, userList] = await Promise.all([
                    UserService.listGroups(),
                    UserService.getUsers(),
                ]);
                setGroups(groupList);
                setUsers(userList);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const onSelectUser = async (id: string) => {
        setSelectedUserId(id);
        const user = await UserService.getUser(id);
        setSelectedGroupNames(new Set((user.groups || []).map((g: any) => g.name)));
    };

    const toggleGroup = (name: string) => {
        const next = new Set(selectedGroupNames);
        if (next.has(name)) next.delete(name); else next.add(name);
        setSelectedGroupNames(next);
    };

    const save = async () => {
        if (!selectedUserId) return;
        setSaving(true);
        try {
            // compute deltas versus current
            const user = await UserService.getUser(selectedUserId);
            const existing = new Set((user.groups || []).map((g: any) => g.name));
            const target = new Set(selectedGroupNames);
            const set_groups = Array.from(target);
            await UserService.updateUserGroups(selectedUserId, { set_groups });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Card title="Groups"><div>Loading...</div></Card>;

    return (
        <Card title="User Groups">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">User</label>
                    <select className="w-full border rounded px-2 py-1" value={selectedUserId} onChange={e => onSelectUser(e.target.value)}>
                        <option value="">Select a user</option>
                        {users.map((u: any) => (
                            <option key={u.id} value={u.id}>{u.name || u.email}</option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Groups</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-auto border rounded p-2">
                        {groups.map((g: any) => (
                            <label key={g.id} className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={selectedGroupNames.has(g.name)} onChange={() => toggleGroup(g.name)} />
                                <span className="text-gray-700">{g.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-4 flex justify-end">
                <button disabled={!selectedUserId || saving} onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            </div>
        </Card>
    );
};
