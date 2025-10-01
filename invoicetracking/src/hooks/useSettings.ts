import { useEffect, useState } from "react";
import { SettingsService } from "../services/apiService";
import { useTheme } from "../controllers/theme";
import { useI18n } from "../i18n";
import { useAuth } from "./useAuth";
import { SettingsData, SystemSetting } from "../types/DatabaseModels";

// 🔹 Convert flat system settings into nested structure
function normalizeSettings(raw: SystemSetting[]): Omit<SettingsData, "user" | "profile"> {
    const normalized: Omit<SettingsData, "user" | "profile"> = {
        appearance: { theme: "light", language: "en" },
        security: { sessionTimeout: 30, mfaEnabled: false },
        notifications: { email: true, sms: false },
        superuser: {},
    };

    raw.forEach(({ key, value, type }) => {
        const [section, field] = key.split(".");
        let parsed: any = value;

        if (type === "boolean") parsed = value === "true" || value === true;
        if (type === "number") parsed = parseInt(value, 10);
        if (type === "json") {
            try {
                parsed = typeof value === "string" ? JSON.parse(value) : value;
            } catch {
                parsed = {};
            }
        }

        if ((normalized as any)[section]) {
            (normalized as any)[section][field] = parsed;
        }
    });

    return normalized;
}

// 🔹 Convert nested structure back to flat format
function denormalizeSettings(settings: SettingsData): SystemSetting[] {
    const flat: SystemSetting[] = [];

    Object.entries(settings).forEach(([section, values]) => {
        if (section === "user" || section === "profile") return;

        Object.entries(values as object).forEach(([field, val]) => {
            flat.push({
                key: `${section}.${field}`,
                value: String(val),
                type:
                    typeof val === "boolean"
                        ? "boolean"
                        : typeof val === "number"
                            ? "number"
                            : "string",
                category: section,
                isEditable: true,
                updated_at: new Date().toISOString(),
                updated_by: settings.user || "system",
            });
        });
    });

    return flat;
}

export function useSettings() {
    const { setTheme } = useTheme();
    const { setLocale } = useI18n();
    const { user } = useAuth();

    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 🔹 Fetch system settings once user is available
    useEffect(() => {
        if (!user) return; // wait for user to load

        const fetchSettings = async () => {
            setLoading(true);
            try {
                const systemSettings = await SettingsService.getSettings(); // should return SystemSetting[]
                const normalized = normalizeSettings(systemSettings);

                const merged: SettingsData = {
                    ...normalized,
                    user: user.name || "",
                    profile: {
                        name: user.name || "",
                        email: user.email || "",
                        avatar: user.avatar || "",
                        timezone: user.timezone || "UTC",
                    },
                };

                setSettings(merged);

                // Sync appearance
                if (merged.appearance.theme) setTheme(merged.appearance.theme);
                if (merged.appearance.language) setLocale(merged.appearance.language);
            } catch (err: any) {
                setError(err.message || "Failed to load settings");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [user]); // 🔹 re-run effect when user changes

    // 🔹 Update a single setting
    const updateSetting = (section: keyof SettingsData, key: string, value: any) => {
        setSettings((prev) =>
            prev
                ? {
                    ...prev,
                    [section]: {
                        ...(prev[section] as any),
                        [key]: value,
                    },
                }
                : prev
        );

        // Instant sync for appearance
        if (section === "appearance" && key === "theme") setTheme(value);
        if (section === "appearance" && key === "language") setLocale(value);
    };

    // 🔹 Save system settings
    const saveSettings = async () => {
        if (!settings) return;

        try {
            const payload = denormalizeSettings(settings);
            await SettingsService.updateAll(payload);
            console.log("Settings saved", payload);
        } catch (err) {
            console.error("Failed to save settings", err);
        }
    };

    return { settings, loading, error, updateSetting, saveSettings };
}
