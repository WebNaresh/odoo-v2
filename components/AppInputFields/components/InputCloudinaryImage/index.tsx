"use client";

import React, { useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { CldUploadWidget } from "next-cloudinary";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Image from "next/image";

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  original_filename: string;
}

interface InputCloudinaryImageProps {
  label?: string;
  name: string;
  placeholder?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  maxFiles?: number;
  uploadPreset?: string;
  folder?: string;
  allowedFormats?: string[];
  maxFileSize?: number; // in bytes
}

const InputCloudinaryImage: React.FC<InputCloudinaryImageProps> = ({
  label,
  name,
  placeholder = "Click to upload images",
  description,
  className,
  disabled = false,
  required = false,
  multiple = false,
  maxFiles = 5,
  uploadPreset = "ml_default",
  folder = "venue-images",
  allowedFormats = ["jpg", "jpeg", "png", "webp"],
  maxFileSize = 10485760, // 10MB default
}) => {
  const form = useFormContext();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadSuccess = useCallback(
    (result: CloudinaryUploadResult) => {
      const currentValue = form.getValues(name);
      
      if (multiple) {
        const currentUrls = Array.isArray(currentValue) ? currentValue : [];
        const newUrls = [...currentUrls, result.secure_url];
        form.setValue(name, newUrls, { shouldValidate: true });
      } else {
        form.setValue(name, result.secure_url, { shouldValidate: true });
      }
      
      setIsUploading(false);
      setUploadProgress(0);
      setUploadError(null);
    },
    [form, name, multiple]
  );

  const handleUploadError = useCallback((error: any) => {
    console.error("Upload error:", error);
    setUploadError("Failed to upload image. Please try again.");
    setIsUploading(false);
    setUploadProgress(0);
  }, []);

  const removeImage = useCallback(
    (urlToRemove: string) => {
      const currentValue = form.getValues(name);
      
      if (multiple && Array.isArray(currentValue)) {
        const filteredUrls = currentValue.filter(url => url !== urlToRemove);
        form.setValue(name, filteredUrls, { shouldValidate: true });
      } else {
        form.setValue(name, "", { shouldValidate: true });
      }
    },
    [form, name, multiple]
  );

  const renderImagePreview = (url: string, index?: number) => (
    <div key={url} className="relative group">
      <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-border">
        <Image
          src={url}
          alt={`Upload ${index !== undefined ? index + 1 : ""}`}
          fill
          className="object-cover"
          sizes="80px"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => removeImage(url)}
          disabled={disabled}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  return (
    <FormField
      control={form.control}
      name={name}
      disabled={disabled}
      render={({ field }) => {
        const currentValue = field.value;
        const hasImages = multiple 
          ? Array.isArray(currentValue) && currentValue.length > 0
          : Boolean(currentValue);
        const imageCount = multiple && Array.isArray(currentValue) 
          ? currentValue.length 
          : hasImages ? 1 : 0;
        const canUploadMore = multiple 
          ? imageCount < maxFiles 
          : !hasImages;

        return (
          <FormItem className={cn("w-full", className)}>
            <FormLabel
              className={cn(
                "text-sm font-medium",
                required && "after:content-['*'] after:ml-0.5 after:text-red-500"
              )}
            >
              {label}
            </FormLabel>
            
            <FormControl>
              <div className="space-y-4">
                {/* Upload Button */}
                {canUploadMore && (
                  <CldUploadWidget
                    uploadPreset={uploadPreset}
                    options={{
                      multiple: multiple,
                      maxFiles: multiple ? maxFiles - imageCount : 1,
                      folder: folder,
                      resourceType: "image",
                      clientAllowedFormats: allowedFormats,
                      maxFileSize: maxFileSize,
                      sources: ["local", "url", "camera"],
                      showAdvancedOptions: false,
                      cropping: false,
                      showSkipCropButton: true,
                      croppingAspectRatio: 16 / 9,
                    }}
                    onSuccess={(result) => {
                      if (typeof result.info === 'object' && result.info !== null) {
                        handleUploadSuccess(result.info as CloudinaryUploadResult);
                      }
                    }}
                    onError={handleUploadError}
                    onOpen={() => {
                      setIsUploading(true);
                      setUploadError(null);
                    }}
                    onClose={() => {
                      setIsUploading(false);
                      setUploadProgress(0);
                    }}
                  >
                    {({ open }) => (
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full h-32 border-2 border-dashed",
                          "hover:border-primary hover:bg-primary/5",
                          "transition-colors duration-200",
                          "flex flex-col items-center justify-center gap-2",
                          disabled && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => open()}
                        disabled={disabled || isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground">
                              Uploading... {uploadProgress > 0 && `${uploadProgress}%`}
                            </span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <span className="text-sm font-medium">{placeholder}</span>
                            <span className="text-xs text-muted-foreground">
                              {multiple 
                                ? `Upload up to ${maxFiles - imageCount} more images`
                                : "Click to select an image"
                              }
                            </span>
                          </>
                        )}
                      </Button>
                    )}
                  </CldUploadWidget>
                )}

                {/* Upload Error */}
                {uploadError && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">{uploadError}</span>
                  </div>
                )}

                {/* Image Previews */}
                {hasImages && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {multiple ? `${imageCount} image${imageCount !== 1 ? 's' : ''}` : 'Uploaded image'}
                      </span>
                      {multiple && (
                        <Badge variant="secondary" className="text-xs">
                          {imageCount}/{maxFiles}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {multiple && Array.isArray(currentValue) 
                        ? currentValue.map((url, index) => renderImagePreview(url, index))
                        : currentValue && renderImagePreview(currentValue)
                      }
                    </div>
                  </div>
                )}

                {/* Upload Info */}
                {!hasImages && !isUploading && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Supported formats: {allowedFormats.join(", ").toUpperCase()}</p>
                    <p>Maximum file size: {(maxFileSize / 1024 / 1024).toFixed(1)}MB</p>
                    {multiple && <p>Maximum files: {maxFiles}</p>}
                  </div>
                )}
              </div>
            </FormControl>

            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            
            <FormMessage className="text-xs font-medium text-destructive mt-1 animate-in fade-in-50" />
          </FormItem>
        );
      }}
    />
  );
};

export default InputCloudinaryImage;
