"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MainNav } from "@/components/layout/main-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Search, MapPin, Star, Filter, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useVenuesWithFilters } from "@/hooks/use-venues";

const sportsOptions = ["Basketball", "Tennis", "Football", "Badminton", "Cricket", "Swimming", "Volleyball", "Squash"];
const amenitiesOptions = ["Parking", "Changing Rooms", "Cafeteria", "AC", "Equipment Rental", "Shower", "Locker"];

export default function VenuesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams.get("search") || "";
  const initialSport = searchParams.get("sport") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedSports, setSelectedSports] = useState<string[]>(initialSport ? [initialSport] : []);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [sortBy, setSortBy] = useState("rating");

  // Use React Query hook for venues with filters
  const {
    data: venuesResponse,
    isLoading: loading,
    isError,
  } = useVenuesWithFilters(
    searchQuery,
    selectedSports,
    selectedAmenities,
    priceRange,
    sortBy,
    50
  );

  const venues = venuesResponse?.success ? venuesResponse.venues : [];
  const totalCount = venuesResponse?.success ? venuesResponse.pagination.total : 0;

  const handleSportChange = (sport: string, checked: boolean) => {
    if (checked) {
      setSelectedSports([...selectedSports, sport]);
    } else {
      setSelectedSports(selectedSports.filter(s => s !== sport));
    }
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities([...selectedAmenities, amenity]);
    } else {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    }
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Sports</h3>
        <div className="space-y-2">
          {sportsOptions.map((sport) => (
            <div key={sport} className="flex items-center space-x-2">
              <Checkbox
                id={sport}
                checked={selectedSports.includes(sport)}
                onCheckedChange={(checked) => handleSportChange(sport, checked as boolean)}
              />
              <label htmlFor={sport} className="text-sm">{sport}</label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={2000}
            min={0}
            step={100}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Amenities</h3>
        <div className="space-y-2">
          {amenitiesOptions.map((amenity) => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox
                id={amenity}
                checked={selectedAmenities.includes(amenity)}
                onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
              />
              <label htmlFor={amenity} className="text-sm">{amenity}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Find Sports Venues</h1>
          
          {/* Search and Sort */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="distance">Nearest First</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Refine your search results
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </aside>

          {/* Venues Grid */}
          <div className="flex-1">
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {venues.length} of {totalCount} venues
            </div>

            {loading ? (
              <div className="grid gap-6">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="md:flex">
                      <div className="md:w-64 aspect-video md:aspect-square bg-muted animate-pulse" />
                      <div className="flex-1">
                        <CardHeader>
                          <div className="space-y-2">
                            <div className="h-6 bg-muted animate-pulse rounded" />
                            <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <div className="h-6 bg-muted animate-pulse rounded w-16" />
                              <div className="h-6 bg-muted animate-pulse rounded w-20" />
                            </div>
                            <div className="h-10 bg-muted animate-pulse rounded" />
                          </div>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold mb-2">Unable to load venues</h3>
                <p className="text-muted-foreground mb-4">
                  There was an error loading venues. Please try again later.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            ) : venues.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏟️</div>
                <h3 className="text-xl font-semibold mb-2">No venues found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSports([]);
                    setSelectedAmenities([]);
                    setPriceRange([0, 2000]);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {venues.map((venue) => (
                  <Card key={venue.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="md:flex">
                      <div className="md:w-64 aspect-video md:aspect-square bg-muted relative overflow-hidden">
                        {venue.photoUrls && venue.photoUrls.length > 0 ? (
                          <img
                            src={venue.photoUrls[0]}
                            alt={venue.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <span className="text-4xl">🏟️</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl">{venue.name}</CardTitle>
                              <CardDescription className="flex items-center gap-1 mt-1">
                                <MapPin className="h-4 w-4" />
                                {venue.address}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">
                                {venue.rating ? venue.rating.toFixed(1) : "New"}
                              </span>
                              <span className="text-muted-foreground">({venue.reviewCount})</span>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-1">
                              {venue.sports.slice(0, 4).map((sport) => (
                                <Badge key={sport} variant="secondary" className="text-xs">
                                  {sport}
                                </Badge>
                              ))}
                              {venue.sports.length > 4 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{venue.sports.length - 4} more
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {venue.amenities.slice(0, 3).map((amenity) => (
                                <Badge key={amenity} variant="outline" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                              {venue.amenities.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{venue.amenities.length - 3} more
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-lg font-semibold">{venue.priceRange}</span>
                                {venue.courtCount > 0 && (
                                  <span className="text-sm text-muted-foreground ml-2">
                                    • {venue.courtCount} courts
                                  </span>
                                )}
                              </div>
                              <Button onClick={() => router.push(`/venues/${venue.id}`)}>
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
