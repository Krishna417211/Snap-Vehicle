export const parseImages = (imagesData) => {
    const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1541348263662-e06836264be8?q=80&w=2000&auto=format&fit=crop";
    if (!imagesData) return [DEFAULT_IMAGE];

    if (Array.isArray(imagesData)) {
        return imagesData.length > 0 ? imagesData : [DEFAULT_IMAGE];
    }

    if (typeof imagesData === 'string') {
        try {
            const parsed = JSON.parse(imagesData);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
            if (imagesData.startsWith('http') || imagesData.startsWith('/')) {
                return [imagesData];
            }
        }
    }

    return [DEFAULT_IMAGE];
};
