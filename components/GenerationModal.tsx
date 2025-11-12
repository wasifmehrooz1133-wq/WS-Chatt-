
import React, { useState, useEffect, useRef } from 'react';
import { XIcon } from './Icons';

export type ModalMode = 'generate-image' | 'edit-image' | 'generate-video';

interface GenerationModalProps {
    mode: ModalMode;
    onClose: () => void;
    onGenerateImage: (prompt: string) => void;
    onEditImage: (prompt: string, imageBase64: string, mimeType: string) => void;
    onGenerateVideo: (prompt: string, imageBase64: string, mimeType: string, aspectRatio: '16:9' | '9:16') => void;
}

const fileToDataUri = (file: File): Promise<{ data: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve({ data: event.target?.result as string, mimeType: file.type });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export default function GenerationModal({ mode, onClose, onGenerateImage, onEditImage, onGenerateVideo }: GenerationModalProps) {
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState<{ data: string; mimeType: string; } | null>(null);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [hasVeoKey, setHasVeoKey] = useState(false);
    const [error, setError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const checkVeoKey = async () => {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setHasVeoKey(hasKey);
        } else {
            // If in an environment without the hook, assume key is available via process.env
            setHasVeoKey(!!process.env.API_KEY);
        }
    };

    useEffect(() => {
        if (mode === 'generate-video') {
            checkVeoKey();
        }
    }, [mode]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const imageData = await fileToDataUri(file);
                setImage(imageData);
                setError('');
            } catch (err) {
                setError('Failed to read file.');
            }
        }
    };

    const handleSubmit = () => {
        if (!prompt.trim()) {
            setError("Prompt cannot be empty.");
            return;
        }

        switch (mode) {
            case 'generate-image':
                onGenerateImage(prompt);
                break;
            case 'edit-image':
                if (!image) { setError("Please upload an image to edit."); return; }
                onEditImage(prompt, image.data, image.mimeType);
                break;
            case 'generate-video':
                if (!image) { setError("Please upload an image for the video."); return; }
                onGenerateVideo(prompt, image.data, image.mimeType, aspectRatio);
                break;
        }
        onClose();
    };

    const handleSelectKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            // Assume success and re-check, which will update the UI
            await checkVeoKey();
        }
    };

    const titles: Record<ModalMode, string> = {
        'generate-image': 'Generate Image',
        'edit-image': 'Edit Image',
        'generate-video': 'Generate Video from Image',
    };

    const needsImageUpload = mode === 'edit-image' || mode === 'generate-video';

    return (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col">
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">{titles[mode]}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6 text-gray-500" /></button>
                </header>
                
                <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                    {mode === 'generate-video' && !hasVeoKey && (
                        <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                            <h3 className="font-bold">API Key Required</h3>
                            <p className="text-sm">Video generation with Veo requires a selected API key. Please select one to proceed.</p>
                            <div className="mt-2">
                                <button onClick={handleSelectKey} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm mr-2">Select Key</button>
                                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-sm text-yellow-800 hover:underline">Learn about billing</a>
                            </div>
                        </div>
                    )}
                    
                    {needsImageUpload && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                            <div
                                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {image ? (
                                    <img src={image.data} alt="Upload preview" className="max-h-40 rounded-md" />
                                ) : (
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        <p className="text-sm text-gray-600">Click to upload an image</p>
                                    </div>
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </div>
                    )}

                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
                        <textarea
                            id="prompt"
                            rows={3}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            placeholder={mode === 'edit-image' ? 'e.g., Add a retro filter' : 'e.g., A cinematic shot of a robot surfing'}
                        />
                    </div>
                    
                    {mode === 'generate-video' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
                            <div className="flex space-x-4">
                                <button onClick={() => setAspectRatio('16:9')} className={`px-4 py-2 rounded-md border ${aspectRatio === '16:9' ? 'bg-primary text-white' : 'bg-white'}`}>16:9 (Landscape)</button>
                                <button onClick={() => setAspectRatio('9:16')} className={`px-4 py-2 rounded-md border ${aspectRatio === '9:16' ? 'bg-primary text-white' : 'bg-white'}`}>9:16 (Portrait)</button>
                            </div>
                        </div>
                    )}
                    
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>

                <footer className="flex justify-end p-4 border-t bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-white rounded-md disabled:bg-gray-400" disabled={mode === 'generate-video' && !hasVeoKey}>
                        Generate
                    </button>
                </footer>
            </div>
        </div>
    );
}