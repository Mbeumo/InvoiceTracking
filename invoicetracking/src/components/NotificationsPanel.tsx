import React, { useEffect, useState } from 'react';
import { fetchNotifications, markNotification } from '../controllers/notifications';

export const NotificationsPanel: React.FC = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await fetchNotifications();
            setItems(data.results || data);
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const markRead = async (id: string) => {
        await markNotification(id, { isRead: true });
        load();
    };

    return (
        <div className="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <h4 className="font-semibold mb-3">Notifications</h4>
            {loading && <div className="text-sm">Loading...</div>}
            <div className="space-y-2">
                {items.map((n) => (
                    <div key={n.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                        <div>
                            <div className="font-medium">{n.title || n.type}</div>
                            <div className="text-xs text-gray-500">{n.message}</div>
                        </div>
                        {!n.isRead && (
                            <button onClick={() => markRead(n.id)} className="px-2 py-1 text-xs border rounded-md">Mark read</button>
                        )}
                    </div>
                ))}
                {!loading && items.length === 0 && <div className="text-sm text-gray-500">No notifications</div>}
            </div>
        </div>
    );
};


