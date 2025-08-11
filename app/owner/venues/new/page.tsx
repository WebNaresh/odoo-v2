"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, type SubmitHandler } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { ownerVenueKeys } from "@/hooks/use-owner-venues";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import { type CreateVenueData, AVAILABLE_AMENITIES } from "@/types/venue";

// Use CreateVenueData directly since no additional fields are needed
type VenueFormData = CreateVenueData;

// Client-side validation is now handled manually in the onSubmit function

export default function NewVenuePage() {
  const router = useRouter();
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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState,
  } = form;

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
    watchedAmenities,
    watchedSports,
    watchedPhotoUrls,
  ]);

  // Calculate completed steps without state
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

  // Handle amenity selection with stable reference
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

        // Invalidate owner venues query to refresh the list
        queryClient.invalidateQueries({ queryKey: ownerVenueKeys.lists() });

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
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Venues
            </Button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#00884d] to-[#00a855] rounded-2xl flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Add New Venue
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Create a new sports venue to start accepting bookings
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Shield className="h-4 w-4 text-[#00884d]" />
                    <span className="text-sm text-gray-500">
                      Your venue will be reviewed before going live
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:text-right">
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progress
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[#00884d] border-[#00884d]/20"
                    >
                      {formProgress}%
                    </Badge>
                  </div>
                  <Progress value={formProgress} className="w-48 h-2" />
                </div>
                <p className="text-xs text-gray-500">
                  {completedSteps.length} of {steps.length} sections completed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {steps.map((step) => {
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = currentStep === step.id;
                const StepIcon = step.icon;

                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isCurrent
                        ? "bg-[#00884d] text-white shadow-md"
                        : isCompleted
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCurrent
                          ? "bg-white/20"
                          : isCompleted
                          ? "bg-green-100"
                          : "bg-gray-200"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <StepIcon
                          className={`h-4 w-4 ${
                            isCurrent ? "text-white" : "text-gray-500"
                          }`}
                        />
                      )}
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="font-medium text-sm">{step.title}</div>
                      <div
                        className={`text-xs ${
                          isCurrent ? "text-white/80" : "text-gray-500"
                        }`}
                      >
                        {step.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#00884d]/5 to-[#00a855]/5 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#00884d] rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Basic Information</CardTitle>
                    <CardDescription className="text-base">
                      Provide the essential details about your sports venue
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <InputField
                      name="name"
                      label="Venue Name"
                      type="text"
                      placeholder="e.g., Elite Sports Complex"
                      Icon={Building2}
                      required
                      className="max-w-none"
                    />
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Choose a memorable name that represents your venue
                    </p>
                  </div>

                  <div className="space-y-2">
                    <InputField
                      name="address"
                      label="Address"
                      type="places_autocomplete"
                      placeholder="Full address including city and state"
                      Icon={MapPin}
                      required
                      className="max-w-none"
                    />
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Use the autocomplete to ensure accurate location
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <InputField
                    name="description"
                    label="Description"
                    type="text-area"
                    placeholder="Describe your venue, its features, and what makes it special..."
                    Icon={FileText}
                    className="max-w-none"
                  />
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Help customers understand what makes your venue unique
                    (optional)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Amenities</CardTitle>
                    <CardDescription className="text-base">
                      Select the amenities available at your venue
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {AVAILABLE_AMENITIES.map((amenity) => {
                    const isSelected =
                      watchedAmenities?.includes(amenity) || false;
                    return (
                      <div
                        key={amenity}
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:bg-gray-50 ${
                          isSelected
                            ? "border-[#00884d] bg-[#00884d]/5"
                            : "border-gray-200"
                        }`}
                        onClick={() =>
                          handleAmenityChange(amenity, !isSelected)
                        }
                      >
                        <input
                          type="checkbox"
                          id={`amenity-${amenity}`}
                          checked={isSelected}
                          onChange={(e) =>
                            handleAmenityChange(amenity, e.target.checked)
                          }
                          className="w-4 h-4 text-[#00884d] bg-gray-100 border-gray-300 rounded focus:ring-[#00884d] focus:ring-2"
                        />
                        <label
                          htmlFor={`amenity-${amenity}`}
                          className="text-sm font-medium leading-none cursor-pointer flex-1"
                        >
                          {amenity}
                        </label>
                      </div>
                    );
                  })}
                </div>

                {watchedAmenities && watchedAmenities.length > 0 && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Selected Amenities ({watchedAmenities.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {watchedAmenities.map((amenity) => (
                        <Badge
                          key={amenity}
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sports */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Sports</CardTitle>
                    <CardDescription className="text-base">
                      Select the sports available at your venue. You can choose
                      from existing sports or add new ones.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <InputField
                    name="sports"
                    label="Available Sports"
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
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    You can add multiple sports and create custom ones by typing
                  </p>
                </div>

                {watchedSports && watchedSports.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">
                        Selected Sports ({watchedSports.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {watchedSports.map((sport: any, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-purple-100 text-purple-800"
                        >
                          {typeof sport === "string"
                            ? sport
                            : sport.label || sport.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Operating Hours</CardTitle>
                    <CardDescription className="text-base">
                      Set the operating hours for each day of the week
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {Object.entries({
                    monday: "Monday",
                    tuesday: "Tuesday",
                    wednesday: "Wednesday",
                    thursday: "Thursday",
                    friday: "Friday",
                    saturday: "Saturday",
                    sunday: "Sunday",
                  }).map(([day, label]) => {
                    const isOpen = watch(
                      `operatingHours.${
                        day as keyof CreateVenueData["operatingHours"]
                      }.isOpen`
                    );

                    return (
                      <div
                        key={day}
                        className={`flex flex-col lg:flex-row lg:items-center gap-4 p-4 border-2 rounded-xl transition-all duration-200 ${
                          isOpen
                            ? "border-[#00884d]/20 bg-[#00884d]/5"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="w-full lg:w-32">
                          <Label className="font-semibold text-gray-900">
                            {label}
                          </Label>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`${day}-open`}
                            checked={isOpen}
                            onCheckedChange={(checked) =>
                              handleOperatingHoursChange(
                                day as keyof CreateVenueData["operatingHours"],
                                "isOpen",
                                checked as boolean
                              )
                            }
                            className="data-[state=checked]:bg-[#00884d] data-[state=checked]:border-[#00884d]"
                          />
                          <Label
                            htmlFor={`${day}-open`}
                            className="text-sm font-medium"
                          >
                            Open
                          </Label>
                        </div>

                        {isOpen && (
                          <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm font-medium text-gray-700 w-12">
                                From:
                              </Label>
                              <Input
                                type="time"
                                className="w-32 border-[#00884d]/20 focus:border-[#00884d]"
                                {...register(
                                  `operatingHours.${
                                    day as keyof CreateVenueData["operatingHours"]
                                  }.openTime`
                                )}
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <Label className="text-sm font-medium text-gray-700 w-12">
                                To:
                              </Label>
                              <Input
                                type="time"
                                className="w-32 border-[#00884d]/20 focus:border-[#00884d]"
                                {...register(
                                  `operatingHours.${
                                    day as keyof CreateVenueData["operatingHours"]
                                  }.closeTime`
                                )}
                              />
                            </div>
                          </div>
                        )}

                        {!isOpen && (
                          <div className="flex-1 text-sm text-gray-500 italic">
                            Closed
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Operating Hours Tips:</p>
                      <ul className="text-xs space-y-1 text-blue-700">
                        <li>
                          • Set realistic hours that you can maintain
                          consistently
                        </li>
                        <li>
                          • Consider peak hours when customers are most likely
                          to book
                        </li>
                        <li>• You can always update these hours later</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photo Upload */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Photos</CardTitle>
                    <CardDescription className="text-base">
                      Upload high-quality photos to showcase your venue
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
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
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Upload up to 10 high-quality photos (JPG, PNG, WebP - max
                    15MB each)
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Image className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-1">
                        Photo Tips for Better Bookings:
                      </p>
                      <ul className="text-xs space-y-1 text-green-700">
                        <li>
                          • Include exterior shots showing the venue entrance
                        </li>
                        <li>• Capture different sports areas and courts</li>
                        <li>
                          • Show amenities like parking, changing rooms, etc.
                        </li>
                        <li>• Use good lighting and avoid blurry images</li>
                        <li>
                          • Photos help customers trust and choose your venue
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
                className="order-2 sm:order-1"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isLoading || !watchedName || !watchedAddress}
                className="flex items-center gap-2 bg-[#00884d] hover:bg-[#00a855] order-1 sm:order-2 px-8"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Venue...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
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
