import React from 'react';
import { useI18n } from '../i18n';
import { useTheme } from '../controllers/theme';
import { Settings } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
    const { t, locale, setLocale } = useI18n();
    const { theme, setTheme, toggleTheme } = useTheme();

    return (
        <div className="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center mb-4">
                <Settings className="h-5 w-5 mr-2" />
                <h3 className="text-lg font-semibold">{t('settings.title')}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('settings.language')}
                    </label>
                    <select
                        value={locale}
                        onChange={(e) => setLocale(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('settings.theme')}
                    </label>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setTheme('light')}
                            className={`px-3 py-2 rounded-md border text-sm ${theme === 'light' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100'}`}
                        >
                            {t('settings.theme.light')}
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={`px-3 py-2 rounded-md border text-sm ${theme === 'dark' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100'}`}
                        >
                            {t('settings.theme.dark')}
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="ml-auto px-3 py-2 rounded-md border text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            Toggle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


