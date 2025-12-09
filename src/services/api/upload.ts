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
    const axios = (await import('axios')).default;
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
      transformRequest: [(data) => data],
      // Don't send any extra headers that weren't part of the signature
      withCredentials: false,
    });
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
    // Get presigned URL
    const { uploadUrl, fileUrl } = await this.getPresignedUrl(file.name, file.type, folder);

    // Upload to S3
    await this.uploadToS3(uploadUrl, file);

    // Return the file URL from the response
    return fileUrl;
  }
};
