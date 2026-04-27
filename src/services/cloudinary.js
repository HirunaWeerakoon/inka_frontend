export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
    });

    const data = await response.json();
    if (!response.ok || !data.url) {
        throw new Error(data.error || data.message || 'Upload failed');
    }

    return data.url;
};
