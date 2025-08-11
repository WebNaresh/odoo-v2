"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, FormProvider, type SubmitHandler } from "react-hook-form";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { ownerVenueKeys } from "@/hooks/use-owner-venues";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Settings,
  Image,
  Star,
  Users,
  Shield,
  Zap,
  Info,
  AlertCircle,
  Save,
  Edit3,
} from "lucide-react";
import { type CreateVenueData, AVAILABLE_AMENITIES } from "@/types/venue";

// Use CreateVenueData for the form since it has the same structure
type VenueFormData = CreateVenueData;

// Fetch venue details for editing
async function fetchVenueDetails(venueId: string) {
  const response = await fetch(`/api/owner/venues/${venueId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch venue details");
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to fetch venue details");
  }
  return data.venue;
}

// Update venue function
async function updateVenue(venueId: string, venueData: VenueFormData) {
  const response = await fetch(`/api/owner/venues/${venueId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(venueData),
  });

  if (!response.ok) {
    throw new Error("Failed to update venue");
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to update venue");
  }

  return data.venue;
}

export default function EditVenuePage() {
  const router = useRouter();
  const params = useParams();
  const venueId = params.id as string;
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Basic Info",
      description: "Name, address & description",
      icon: Building2,
    },
    {
      id: 2,
      title: "Amenities",
      description: "Available facilities",
      icon: Star,
    },
    { id: 3, title: "Sports", description: "Available sports", icon: Trophy },
    { id: 4, title: "Hours", description: "Operating schedule", icon: Clock },
    { id: 5, title: "Photos", description: "Venue images", icon: Camera },
  ];

  // Fetch existing venue data
  const {
    data: venue,
    isLoading: isLoadingVenue,
    error: venueError,
    isError: isVenueError,
  } = useQuery({
    queryKey: ["venue-details", venueId],
    queryFn: () => fetchVenueDetails(venueId),
    enabled: !!venueId,
    retry: 1,
  });

  const form = useForm<VenueFormData>({
    mode: "onChange",
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

  const { handleSubmit, setValue, watch, setError, formState, reset } = form;

  // Pre-populate form when venue data is loaded
  useEffect(() => {
    if (venue) {
      console.log(
        "🔄 [EDIT VENUE] Pre-populating form with venue data:",
        venue
      );

      // Prepare address data for Google Places Autocomplete component
      let addressData;
      if (venue.location && venue.location.coordinates) {
        // If we have location coordinates, create an object format
        addressData = {
          address: venue.address,
          position: {
            lat: venue.location.coordinates[1], // latitude is second in GeoJSON
            lng: venue.location.coordinates[0], // longitude is first in GeoJSON
          },
        };
        console.log(
          "📍 [EDIT VENUE] Pre-populating with location data:",
          addressData
        );
      } else {
        // If no location coordinates, use simple string
        addressData = venue.address || "";
        console.log(
          "🏠 [EDIT VENUE] Pre-populating with address string:",
          addressData
        );
      }

      reset({
        name: venue.name || "",
        description: venue.description || "",
        address: addressData,
        amenities: venue.amenities || [],
        sports: venue.sports || [],
        photoUrls: venue.photoUrls || [],
        operatingHours: venue.operatingHours || {
          monday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
          tuesday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
          wednesday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
          thursday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
          friday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
          saturday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
          sunday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
        },
      });
    }
  }, [venue, reset]);

  const watchedAmenities = watch("amenities");
  const watchedName = watch("name");
  const watchedAddress = watch("address");
  const watchedSports = watch("sports");
  const watchedPhotoUrls = watch("photoUrls");

  // Calculate form completion progress
  const formProgress = useMemo(() => {
    let progress = 0;

    // Step 1: Basic Info (40% weight)
    if (watchedName && watchedAddress) progress += 40;

    // Step 2: Amenities (15% weight)
    if (watchedAmenities && watchedAmenities.length > 0) progress += 15;

    // Step 3: Sports (15% weight)
    if (watchedSports && watchedSports.length > 0) progress += 15;

    // Step 4: Operating Hours (15% weight) - default is already set
    progress += 15;

    // Step 5: Photos (15% weight)
    if (watchedPhotoUrls && watchedPhotoUrls.length > 0) progress += 15;

    return Math.min(progress, 100);
  }, [
    watchedName,
    watchedAddress,
    watchedAmenities?.length,
    watchedSports?.length,
    watchedPhotoUrls?.length,
  ]);

  // Calculate completed steps
  const getCompletedSteps = () => {
    const completed: number[] = [];
    if (watchedName && watchedAddress) completed.push(1);
    if (watchedAmenities && watchedAmenities.length > 0) completed.push(2);
    if (watchedSports && watchedSports.length > 0) completed.push(3);
    completed.push(4); // Operating hours have defaults
    if (watchedPhotoUrls && watchedPhotoUrls.length > 0) completed.push(5);
    return completed;
  };

  const completedSteps = getCompletedSteps();

  // Handle amenity selection
  const handleAmenityChange = useCallback(
    (amenity: string, checked: boolean) => {
      const currentAmenities = watchedAmenities || [];
      if (checked) {
        if (!currentAmenities.includes(amenity)) {
          setValue("amenities", [...currentAmenities, amenity]);
        }
      } else {
        setValue(
          "amenities",
          currentAmenities.filter((a) => a !== amenity)
        );
      }
    },
    [setValue, watchedAmenities]
  );

  // Handle operating hours change
  const handleOperatingHoursChange = useCallback(
    (day: string, field: string, value: string | boolean) => {
      const currentHours = watch("operatingHours");
      setValue("operatingHours", {
        ...currentHours,
        [day]: {
          ...currentHours[day as keyof typeof currentHours],
          [field]: value,
        },
      });
    },
    [setValue, watch]
  );

  // Handle sports selection
  const handleSportsChange = useCallback(
    (sport: string, checked: boolean) => {
      const currentSports = watchedSports || [];
      if (checked) {
        if (!currentSports.includes(sport)) {
          setValue("sports", [...currentSports, sport]);
        }
      } else {
        setValue(
          "sports",
          currentSports.filter((s) => s !== sport)
        );
      }
    },
    [setValue, watchedSports]
  );

  // Handle photo URL changes
  const handlePhotoUrlChange = useCallback(
    (index: number, url: string) => {
      const currentUrls = watchedPhotoUrls || [];
      const newUrls = [...currentUrls];
      newUrls[index] = url;
      setValue("photoUrls", newUrls);
    },
    [setValue, watchedPhotoUrls]
  );

  const addPhotoUrl = useCallback(() => {
    const currentUrls = watchedPhotoUrls || [];
    setValue("photoUrls", [...currentUrls, ""]);
  }, [setValue, watchedPhotoUrls]);

  const removePhotoUrl = useCallback(
    (index: number) => {
      const currentUrls = watchedPhotoUrls || [];
      setValue(
        "photoUrls",
        currentUrls.filter((_, i) => i !== index)
      );
    },
    [setValue, watchedPhotoUrls]
  );

  // Handle form submission
  const onSubmit: SubmitHandler<VenueFormData> = async (data) => {
    try {
      setIsLoading(true);
      console.log("🚀 [EDIT VENUE] Submitting venue update:", data);
      console.log("🔍 [EDIT VENUE] Address data structure:", {
        address: data.address,
        addressType: typeof data.address,
        addressKeys: data.address ? Object.keys(data.address) : "N/A",
      });

      // Client-side validation
      if (!data.name?.trim()) {
        setError("name", {
          type: "required",
          message: "Venue name is required",
        });
        toast.error("Please enter a venue name");
        return;
      }

      // Handle address validation - could be string or object from Google Places
      const addressValue =
        typeof data.address === "string"
          ? data.address.trim()
          : (data.address as any)?.address || // Google Places stores in .address property
            (data.address as any)?.formatted_address ||
            (data.address as any)?.description ||
            "";

      if (!addressValue) {
        setError("address", {
          type: "required",
          message: "Address is required",
        });
        toast.error("Please enter a venue address");
        return;
      }

      if (!data.sports || data.sports.length === 0) {
        toast.error("Please select at least one sport");
        return;
      }

      // Handle address - extract string value and location coordinates from Google Places
      console.log("🏠 [EDIT VENUE] Processing address:", {
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
            "📍 [EDIT VENUE] Extracted location coordinates:",
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
            "📍 [EDIT VENUE] Extracted location from geometry:",
            location
          );
        }
      } else {
        addressString = String(data.address || "");
      }

      console.log("🏠 [EDIT VENUE] Final address string:", addressString);
      console.log("📍 [EDIT VENUE] Final location:", location);

      // Process data for API submission
      const filteredData = {
        ...data,
        // Ensure address is always a string
        address: addressString,
        // Include location coordinates if available
        location: location,
        // Filter out empty photo URLs
        photoUrls: data.photoUrls?.filter((url) => url.trim() !== "") || [],
      };

      const updatedVenue = await updateVenue(venueId, filteredData);

      console.log("✅ [EDIT VENUE] Venue updated successfully:", updatedVenue);

      // Invalidate and refetch venue data
      queryClient.invalidateQueries({ queryKey: ownerVenueKeys.all });
      queryClient.invalidateQueries({ queryKey: ["venue-details", venueId] });

      toast.success("Venue updated successfully!");
      router.push("/owner/venues");
    } catch (error) {
      console.error("❌ [EDIT VENUE] Error updating venue:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update venue"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while fetching venue data
  if (isLoadingVenue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading venue details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isVenueError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">
            {venueError instanceof Error
              ? venueError.message
              : "Failed to load venue details"}
          </p>
          <Button
            onClick={() => router.push("/owner/venues")}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Venues
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/owner/venues")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Venues
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Edit3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Venue</h1>
              <p className="text-gray-600">Update your venue information</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Form Completion
              </span>
              <span className="text-sm text-gray-500">{formProgress}%</span>
            </div>
            <Progress value={formProgress} className="h-2" />
          </div>
        </div>

        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Step Navigation */}
            <div className="flex flex-wrap gap-2 mb-8">
              {steps.map((step) => {
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = currentStep === step.id;
                const Icon = step.icon;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      isCurrent
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : isCompleted
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">{step.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Update your venue&apos;s basic details and location
                    information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <InputField
                        name="name"
                        type="text"
                        label="Venue Name"
                        placeholder="Enter venue name"
                        required={true}
                        Icon={Building2}
                        className={
                          formState.errors.name ? "border-red-500" : ""
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <InputField
                        name="address"
                        type="places_autocomplete"
                        label="Address"
                        placeholder="Enter venue address"
                        required={true}
                        Icon={MapPin}
                        className={
                          formState.errors.address ? "border-red-500" : ""
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <InputField
                      name="description"
                      type="text-area"
                      label="Description"
                      placeholder="Describe your venue, facilities, and what makes it special..."
                      Icon={FileText}
                      description="Help potential customers understand what your venue offers."
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Amenities */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Amenities & Facilities
                  </CardTitle>
                  <CardDescription>
                    Select the amenities and facilities available at your venue.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {AVAILABLE_AMENITIES.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`amenity-${amenity}`}
                          checked={watchedAmenities?.includes(amenity) || false}
                          onCheckedChange={(checked) =>
                            handleAmenityChange(amenity, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`amenity-${amenity}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {watchedAmenities && watchedAmenities.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Selected amenities:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {watchedAmenities.map((amenity) => (
                          <Badge key={amenity} variant="secondary">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Sports */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Available Sports
                  </CardTitle>
                  <CardDescription>
                    Select the sports and activities available at your venue.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                      "Basketball",
                      "Football",
                      "Tennis",
                      "Badminton",
                      "Cricket",
                      "Volleyball",
                      "Table Tennis",
                      "Swimming",
                      "Gym/Fitness",
                      "Squash",
                      "Hockey",
                      "Baseball",
                    ].map((sport) => (
                      <div key={sport} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sport-${sport}`}
                          checked={watchedSports?.includes(sport) || false}
                          onCheckedChange={(checked) =>
                            handleSportsChange(sport, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`sport-${sport}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {sport}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {watchedSports && watchedSports.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Selected sports:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {watchedSports.map((sport) => (
                          <Badge key={sport} variant="secondary">
                            {sport}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {(!watchedSports || watchedSports.length === 0) && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <p className="text-sm text-yellow-800">
                          Please select at least one sport to continue.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 4: Operating Hours */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Operating Hours
                  </CardTitle>
                  <CardDescription>
                    Set your venue&apos;s operating hours for each day of the
                    week.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(watch("operatingHours")).map(
                      ([day, hours]) => (
                        <div
                          key={day}
                          className="flex items-center gap-4 p-4 border rounded-lg"
                        >
                          <div className="w-24">
                            <Label className="capitalize font-medium">
                              {day}
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={hours.isOpen}
                              onCheckedChange={(checked) =>
                                handleOperatingHoursChange(
                                  day,
                                  "isOpen",
                                  checked as boolean
                                )
                              }
                            />
                            <Label className="text-sm">Open</Label>
                          </div>
                          {hours.isOpen && (
                            <>
                              <div className="flex items-center gap-2">
                                <Label className="text-sm">From:</Label>
                                <Input
                                  type="time"
                                  value={hours.openTime || "06:00"}
                                  onChange={(e) =>
                                    handleOperatingHoursChange(
                                      day,
                                      "openTime",
                                      e.target.value
                                    )
                                  }
                                  className="w-32"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Label className="text-sm">To:</Label>
                                <Input
                                  type="time"
                                  value={hours.closeTime || "22:00"}
                                  onChange={(e) =>
                                    handleOperatingHoursChange(
                                      day,
                                      "closeTime",
                                      e.target.value
                                    )
                                  }
                                  className="w-32"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Photos */}
            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Venue Photos
                  </CardTitle>
                  <CardDescription>
                    Add photos to showcase your venue. High-quality images help
                    attract more customers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {watchedPhotoUrls?.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Enter image URL"
                          value={url}
                          onChange={(e) =>
                            handlePhotoUrlChange(index, e.target.value)
                          }
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePhotoUrl(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addPhotoUrl}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Photo URL
                    </Button>
                    {watchedPhotoUrls && watchedPhotoUrls.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">
                          Photo preview:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {watchedPhotoUrls
                            .filter((url) => url.trim() !== "")
                            .map((url, index) => (
                              <div
                                key={index}
                                className="aspect-video bg-gray-100 rounded-lg overflow-hidden"
                              >
                                <img
                                  src={url}
                                  alt={`Venue photo ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "/placeholder-image.jpg";
                                  }}
                                />
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {currentStep < steps.length ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading || formProgress < 70}
                    className="min-w-32"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Venue
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
