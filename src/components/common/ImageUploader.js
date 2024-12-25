import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  LinearProgress,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { validateImage, compressImage, createObjectURL, revokeObjectURL } from '../../utils/imageUtils';

const ImageUploader = ({ onImagesSelected, existingImages = [], onImageRemove }) => {
  const [uploadProgress, setUploadProgress] = useState({});
  const [previewUrls, setPreviewUrls] = useState([]);

  const onDrop = useCallback(async (acceptedFiles) => {
    const validFiles = [];
    const newPreviewUrls = [];

    for (const file of acceptedFiles) {
      const error = validateImage(file);
      if (error) {
        console.error(`Invalid file ${file.name}:`, error);
        continue;
      }

      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        const compressedFile = await compressImage(file);
        const previewUrl = createObjectURL(compressedFile);
        
        validFiles.push(compressedFile);
        newPreviewUrls.push(previewUrl);
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
      }
    }

    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    if (validFiles.length > 0) {
      onImagesSelected(validFiles);
    }
  }, [onImagesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024,
    multiple: true
  });

  const handleRemovePreview = (index) => {
    revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.500',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 40, mb: 1 }} />
        <Typography>
          {isDragActive
            ? "Drop the images here"
            : "Drag 'n' drop images here, or click to select"}
        </Typography>
        <Typography variant="caption" display="block">
          Supports JPEG, PNG, WebP up to 5MB
        </Typography>
      </Box>

      {Object.entries(uploadProgress).map(([filename, progress]) => (
        progress < 100 && (
          <Box key={filename} sx={{ mt: 2 }}>
            <Typography variant="caption">{filename}</Typography>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )
      ))}

      {(existingImages.length > 0 || previewUrls.length > 0) && (
        <ImageList sx={{ width: '100%', mt: 2 }} cols={3} rowHeight={164}>
          {existingImages.map((image, index) => (
            <ImageListItem key={`existing-${index}`}>
              <img
                src={image.url}
                alt={`Uploaded ${index + 1}`}
                loading="lazy"
              />
              <ImageListItemBar
                actionIcon={
                  <IconButton
                    sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                    onClick={() => onImageRemove(image.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              />
            </ImageListItem>
          ))}
          {previewUrls.map((url, index) => (
            <ImageListItem key={`preview-${index}`}>
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                loading="lazy"
              />
              <ImageListItemBar
                actionIcon={
                  <IconButton
                    sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                    onClick={() => handleRemovePreview(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </Box>
  );
};

export default ImageUploader;
