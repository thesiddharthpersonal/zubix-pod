import apiClient from "./config";

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

export interface UploadConfirmation {
  fileUrl: string;
}

export const uploadApi = {
  /**
   * Get a presigned URL for uploading a file to S3
   */
  async getPresignedUrl(fileName: string, fileType: string, folder?: string): Promise<PresignedUrlResponse> {
    const response = await apiClient.post<PresignedUrlResponse>('/api/upload/presigned-url', {
      fileName,
      fileType,
      folder
    });
    return response.data;
  },

  /**
   * Upload a file directly to S3 using the presigned URL
   */
  async uploadToS3(presignedUrl: string, file: File): Promise<void> {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}: ${response.statusText}`);
    }
  },

  /**
   * Confirm upload (optional - for tracking purposes)
   */
  async confirmUpload(key: string): Promise<UploadConfirmation> {
    const response = await apiClient.post<UploadConfirmation>('/upload/confirm-upload', {
      key
    });
    return response.data;
  },

  /**
   * Complete upload flow: get presigned URL, upload to S3, and return the file URL
   */
  async uploadFile(file: File, folder?: string): Promise<string> {
    // Use direct upload through backend instead of presigned URL
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await apiClient.post<{ fileUrl: string; key: string }>('/api/direct-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.fileUrl;
  }
};
