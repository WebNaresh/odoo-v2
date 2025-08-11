"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import {
  createVenueSchema,
  type CreateVenueData,
  type Sport,
  AVAILABLE_AMENITIES,
} from "@/types/venue";

interface VenueFormData extends Omit<CreateVenueData, "photoUrls"> {
  photos: FileList | null;
  latitude?: number;
  longitude?: number;
}

export default function NewVenuePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<VenueFormData>({
    resolver: zodResolver(createVenueSchema.omit({ photoUrls: true })),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      amenities: [],
      sportIds: [],
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

  const watchedAmenities = watch("amenities");
  const watchedSportIds = watch("sportIds");

  // Fetch available sports
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch("/api/sports");
        const data = await response.json();

        if (data.success) {
          setSports(data.sports);
        } else {
          toast.error("Failed to load sports");
        }
      } catch (error) {
        console.error("Error fetching sports:", error);
        toast.error("Failed to load sports");
      } finally {
        setLoadingSports(false);
      }
    };

    fetchSports();
  }, []);

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

  // Handle sport selection
  const handleSportChange = (sportId: string, checked: boolean) => {
    const currentSports = watchedSportIds || [];
    if (checked) {
      setValue("sportIds", [...currentSports, sportId]);
    } else {
      setValue(
        "sportIds",
        currentSports.filter((id) => id !== sportId)
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

  const onSubmit = async (data: VenueFormData) => {
    setIsLoading(true);

    try {
      // Upload photos first (in a real app, you'd upload to a cloud service)
      const photoUrls: string[] = [];

      // For now, we'll create placeholder URLs
      // In production, you'd upload to AWS S3, Cloudinary, etc.
      for (let i = 0; i < photoFiles.length; i++) {
        photoUrls.push(
          `/api/placeholder/800/600?venue=${Date.now()}&photo=${i}`
        );
      }

      // Prepare venue data
      const venueData: CreateVenueData = {
        name: data.name,
        description: data.description || undefined,
        address: data.address,
        location:
          data.latitude && data.longitude
            ? {
                type: "Point",
                coordinates: [data.longitude, data.latitude],
              }
            : undefined,
        amenities: data.amenities,
        sportIds: data.sportIds,
        operatingHours: data.operatingHours,
        photoUrls,
      };

      const response = await fetch("/api/owner/venues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(venueData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Venue created successfully!");
        router.push("/owner/facilities");
      } else {
        toast.error(result.error || "Failed to create venue");
      }
    } catch (error) {
      console.error("Error creating venue:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
              Add New Facility
            </h1>
            <p className="text-muted-foreground">
              Create a new sports facility to start accepting bookings
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide the essential details about your sports facility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Facility Name *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="e.g., Elite Sports Complex"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    {...register("address")}
                    placeholder="Full address including city and state"
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe your facility, its features, and what makes it special..."
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude (Optional)</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    {...register("latitude", { valueAsNumber: true })}
                    placeholder="e.g., 19.0760"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude (Optional)</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    {...register("longitude", { valueAsNumber: true })}
                    placeholder="e.g., 72.8777"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sports Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Sports Offered</CardTitle>
              <CardDescription>
                Select the sports that will be available at your facility
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSports ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading sports...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sports.map((sport) => (
                    <div key={sport.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sport-${sport.id}`}
                        checked={watchedSportIds?.includes(sport.id) || false}
                        onCheckedChange={(checked) =>
                          handleSportChange(sport.id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`sport-${sport.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {sport.name}
                        {sport.isPopular && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            Popular
                          </Badge>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              {errors.sportIds && (
                <p className="text-sm text-red-500 mt-2">
                  {errors.sportIds.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
              <CardDescription>
                Select the amenities available at your facility
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
                Upload photos of your facility (maximum 10 photos, 5MB each)
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
                  Creating Facility...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Create Facility
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
