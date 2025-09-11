export type FeatureFlag =
    | 'realtime'
    | 'ocr_upload'
    | 'notifications'
    | 'exports'
    | 'analytics';

const defaults: Record<FeatureFlag, boolean> = {
    realtime: true,
    ocr_upload: true,
    notifications: true,
    exports: true,
    analytics: true
};

export const getFlag = (name: FeatureFlag): boolean => {
    const raw = localStorage.getItem(`flag:${name}`);
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    return defaults[name];
};

export const setFlag = (name: FeatureFlag, value: boolean) => {
    localStorage.setItem(`flag:${name}`, value ? 'true' : 'false');
};


