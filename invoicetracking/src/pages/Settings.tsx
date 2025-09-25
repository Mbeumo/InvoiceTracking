import React, { useState } from "react";
import {
    Save,
    User,
    Bell,
    Palette,
    Shield,
    Crown,
} from "lucide-react";
import Card from "../components/Card";
import { useSettings } from "../hooks/useSettings";
import { SystemSetting as SettingsType } from "../types/DatabaseModels";
import { useAuth } from "../hooks/useAuth";
export const Settings = () => {
    const { settings, updateSetting, saveSettings, loading } = useSettings();
    const [activeTab, setActiveTab] = useState("profile");
    const [saving, setSaving] = useState(false);
    const { isSuperuser } = useAuth();

    /*if (!settings) {
        return <div className="text-gray-500 p-6">Loading settings...</div>;
    }*/

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "appearance", label: "Appearance", icon: Palette },
        { id: "security", label: "Security", icon: Shield },
        ...(isSuperuser()
            ? [{ id: "superuser", label: "Superuser", icon: Crown }]
            : [{ id: "not a super user " }]),
    ];

    const handleSave = async () => {
        setSaving(true);
        await saveSettings();
        setSaving(false);
    };

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
                                        <Icon className="w-4 h-4 mr-3" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </Card>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    {activeTab === "profile" && (
                        <Card title="Profile Settings">
                            {/* Profile editing similar to your code */}
                            <h2 className="text-lg font-semibold">Profile</h2>
                            <input
                                type="text"
                                placeholder="Full Name"
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                            />
                            <div>
                                <label className="block text-sm font-medium mb-1">Language</label>
                                <select
                                    value={appearance.language}
                                    onChange={(e) => updateSetting("language", e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                                >
                                    <option value="en">English</option>
                                    <option value="fr">Français</option>
                                    <option value="es">Español</option>
                                    <option value="de">Deutsch</option>
                                </select>
                            </div>
                        </Card>
                    )}

                    {activeTab === "notifications" && (
                        <Card title="Notifications">
                            {/* Notifications toggles */}
                        </Card>
                    )}

                    {activeTab === "appearance" && (
                        <Card title="Appearance">
                            <h2 className="text-lg font-semibold">Appearance</h2>

                            {/* Theme */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Theme</label>
                                <select
                                    value={appearance.theme}
                                    onChange={(e) => updateSetting("theme", e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                </select>
                            </div>
                        </Card>
                    )}

                    {activeTab === "security" && (
                        <Card title="Security">
                            <h2 className="text-lg font-semibold">Security</h2>
                            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                Change Password
                            </button>
                        </Card>
                    )}

                    {activeTab === "superuser" && (
                        <Card title="Superuser Controls">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        Enable Audit Logs
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={settings.superuser?.auditLogsEnabled}
                                        onChange={(e) =>
                                            updateSetting("superuser", "auditLogsEnabled", e.target.checked)
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        Allow User Impersonation
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={settings.superuser?.allowUserImpersonation}
                                        onChange={(e) =>
                                            updateSetting("superuser", "allowUserImpersonation", e.target.checked)
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        System-wide Notifications
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={settings.superuser?.systemWideNotifications}
                                        onChange={(e) =>
                                            updateSetting("superuser", "systemWideNotifications", e.target.checked)
                                        }
                                    />
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};
