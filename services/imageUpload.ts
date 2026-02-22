import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

const IMGBB_API_KEY = '6606979c8ecda9fbc8f31b0a05fc7e8a';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

export interface UploadResult {
  url: string;
  deleteUrl: string;
  thumbnail: string;
}

/**
 * Request camera/media library permissions
 */
async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return true;

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Please grant access to your photo library to upload images.'
    );
    return false;
  }
  return true;
}

/**
 * Launch the image picker and return the selected image URI
 */
export async function pickImage(): Promise<string | null> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  return result.assets[0].uri;
}

/**
 * Launch the camera and return the captured image URI
 */
export async function takePhoto(): Promise<string | null> {
  if (Platform.OS === 'web') {
    Alert.alert('Not Available', 'Camera is not available on web.');
    return null;
  }

  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Please grant camera access to take photos.'
    );
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  return result.assets[0].uri;
}

/**
 * Upload an image to ImgBB from a local URI
 * Returns the uploaded image URL
 */
export async function uploadToImgBB(imageUri: string): Promise<UploadResult> {
  // Convert the image URI to base64
  const response = await fetch(imageUri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];

        const formData = new FormData();
        formData.append('key', IMGBB_API_KEY);
        formData.append('image', base64Data);

        const uploadResponse = await fetch(IMGBB_UPLOAD_URL, {
          method: 'POST',
          body: formData,
        });

        const data = await uploadResponse.json();

        if (!data.success) {
          throw new Error(data.error?.message || 'Upload failed');
        }

        resolve({
          url: data.data.url,
          deleteUrl: data.data.delete_url,
          thumbnail: data.data.thumb?.url || data.data.url,
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Pick an image and upload it to ImgBB in one step
 * Returns the uploaded image URL or null if cancelled
 */
export async function pickAndUploadImage(): Promise<UploadResult | null> {
  const uri = await pickImage();
  if (!uri) return null;

  return uploadToImgBB(uri);
}

/**
 * Take a photo and upload it to ImgBB in one step
 * Returns the uploaded image URL or null if cancelled
 */
export async function takeAndUploadPhoto(): Promise<UploadResult | null> {
  const uri = await takePhoto();
  if (!uri) return null;

  return uploadToImgBB(uri);
}

/**
 * Show an action sheet to choose between camera and gallery,
 * then pick/take and upload the image
 */
export function showImagePickerOptions(
  onUploadStart: () => void,
  onUploadComplete: (result: UploadResult) => void,
  onUploadError: (error: Error) => void
): void {
  const options = Platform.OS === 'web'
    ? ['Choose from Gallery', 'Cancel']
    : ['Take Photo', 'Choose from Gallery', 'Cancel'];

  const cancelIndex = options.length - 1;

  Alert.alert('Upload Photo', 'Choose an option', [
    ...(Platform.OS !== 'web'
      ? [
          {
            text: 'Take Photo',
            onPress: async () => {
              onUploadStart();
              try {
                const result = await takeAndUploadPhoto();
                if (result) {
                  onUploadComplete(result);
                } else {
                  onUploadError(new Error('Photo capture cancelled'));
                }
              } catch (error) {
                onUploadError(error as Error);
              }
            },
          },
        ]
      : []),
    {
      text: 'Choose from Gallery',
      onPress: async () => {
        onUploadStart();
        try {
          const result = await pickAndUploadImage();
          if (result) {
            onUploadComplete(result);
          } else {
            onUploadError(new Error('Image selection cancelled'));
          }
        } catch (error) {
          onUploadError(error as Error);
        }
      },
    },
    { text: 'Cancel', style: 'cancel' },
  ]);
}
