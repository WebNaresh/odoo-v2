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
  FileText,
  Trophy,
} from "lucide-react";
import { type CreateVenueData, AVAILABLE_AMENITIES } from "@/types/venue";

// Use CreateVenueData directly since no additional fields are needed
type VenueFormData = CreateVenueData;

// Client-side validation is now handled manually in the onSubmit function

export default function NewVenuePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<VenueFormData>({
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      name: "",
      description: "",
      address: "",
      amenities: [],
      sports: [],
      photoUrls: [],
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

  const { register, handleSubmit, setValue, watch, setError, clearErrors } =
    form;

  const watchedAmenities = watch("amenities");

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
    console.log("🖼️ [VENUE FORM] Photo URLs from Cloudinary:", {
      photoUrlsLength: data.photoUrls?.length || 0,
      photoUrls: data.photoUrls,
    });

    // Manual client-side validation
    console.log("🔍 [VENUE FORM] Starting client-side validation");
    let hasErrors = false;

    // Clear previous errors
    clearErrors();

    // Validate name
    if (!data.name || data.name.trim().length < 2) {
      setError("name", {
        type: "manual",
        message: "Venue name must be at least 2 characters",
      });
      hasErrors = true;
    } else if (data.name.length > 100) {
      setError("name", {
        type: "manual",
        message: "Venue name must be less than 100 characters",
      });
      hasErrors = true;
    }

    // Validate address
    if (!data.address) {
      setError("address", {
        type: "manual",
        message: "Address is required",
      });
      hasErrors = true;
    } else {
      // Check if address is a string or object and extract the address string
      let addressString = "";
      if (typeof data.address === "string") {
        addressString = data.address;
      } else if (data.address && typeof data.address === "object") {
        const addressObj = data.address as any;
        addressString =
          addressObj.address ||
          addressObj.formatted_address ||
          addressObj.description ||
          addressObj.name ||
          "";
      }

      if (!addressString || addressString.length < 10) {
        setError("address", {
          type: "manual",
          message: "Address must be at least 10 characters",
        });
        hasErrors = true;
      }
    }

    // Validate description (optional but if provided, check length)
    if (data.description && data.description.length > 500) {
      setError("description", {
        type: "manual",
        message: "Description must be less than 500 characters",
      });
      hasErrors = true;
    }

    if (hasErrors) {
      console.log("❌ [VENUE FORM] Client-side validation failed");
      setIsLoading(false);
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    console.log("✅ [VENUE FORM] Client-side validation passed");
    setIsLoading(true);

    try {
      // Get photo URLs from Cloudinary upload component
      const photoUrls = data.photoUrls || [];
      console.log("📸 [VENUE FORM] Using Cloudinary photo URLs:", photoUrls);
      console.log("✅ [VENUE FORM] Final photo URLs count:", photoUrls.length);

      // Handle address - extract string value and location coordinates from Google Places
      console.log("🏠 [VENUE FORM] Processing address:", {
        addressType: typeof data.address,
        addressValue: data.address,
      });

      let addressString: string;
      let location:
        | { type: "Point"; coordinates: [number, number] }
        | undefined;

      if (typeof data.address === "string") {
        addressString = data.address;
        // No location coordinates available for plain string
      } else if (data.address && typeof data.address === "object") {
        const addressObj = data.address as any;

        // Extract address string
        addressString =
          addressObj.address ||
          addressObj.formatted_address ||
          addressObj.description ||
          addressObj.name ||
          String(data.address);

        // Extract location coordinates if available
        if (
          addressObj.position &&
          addressObj.position.lat &&
          addressObj.position.lng
        ) {
          location = {
            type: "Point",
            coordinates: [addressObj.position.lng, addressObj.position.lat], // [longitude, latitude] for GeoJSON
          };
          console.log(
            "📍 [VENUE FORM] Extracted location coordinates:",
            location
          );
        } else if (addressObj.geometry && addressObj.geometry.location) {
          // Alternative structure from Google Places
          const lat = addressObj.geometry.location.lat();
          const lng = addressObj.geometry.location.lng();
          location = {
            type: "Point",
            coordinates: [lng, lat],
          };
          console.log(
            "📍 [VENUE FORM] Extracted location from geometry:",
            location
          );
        }
      } else {
        addressString = String(data.address || "");
      }

      console.log("🏠 [VENUE FORM] Final address string:", addressString);
      console.log("📍 [VENUE FORM] Final location:", location);

      // Prepare venue data
      const venueData: CreateVenueData = {
        name: data.name,
        description: data.description || undefined,
        address: addressString,
        location: location, // Include location coordinates if available
        amenities: data.amenities,
        sports: Array.isArray(data.sports)
          ? data.sports.map((sport: any) =>
              typeof sport === "string" ? sport : sport.value || sport.label
            )
          : [], // Sports selected by user
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
        hasSports: Array.isArray(venueData.sports),
        sportsCount: venueData.sports?.length || 0,
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

            {/* Sports */}
            <Card>
              <CardHeader>
                <CardTitle>Sports</CardTitle>
                <CardDescription>
                  Select the sports available at your venue. You can choose from
                  existing sports or add new ones.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InputField
                  name="sports"
                  label="Sports"
                  type="multiSelect"
                  placeholder="Select or add sports (e.g., Football, Basketball, Tennis)"
                  Icon={Trophy}
                  options={[
                    { value: "Football", label: "Football" },
                    { value: "Basketball", label: "Basketball" },
                    { value: "Tennis", label: "Tennis" },
                    { value: "Cricket", label: "Cricket" },
                    { value: "Badminton", label: "Badminton" },
                    { value: "Volleyball", label: "Volleyball" },
                    { value: "Table Tennis", label: "Table Tennis" },
                    { value: "Swimming", label: "Swimming" },
                    { value: "Gym", label: "Gym" },
                    { value: "Yoga", label: "Yoga" },
                  ]}
                  className="max-w-none"
                  description="Select existing sports or type to create new ones"
                />
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
                  Upload photos of your venue using Cloudinary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InputField
                  type="cloudinary-image"
                  name="photoUrls"
                  label="Venue Photos"
                  placeholder="Upload venue photos"
                  Icon={Camera}
                  multiple={true}
                  maxFiles={10}
                  uploadPreset="ml_default"
                  folder="venue-photos"
                  maxFileSize={15728640} // 15MB
                  allowedFormats={["jpg", "jpeg", "png", "webp"]}
                />
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
