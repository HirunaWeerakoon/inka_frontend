import axios from 'axios';

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await axios.post('/api/images/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!response.data.url) {
            throw new Error('Upload failed: No URL returned');
        }

        return response.data.url;
    } catch (error) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || error.message || 'Upload failed');
    }
};
