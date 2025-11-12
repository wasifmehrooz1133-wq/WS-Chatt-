// This service fetches the API key from our secure Netlify function.
// It caches the key so we only need to fetch it once per session.

let cachedApiKey: string | null = null;

export const getApiKey = async (): Promise<string> => {
    if (cachedApiKey) {
        return cachedApiKey;
    }

    try {
        const response = await fetch('/.netlify/functions/getApiKey');
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to fetch API key from server.' }));
            throw new Error(errorData.error || 'Failed to fetch API key from server.');
        }

        const data = await response.json();
        if (!data.apiKey) {
            throw new Error('API key was not provided by the server.');
        }
        
        cachedApiKey = data.apiKey;
        return cachedApiKey;
    } catch (error) {
        console.error('API Key fetch error:', error);
        throw new Error("Could not retrieve API key. Ensure the app is deployed to Netlify or running with 'netlify dev'.");
    }
};
