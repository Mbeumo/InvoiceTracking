import { useEffect, useState } from "react";
import { SettingsService } from "../services/apiService"; // your API wrapper
import { useTheme } from "../controllers/theme";
import { useI18n } from "../i18n";
import { SettingsData } from "../types/DatabaseModels"; 


export function useSettings() {
    const { theme, setTheme } = useTheme();
    const { locale, setLocale } = useI18n();

    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const data = await SettingsService.getSettings(); // implement in your apiService
                setSettings(data);

                // Sync appearance with context
                if (data.appearance?.theme) setTheme(data.appearance.theme);
                if (data.appearance?.language) setLocale(data.appearance.language);
            } catch (err: any) {
                setError(err.message || "Failed to load settings");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    // Update single section
    const updateSetting = (section: keyof SettingsData, key: string, value: any) => {
        setSettings((prev) =>
            prev
                ? {
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [key]: value,
                    },
                }
                : prev
        );

        // Sync theme/lang instantly
        if (section === "appearance" && key === "theme") setTheme(value);
        if (section === "appearance" && key === "language") setLocale(value);
        // (section === "appearance" && key === currency") 

    };

    const saveSettings = async () => {
        if (!settings) return;
        try {
            await SettingsService.updateSettings(settings);
            console.log("Settings saved", settings);
        } catch (err) {
            console.error("Failed to save settings", err);
        }
    };

    return { settings, loading, error, updateSetting, saveSettings };
}
