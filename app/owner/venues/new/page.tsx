"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, type SubmitHandler } from "react-hook-form";

import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import InputField from "@/components/AppInputFields/InputField";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  Camera,
  Plus,
  Loader2,
  CheckCircle,
  X,
  User,
  FileText,
} from "lucide-react";
import { type CreateVenueData, AVAILABLE_AMENITIES } from "@/types/venue";

interface VenueFormData
  extends Omit<CreateVenueData, "photoUrls" | "sportIds"> {
  photos: FileList | null;
}

export default function NewVenuePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const form = useForm<VenueFormData>({
    defaultValues: {
      name: "",
      description: "",
      address: "",
      amenities: [],
      photos: null,
      operatingHours: {
        monday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
        tuesday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
        wednesday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
        thursday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
        friday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
        saturday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
        sunday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
      },
    },
  });

  const { register, handleSubmit, setValue, watch } = form;

  const watchedAmenities = watch("amenities");

  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalFiles = photoFiles.length + newFiles.length;

    if (totalFiles > 10) {
      toast.error("Maximum 10 photos allowed");
      return;
    }

    // Validate file types and sizes
    const validFiles = newFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setPhotoFiles((prev) => [...prev, ...validFiles]);

      // Create previews
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPhotoPreviews((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Remove photo
  const removePhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle amenity selection
  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const currentAmenities = watchedAmenities || [];
    if (checked) {
      setValue("amenities", [...currentAmenities, amenity]);
    } else {
      setValue(
        "amenities",
        currentAmenities.filter((a) => a !== amenity)
      );
    }
  };

  // Handle operating hours change
  const handleOperatingHoursChange = (
    day: keyof CreateVenueData["operatingHours"],
    field: "isOpen" | "openTime" | "closeTime",
    value: boolean | string
  ) => {
    setValue(`operatingHours.${day}.${field}`, value);
  };

  const onSubmit: SubmitHandler<VenueFormData> = async (data) => {
    console.log("🚀 [VENUE FORM] Starting form submission");
    console.log(
      "📝 [VENUE FORM] Raw form data:",
      JSON.stringify(data, null, 2)
    );
    console.log("🖼️ [VENUE FORM] Photo files state:", {
      photoFilesLength: photoFiles.length,
      photoFiles: photoFiles.map((file, i) => ({
        index: i,
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    });

    setIsLoading(true);

    try {
      // Upload photos first (in a real app, you'd upload to a cloud service)
      const photoUrls: string[] = [];

      console.log("📸 [VENUE FORM] Processing photos...");
      // For now, we'll create placeholder URLs
      // In production, you'd upload to AWS S3, Cloudinary, etc.
      for (let i = 0; i < photoFiles.length; i++) {
        const photoUrl = `/api/placeholder/800/600?venue=${Date.now()}&photo=${i}`;
        photoUrls.push(photoUrl);
        console.log(`📷 [VENUE FORM] Added photo ${i + 1}:`, photoUrl);
      }

      console.log("✅ [VENUE FORM] Final photo URLs:", photoUrls);

      // Handle address - extract string value if it's an object from Google Places
      console.log("🏠 [VENUE FORM] Processing address:", {
        addressType: typeof data.address,
        addressValue: data.address,
      });

      let addressString: string;
      if (typeof data.address === "string") {
        addressString = data.address;
      } else if (data.address && typeof data.address === "object") {
        // If it's an object from Google Places, try to extract the formatted address
        addressString =
          (data.address as any).formatted_address ||
          (data.address as any).description ||
          (data.address as any).name ||
          String(data.address);
      } else {
        addressString = String(data.address || "");
      }

      console.log("🏠 [VENUE FORM] Final address string:", addressString);

      // Prepare venue data
      const venueData: CreateVenueData = {
        name: data.name,
        description: data.description || undefined,
        address: addressString,
        amenities: data.amenities,
        sportIds: [], // Will be set up later when configuring courts
        operatingHours: data.operatingHours,
        photoUrls,
      };

      console.log(
        "📦 [VENUE FORM] Prepared venue data for API:",
        JSON.stringify(venueData, null, 2)
      );
      console.log("🔍 [VENUE FORM] Venue data validation:", {
        hasName: !!venueData.name,
        nameLength: venueData.name?.length || 0,
        hasAddress: !!venueData.address,
        addressLength: venueData.address?.length || 0,
        hasAmenities: Array.isArray(venueData.amenities),
        amenitiesCount: venueData.amenities?.length || 0,
        hasSportIds: Array.isArray(venueData.sportIds),
        sportIdsCount: venueData.sportIds?.length || 0,
        hasOperatingHours: !!venueData.operatingHours,
        operatingHoursDays: venueData.operatingHours
          ? Object.keys(venueData.operatingHours)
          : [],
        hasPhotoUrls: Array.isArray(venueData.photoUrls),
        photoUrlsCount: venueData.photoUrls?.length || 0,
      });

      console.log("🌐 [VENUE FORM] Making API request to /api/owner/venues");
      const response = await fetch("/api/owner/venues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(venueData),
      });

      console.log("📡 [VENUE FORM] API response status:", response.status);
      console.log("📡 [VENUE FORM] API response ok:", response.ok);

      const result = await response.json();
      console.log(
        "📋 [VENUE FORM] API response body:",
        JSON.stringify(result, null, 2)
      );

      if (result.success) {
        console.log("✅ [VENUE FORM] Venue created successfully!");
        toast.success("Venue created successfully!");
        router.push("/owner/venues");
      } else {
        console.log("❌ [VENUE FORM] API returned error:", result.error);
        console.log("🔍 [VENUE FORM] Error details:", result.details);
        console.log("📝 [VENUE FORM] Validation info:", {
          receivedFields: result.receivedFields,
          expectedFields: result.expectedFields,
        });
        toast.error(result.error || "Failed to create venue");
      }
    } catch (error) {
      console.error("💥 [VENUE FORM] Error creating venue:", error);
      console.error("🔍 [VENUE FORM] Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
      console.log("🏁 [VENUE FORM] Form submission completed");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              Add New Venue
            </h1>
            <p className="text-muted-foreground">
              Create a new sports venue to start accepting bookings
            </p>
          </div>
        </div>

        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Provide the essential details about your sports venue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    name="name"
                    label="Venue Name"
                    type="text"
                    placeholder="e.g., Elite Sports Complex"
                    Icon={Building2}
                    required
                    className="max-w-none"
                  />

                  <InputField
                    name="address"
                    label="Address"
                    type="places_autocomplete"
                    placeholder="Full address including city and state"
                    Icon={MapPin}
                    required
                    className="max-w-none"
                  />
                </div>

                <InputField
                  name="description"
                  label="Description"
                  type="text-area"
                  placeholder="Describe your venue, its features, and what makes it special..."
                  Icon={FileText}
                  className="max-w-none"
                />
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
                <CardDescription>
                  Select the amenities available at your venue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {AVAILABLE_AMENITIES.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={watchedAmenities?.includes(amenity) || false}
                        onCheckedChange={(checked) =>
                          handleAmenityChange(amenity, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`amenity-${amenity}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
                <CardDescription>
                  Set the operating hours for each day of the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries({
                    monday: "Monday",
                    tuesday: "Tuesday",
                    wednesday: "Wednesday",
                    thursday: "Thursday",
                    friday: "Friday",
                    saturday: "Saturday",
                    sunday: "Sunday",
                  }).map(([day, label]) => (
                    <div
                      key={day}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="w-24">
                        <Label className="font-medium">{label}</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${day}-open`}
                          checked={watch(
                            `operatingHours.${
                              day as keyof CreateVenueData["operatingHours"]
                            }.isOpen`
                          )}
                          onCheckedChange={(checked) =>
                            handleOperatingHoursChange(
                              day as keyof CreateVenueData["operatingHours"],
                              "isOpen",
                              checked as boolean
                            )
                          }
                        />
                        <Label htmlFor={`${day}-open`} className="text-sm">
                          Open
                        </Label>
                      </div>

                      {watch(
                        `operatingHours.${
                          day as keyof CreateVenueData["operatingHours"]
                        }.isOpen`
                      ) && (
                        <>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">From:</Label>
                            <Input
                              type="time"
                              className="w-32"
                              {...register(
                                `operatingHours.${
                                  day as keyof CreateVenueData["operatingHours"]
                                }.openTime`
                              )}
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <Label className="text-sm">To:</Label>
                            <Input
                              type="time"
                              className="w-32"
                              {...register(
                                `operatingHours.${
                                  day as keyof CreateVenueData["operatingHours"]
                                }.closeTime`
                              )}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Photo Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
                <CardDescription>
                  Upload photos of your venue (maximum 10 photos, 5MB each)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("photo-upload")?.click()
                      }
                      className="flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Add Photos
                    </Button>
                    <input
                      id="photo-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <span className="text-sm text-muted-foreground">
                      {photoFiles.length}/10 photos uploaded
                    </span>
                  </div>

                  {photoPreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {photoPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removePhoto(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Venue...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Create Venue
                  </>
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
