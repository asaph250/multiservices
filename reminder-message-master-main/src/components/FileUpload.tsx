import React, { useState } from 'react';
import { Upload, X, File, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FileUploadProps {
  onFilesChange: (files: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesChange,
  maxFiles = 5,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
  maxFileSize = 10,
  className = ''
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; uploading?: boolean }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `${file.name} exceeds ${maxFileSize}MB limit`,
        variant: "destructive"
      });
      return false;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: `${file.name} is not an accepted file type`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File) => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

    try {
      const { data, error } = await supabase.storage
        .from('service-documents')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('service-documents')
        .getPublicUrl(fileName);

      return { name: file.name, url: publicUrl, path: fileName };
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}`,
        variant: "destructive"
      });
      return null;
    }
  };

  const handleFiles = async (files: FileList) => {
    if (uploadedFiles.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      });
      return;
    }

    const validFiles = Array.from(files).filter(validateFile);
    if (validFiles.length === 0) return;

    // Add files to state with uploading status
    const newFiles = validFiles.map(file => ({ name: file.name, url: '', uploading: true }));
    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Upload files
    const uploadPromises = validFiles.map(uploadFile);
    const results = await Promise.all(uploadPromises);

    // Update state with upload results
    setUploadedFiles(prev => {
      const updated = [...prev];
      results.forEach((result, index) => {
        const uploadingIndex = updated.findIndex(f => f.name === validFiles[index].name && f.uploading);
        if (uploadingIndex !== -1 && result) {
          updated[uploadingIndex] = result;
        } else if (uploadingIndex !== -1) {
          updated.splice(uploadingIndex, 1);
        }
      });
      return updated;
    });

    // Update parent component
    const successfulUploads = results.filter(r => r !== null) as { name: string; url: string; path: string }[];
    const allUrls = [...uploadedFiles.filter(f => !f.uploading).map(f => f.url), ...successfulUploads.map(f => f.url)];
    onFilesChange(allUrls);
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onFilesChange(newFiles.map(f => f.url));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-foreground mb-2">
          Drop files here or click to upload
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Accepted formats: {acceptedTypes.join(', ')} (max {maxFileSize}MB each)
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          Choose Files
        </Button>
        <input
          id="file-upload"
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Uploaded Files ({uploadedFiles.length}/{maxFiles})
          </p>
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <File className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{file.name}</span>
                {file.uploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Uploading...</span>
                  </div>
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              {!file.uploading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-start space-x-2 text-xs text-muted-foreground">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div>
          <p>• Maximum {maxFiles} files allowed</p>
          <p>• Each file must be under {maxFileSize}MB</p>
          <p>• Supported formats: {acceptedTypes.join(', ')}</p>
        </div>
      </div>
    </div>
  );
};