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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Star, Filter, SlidersHorizontal, Grid3X3, List, X, RefreshCw, TrendingUp, Users, Clock, Heart } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeFilters, setActiveFilters] = useState(0);

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
    <div className="space-y-8">
      <div>
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#00884d]" />
          Sports
        </h3>
        <div className="space-y-3">
          {sportsOptions.map((sport) => (
            <div key={sport} className="flex items-center space-x-3 group">
              <Checkbox
                id={sport}
                checked={selectedSports.includes(sport)}
                onCheckedChange={(checked) => handleSportChange(sport, checked as boolean)}
                className="data-[state=checked]:bg-[#00884d] data-[state=checked]:border-[#00884d]"
              />
              <label
                htmlFor={sport}
                className="text-sm font-medium text-gray-700 group-hover:text-[#00884d] cursor-pointer transition-colors"
              >
                {sport}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#00884d]" />
          Price Range
        </h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={2000}
            min={0}
            step={100}
            className="mb-4"
          />
          <div className="flex justify-between text-sm font-medium text-gray-600 bg-gray-50 p-3 rounded-lg">
            <span>₹{priceRange[0]}</span>
            <span className="text-gray-400">to</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-[#00884d]" />
          Amenities
        </h3>
        <div className="space-y-3">
          {amenitiesOptions.map((amenity) => (
            <div key={amenity} className="flex items-center space-x-3 group">
              <Checkbox
                id={amenity}
                checked={selectedAmenities.includes(amenity)}
                onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                className="data-[state=checked]:bg-[#00884d] data-[state=checked]:border-[#00884d]"
              />
              <label
                htmlFor={amenity}
                className="text-sm font-medium text-gray-700 group-hover:text-[#00884d] cursor-pointer transition-colors"
              >
                {amenity}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Calculate active filters count
  const calculateActiveFilters = () => {
    let count = 0;
    if (selectedSports.length > 0) count++;
    if (selectedAmenities.length > 0) count++;
    if (priceRange[0] > 0 || priceRange[1] < 2000) count++;
    return count;
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedSports([]);
    setSelectedAmenities([]);
    setPriceRange([0, 2000]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00884d] to-[#00a855] rounded-2xl flex items-center justify-center">
                <Search className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Sports Venues</h1>
                <p className="text-gray-600 text-lg">
                  Discover and book amazing sports facilities near you
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{totalCount} venues available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Trusted by 50k+ players</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-[#00884d] hover:bg-[#00a855]' : ''}
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-[#00884d] hover:bg-[#00a855]' : ''}
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Grid
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search venues by name, location, or sport..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base border-gray-200 focus:border-[#00884d] rounded-xl"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48 h-12 border-gray-200 focus:border-[#00884d] rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">⭐ Highest Rated</SelectItem>
                  <SelectItem value="price-low">💰 Price: Low to High</SelectItem>
                  <SelectItem value="price-high">💎 Price: High to Low</SelectItem>
                  <SelectItem value="distance">📍 Nearest First</SelectItem>
                </SelectContent>
              </Select>

              {/* Enhanced Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="lg:hidden h-12 border-[#00884d]/20 text-[#00884d] hover:bg-[#00884d]/5 rounded-xl relative"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {calculateActiveFilters() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#00884d] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {calculateActiveFilters()}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <SlidersHorizontal className="h-5 w-5 text-[#00884d]" />
                      Filters
                    </SheetTitle>
                    <SheetDescription>
                      Refine your search to find the perfect venue
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar />
                    {calculateActiveFilters() > 0 && (
                      <div className="mt-6 pt-6 border-t">
                        <Button
                          variant="outline"
                          onClick={clearAllFilters}
                          className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear All Filters
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Active Filters Display */}
          {calculateActiveFilters() > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500 font-medium">Active filters:</span>
              {selectedSports.length > 0 && (
                <Badge variant="secondary" className="bg-[#00884d]/10 text-[#00884d]">
                  Sports: {selectedSports.length}
                </Badge>
              )}
              {selectedAmenities.length > 0 && (
                <Badge variant="secondary" className="bg-[#00884d]/10 text-[#00884d]">
                  Amenities: {selectedAmenities.length}
                </Badge>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 2000) && (
                <Badge variant="secondary" className="bg-[#00884d]/10 text-[#00884d]">
                  Price: ₹{priceRange[0]} - ₹{priceRange[1]}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Enhanced Desktop Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                  {calculateActiveFilters() > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
                <FilterSidebar />
              </div>
            </div>
          </aside>

          {/* Enhanced Venues Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Showing {venues.length}</span> of {totalCount} venues
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500">Updated just now</span>
              </div>
            </div>

            {loading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : ''}`}>
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <div className={viewMode === 'grid' ? 'block' : 'md:flex'}>
                      <div className={`${viewMode === 'grid' ? 'aspect-video' : 'md:w-64 aspect-video md:aspect-square'} bg-gradient-to-br from-gray-200 to-gray-100 animate-pulse relative`}>
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-300/50 to-transparent" />
                      </div>
                      <div className="flex-1">
                        <CardHeader className="pb-3">
                          <div className="space-y-3">
                            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse rounded-lg" />
                            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse rounded-lg w-3/4" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse rounded-full w-16" />
                              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse rounded-full w-20" />
                              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse rounded-full w-14" />
                            </div>
                            <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse rounded-xl" />
                          </div>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">⚠️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Unable to load venues</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  There was an error loading venues. Please check your connection and try again.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-[#00884d] hover:bg-[#00a855]"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/")}
                    className="border-[#00884d] text-[#00884d] hover:bg-[#00884d]/5"
                  >
                    Go Home
                  </Button>
                </div>
              </div>
            ) : venues.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-[#00884d]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🏟️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No venues found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  We couldn't find any venues matching your criteria. Try adjusting your search or filters.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={clearAllFilters}
                    className="bg-[#00884d] hover:bg-[#00a855]"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/")}
                    className="border-[#00884d] text-[#00884d] hover:bg-[#00884d]/5"
                  >
                    Browse All Venues
                  </Button>
                </div>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : ''}`}>
                {venues.map((venue, index) => (
                  <Card
                    key={venue.id}
                    className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur-sm hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => router.push(`/venues/${venue.id}`)}
                  >
                    <div className={viewMode === 'grid' ? 'block' : 'md:flex'}>
                      <div className={`${viewMode === 'grid' ? 'aspect-video' : 'md:w-64 aspect-video md:aspect-square'} bg-gray-100 relative overflow-hidden`}>
                        {venue.photoUrls && venue.photoUrls.length > 0 ? (
                          <img
                            src={venue.photoUrls[0]}
                            alt={venue.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#00884d]/20 to-[#00a855]/10 flex items-center justify-center">
                            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🏟️</span>
                          </div>
                        )}

                        {/* Enhanced overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute top-4 right-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add to favorites functionality
                            }}
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-end justify-between">
                            <div>
                              {venue.priceRange && (
                                <Badge className="mb-2 bg-[#00884d]/90 hover:bg-[#00884d] text-white border-0">
                                  {venue.priceRange}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-white text-sm font-medium">
                                {venue.rating ? venue.rating.toFixed(1) : "New"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <CardHeader className="pb-3">
                          <div className="space-y-3">
                            <div>
                              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-[#00884d] transition-colors duration-200 line-clamp-1">
                                {venue.name}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-1 mt-2 text-gray-600">
                                <MapPin className="h-4 w-4 text-[#00884d]" />
                                <span className="line-clamp-1">{venue.address}</span>
                              </CardDescription>
                            </div>

                            {viewMode === 'list' && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm font-semibold text-gray-900">
                                    {venue.rating ? venue.rating.toFixed(1) : "New"}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    ({venue.reviewCount} reviews)
                                  </span>
                                </div>
                                {venue.courtCount > 0 && (
                                  <div className="text-right">
                                    <div className="text-xs text-gray-500">{venue.courtCount} courts</div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {venue.sports.slice(0, viewMode === 'grid' ? 3 : 4).map((sport) => (
                                <Badge
                                  key={sport}
                                  className="text-xs bg-[#00884d]/10 text-[#00884d] hover:bg-[#00884d]/20 border-0"
                                >
                                  {sport}
                                </Badge>
                              ))}
                              {venue.sports.length > (viewMode === 'grid' ? 3 : 4) && (
                                <Badge className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 border-0">
                                  +{venue.sports.length - (viewMode === 'grid' ? 3 : 4)} more
                                </Badge>
                              )}
                            </div>

                            {viewMode === 'list' && (
                              <div className="flex flex-wrap gap-2">
                                {venue.amenities.slice(0, 3).map((amenity) => (
                                  <Badge key={amenity} variant="outline" className="text-xs border-[#00884d]/20 text-gray-600">
                                    {amenity}
                                  </Badge>
                                ))}
                                {venue.amenities.length > 3 && (
                                  <Badge variant="outline" className="text-xs border-gray-200 text-gray-500">
                                    +{venue.amenities.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-2">
                                {viewMode === 'grid' && venue.courtCount > 0 && (
                                  <span className="text-sm text-gray-500">
                                    {venue.courtCount} courts
                                  </span>
                                )}
                              </div>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/venues/${venue.id}`);
                                }}
                                className="bg-gradient-to-r from-[#00884d] to-[#00a855] hover:from-[#00a855] hover:to-[#00884d] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                              >
                                View Details →
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
