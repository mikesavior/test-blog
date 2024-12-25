import imageCompression from 'browser-image-compression';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const validateImage = (file) => {
  if (!file) return 'No file provided';
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'File type not supported. Please upload JPEG, PNG, or WebP images.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File is too large. Maximum size is 5MB.';
  }
  return null;
};

export const compressImage = async (file) => {
  try {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/webp'
    };

    const compressedFile = await imageCompression(file, options);
    return new File([compressedFile], file.name.replace(/\.[^/.]+$/, '.webp'), {
      type: 'image/webp'
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image');
  }
};

export const createObjectURL = (file) => {
  if (!file) return null;
  return URL.createObjectURL(file);
};

export const revokeObjectURL = (url) => {
  if (url) URL.revokeObjectURL(url);
};
