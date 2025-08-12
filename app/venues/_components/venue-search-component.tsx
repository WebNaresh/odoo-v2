"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { loadGoogleMapsApi } from "@/lib/google-maps";
import { cn } from "@/lib/utils";
import { MapPin, Crosshair, Loader2, Search } from "lucide-react";
import PlacesAutocomplete, {
  geocodeByPlaceId,
  Suggestion,
} from "react-places-autocomplete";

interface LocationData {
  address: string;
  lat: number;
  lng: number;
}

interface VenueSearchComponentProps {
  className?: string;
}

export default function VenueSearchComponent({
  className,
}: VenueSearchComponentProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [apiLoaded, setApiLoaded] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Load Google Maps API on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if API is already loaded
      if (window.google && window.google.maps) {
        setApiLoaded(true);
        return;
      }

      // Load API
      loadGoogleMapsApi()
        .then(() => setApiLoaded(true))
        .catch((error) =>
          console.error("Error loading Google Maps API:", error)
        );
    }
  }, []);

  // Handle location selection from Google Places
  const handleLocationSelect = useCallback(
    async (address: string) => {
      try {
        console.log("🔍 [VENUE SEARCH] Location selected:", address);

        // Use Google Places to get coordinates
        const results = await new Promise<google.maps.GeocoderResult[]>(
          (resolve, reject) => {
            if (!window.google?.maps?.Geocoder) {
              reject(new Error("Google Maps Geocoder not available"));
              return;
            }

            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ address }, (results, status) => {
              if (status === "OK" && results && results.length > 0) {
                resolve(results);
              } else {
                reject(new Error(`Geocoding failed: ${status}`));
              }
            });
          }
        );

        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();

        console.log("📍 [VENUE SEARCH] Coordinates extracted:", { lat, lng });

        // Redirect to venues page with coordinates
        router.push(`/venues?lat=${lat}&lng=${lng}`);
      } catch (error) {
        console.error("❌ [VENUE SEARCH] Error getting coordinates:", error);
        toast.error("Failed to get location coordinates");
      }
    },
    [router]
  );

  // Handle Places Autocomplete selection
  const handlePlacesSelect = useCallback(
    async (address: string, placeId: string) => {
      try {
        console.log("🏠 [VENUE SEARCH] Places selected:", { address, placeId });

        if (!placeId) {
          // Fallback to regular geocoding
          await handleLocationSelect(address);
          return;
        }

        // Use place ID to get detailed information
        const results = await geocodeByPlaceId(placeId);
        const place = results[0];

        if (place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          console.log("📍 [VENUE SEARCH] Places coordinates:", { lat, lng });

          // Redirect to venues page with coordinates
          router.push(`/venues?lat=${lat}&lng=${lng}`);
        } else {
          throw new Error("No coordinates found for selected place");
        }
      } catch (error) {
        console.error("❌ [VENUE SEARCH] Error with Places selection:", error);
        // Fallback to regular geocoding
        await handleLocationSelect(address);
      }
    },
    [handleLocationSelect, router]
  );

  // Get user's current location
  const getUserLocation = useCallback((): Promise<{
    lat: number;
    lng: number;
  }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ lat: latitude, lng: longitude });
        },
        (error) => {
          let errorMessage = "Failed to get your location";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enable location permissions.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }

          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }, []);

  // Handle "Detect My Location" button click
  const handleDetectLocation = useCallback(async () => {
    try {
      setIsDetectingLocation(true);
      console.log("📍 [VENUE SEARCH] Detecting user location...");

      const { lat, lng } = await getUserLocation();

      console.log("✅ [VENUE SEARCH] Location detected:", { lat, lng });
      toast.success("Location detected successfully!");

      // Redirect to venues page with coordinates
      router.push(`/venues?lat=${lat}&lng=${lng}`);
    } catch (error) {
      console.error("❌ [VENUE SEARCH] Location detection failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to detect location"
      );
    } finally {
      setIsDetectingLocation(false);
    }
  }, [getUserLocation, router]);

  // Handle manual search submission
  const handleManualSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchValue.trim()) {
        // Try to geocode the manual input
        handleLocationSelect(searchValue.trim());
      }
    },
    [searchValue, handleLocationSelect]
  );

  // Search options for Places Autocomplete
  const searchOptions = {
    types: ["(cities)"], // Focus on cities and localities
    componentRestrictions: { country: "in" }, // Restrict to India
  };

  if (!apiLoaded) {
    return (
      <div className={cn("w-full max-w-2xl mx-auto mb-8 px-4", className)}>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00884d]/20 to-[#00a855]/20 rounded-2xl blur-sm"></div>
          <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-[#00884d]/10 p-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center">
                <MapPin className="h-5 w-5 text-[#00884d]/60" />
              </div>
              <Input
                type="text"
                placeholder="Loading location search..."
                disabled
                className="pl-12 pr-20 h-14 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500 font-medium rounded-xl"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 bg-[#00884d]/5 rounded-lg px-3 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#00884d]" />
                <span className="text-sm text-[#00884d] font-medium hidden sm:inline">
                  Loading...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full max-w-2xl mx-auto mb-8 px-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500",
        className
      )}
    >
      <form onSubmit={handleManualSearch} className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00884d]/20 to-[#00a855]/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-[#00884d]/10 p-4 hover:shadow-xl hover:border-[#00884d]/20 transition-all duration-300">
          <div className="relative">
            {/* Search Icon */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center">
              <Search className="h-5 w-5 text-[#00884d]/60" />
            </div>

            <PlacesAutocomplete
              value={searchValue}
              onChange={setSearchValue}
              onSelect={handlePlacesSelect}
              searchOptions={searchOptions}
            >
              {({
                getInputProps,
                suggestions,
                getSuggestionItemProps,
                loading,
              }) => (
                <div className="relative">
                  <Input
                    {...getInputProps({
                      placeholder:
                        "Where do you want to play? Search locations...",
                      className:
                        "pl-12 pr-32 h-14 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500 font-medium rounded-xl transition-all duration-200 focus:placeholder:text-gray-400",
                      "aria-label": "Search for sports venues by location",
                      autoComplete: "off",
                      spellCheck: false,
                    })}
                  />

                  {/* Detect Location Button */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleDetectLocation}
                      disabled={isDetectingLocation}
                      className="h-10 px-3 bg-[#00884d]/5 hover:bg-[#00884d]/10 text-[#00884d] hover:text-[#00a855] border border-[#00884d]/20 hover:border-[#00884d]/30 rounded-lg transition-all duration-200 group"
                    >
                      {isDetectingLocation ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Crosshair className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      )}
                      <span className="ml-2 text-sm font-medium hidden sm:inline">
                        {isDetectingLocation
                          ? "Detecting..."
                          : "Use My Location"}
                      </span>
                      <span className="ml-1 text-xs font-medium sm:hidden">
                        {isDetectingLocation ? "..." : "GPS"}
                      </span>
                    </Button>
                  </div>

                  {/* Suggestions Dropdown */}
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm border border-[#00884d]/10 rounded-xl shadow-xl z-50 mt-2 max-h-64 overflow-y-auto">
                      {loading && (
                        <div className="p-4 text-center text-[#00884d]/70">
                          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                          <span className="text-sm font-medium">
                            Finding locations...
                          </span>
                        </div>
                      )}
                      {suggestions.map((suggestion, index) => {
                        const { key, ...suggestionProps } =
                          getSuggestionItemProps(suggestion, {
                            className: cn(
                              "p-4 cursor-pointer border-b border-[#00884d]/5 last:border-b-0 hover:bg-[#00884d]/5 transition-all duration-200 group",
                              suggestion.active && "bg-[#00884d]/10"
                            ),
                          });

                        return (
                          <div key={key || index} {...suggestionProps}>
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-[#00884d]/10 rounded-lg flex items-center justify-center group-hover:bg-[#00884d]/20 transition-colors duration-200">
                                <MapPin className="h-4 w-4 text-[#00884d]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-gray-800 group-hover:text-[#00884d] transition-colors duration-200 block truncate">
                                  {suggestion.description}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </PlacesAutocomplete>
          </div>
        </div>
      </form>

      {/* Quick Tips */}
      <div className="mt-4 text-center">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Crosshair className="h-3 w-3" />
            <span>GPS for instant location</span>
          </div>
          <div className="flex items-center gap-1">
            <Search className="h-3 w-3" />
            <span>Type city, area, or landmark</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>Find venues nearby</span>
          </div>
        </div>
      </div>
    </div>
  );
}
