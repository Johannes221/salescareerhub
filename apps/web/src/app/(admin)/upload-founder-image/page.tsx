'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function UploadFounderImage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt', 'Johannes Schartl – Gründer von SalesCareerHub');

      const response = await fetch('/api/media/founder-photo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`✅ Image uploaded successfully! File size: ${(result.mediaAsset.fileSize / 1024).toFixed(2)} KB`);
      } else {
        const error = await response.json();
        setMessage(`❌ Upload failed: ${error.error}`);
      }
    } catch (error) {
      setMessage(`❌ Upload failed: ${error}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Upload Founder Image</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Image File (Johannes1.jpg)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-primary-foreground
              hover:file:bg-primary/80
              disabled:opacity-50"
          />
        </div>

        {uploading && (
          <div className="text-blue-600">Uploading...</div>
        )}

        {message && (
          <div className={`p-3 rounded ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded">
          <h2 className="font-semibold mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Select the Johannes1.jpg file from your computer</li>
            <li>Click upload to store it in the MongoDB database</li>
            <li>The image will be available at /api/media/founder-photo</li>
            <li>The About page will automatically use the database image</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
