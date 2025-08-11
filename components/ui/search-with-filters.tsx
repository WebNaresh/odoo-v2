"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, X, SlidersHorizontal, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface SearchWithFiltersProps {
  placeholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortOptions?: FilterOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;
  filters?: {
    sports?: FilterOption[];
    amenities?: FilterOption[];
    priceRange?: {
      min: number;
      max: number;
      step: number;
    };
    location?: FilterOption[];
  };
  selectedFilters?: {
    sports?: string[];
    amenities?: string[];
    priceRange?: [number, number];
    location?: string;
  };
  onFiltersChange?: (filters: any) => void;
  onClearFilters?: () => void;
  className?: string;
  showMobileFilters?: boolean;
}

export function SearchWithFilters({
  placeholder = "Search...",
  searchValue,
  onSearchChange,
  sortOptions,
  sortValue,
  onSortChange,
  filters,
  selectedFilters,
  onFiltersChange,
  onClearFilters,
  className,
  showMobileFilters = true,
}: SearchWithFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleFilterChange = (filterType: string, value: any) => {
    if (onFiltersChange) {
      onFiltersChange({
        ...selectedFilters,
        [filterType]: value,
      });
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedFilters?.sports?.length) count += selectedFilters.sports.length;
    if (selectedFilters?.amenities?.length) count += selectedFilters.amenities.length;
    if (selectedFilters?.location) count += 1;
    if (selectedFilters?.priceRange && filters?.priceRange) {
      const [min, max] = selectedFilters.priceRange;
      if (min !== filters.priceRange.min || max !== filters.priceRange.max) count += 1;
    }
    return count;
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Sports Filter */}
      {filters?.sports && (
        <div>
          <h4 className="font-medium mb-3">Sports</h4>
          <div className="space-y-2">
            {filters.sports.map((sport) => (
              <div key={sport.id} className="flex items-center space-x-2">
                <Checkbox
                  id={sport.id}
                  checked={selectedFilters?.sports?.includes(sport.value) || false}
                  onCheckedChange={(checked) => {
                    const currentSports = selectedFilters?.sports || [];
                    const newSports = checked
                      ? [...currentSports, sport.value]
                      : currentSports.filter(s => s !== sport.value);
                    handleFilterChange("sports", newSports);
                  }}
                />
                <label htmlFor={sport.id} className="text-sm">{sport.label}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location Filter */}
      {filters?.location && (
        <div>
          <h4 className="font-medium mb-3">Location</h4>
          <Select
            value={selectedFilters?.location || ""}
            onValueChange={(value) => handleFilterChange("location", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Locations</SelectItem>
              {filters.location.map((location) => (
                <SelectItem key={location.id} value={location.value}>
                  {location.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Price Range Filter */}
      {filters?.priceRange && (
        <div>
          <h4 className="font-medium mb-3">Price Range</h4>
          <div className="px-2">
            <Slider
              value={selectedFilters?.priceRange || [filters.priceRange.min, filters.priceRange.max]}
              onValueChange={(value) => handleFilterChange("priceRange", value)}
              max={filters.priceRange.max}
              min={filters.priceRange.min}
              step={filters.priceRange.step}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>₹{selectedFilters?.priceRange?.[0] || filters.priceRange.min}</span>
              <span>₹{selectedFilters?.priceRange?.[1] || filters.priceRange.max}</span>
            </div>
          </div>
        </div>
      )}

      {/* Amenities Filter */}
      {filters?.amenities && (
        <div>
          <h4 className="font-medium mb-3">Amenities</h4>
          <div className="space-y-2">
            {filters.amenities.map((amenity) => (
              <div key={amenity.id} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity.id}
                  checked={selectedFilters?.amenities?.includes(amenity.value) || false}
                  onCheckedChange={(checked) => {
                    const currentAmenities = selectedFilters?.amenities || [];
                    const newAmenities = checked
                      ? [...currentAmenities, amenity.value]
                      : currentAmenities.filter(a => a !== amenity.value);
                    handleFilterChange("amenities", newAmenities);
                  }}
                />
                <label htmlFor={amenity.id} className="text-sm">{amenity.label}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {getActiveFiltersCount() > 0 && onClearFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="w-full"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Sort Row */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort Dropdown */}
        {sortOptions && onSortChange && (
          <Select value={sortValue} onValueChange={onSortChange}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Desktop Filters Button */}
        {filters && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="hidden md:flex">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Filters</h4>
                  <p className="text-sm text-muted-foreground">
                    Refine your search results
                  </p>
                </div>
                <FilterContent />
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Mobile Filters Button */}
        {filters && showMobileFilters && (
          <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
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
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFilters?.sports?.map((sport) => (
            <Badge key={sport} variant="secondary" className="gap-1">
              {sport}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  const newSports = selectedFilters.sports?.filter(s => s !== sport) || [];
                  handleFilterChange("sports", newSports);
                }}
              />
            </Badge>
          ))}
          {selectedFilters?.amenities?.map((amenity) => (
            <Badge key={amenity} variant="secondary" className="gap-1">
              {amenity}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  const newAmenities = selectedFilters.amenities?.filter(a => a !== amenity) || [];
                  handleFilterChange("amenities", newAmenities);
                }}
              />
            </Badge>
          ))}
          {selectedFilters?.location && (
            <Badge variant="secondary" className="gap-1">
              <MapPin className="h-3 w-3" />
              {selectedFilters.location}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange("location", "")}
              />
            </Badge>
          )}
          {selectedFilters?.priceRange && filters?.priceRange && (
            <Badge variant="secondary" className="gap-1">
              ₹{selectedFilters.priceRange[0]} - ₹{selectedFilters.priceRange[1]}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange("priceRange", [filters.priceRange!.min, filters.priceRange!.max])}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
