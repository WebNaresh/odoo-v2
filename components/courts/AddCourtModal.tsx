"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus } from "lucide-react";
import {
  createCourtSchema,
  COURT_TYPES,
  DEFAULT_OPERATING_HOURS,
} from "@/types/court";
import type { CreateCourtData } from "@/types/court";

interface AddCourtModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueId: string;
  onCourtAdded: () => void;
}

interface Sport {
  id: string;
  name: string;
  category: string;
  isPopular: boolean;
}

export function AddCourtModal({
  isOpen,
  onClose,
  venueId,
  onCourtAdded,
}: AddCourtModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [sportsLoading, setSportsLoading] = useState(false);

  const form = useForm<CreateCourtData>({
    resolver: zodResolver(createCourtSchema),
    defaultValues: {
      name: "",
      courtType: "Standard",
      venueId: venueId,
      sportId: "",
      pricePerHour: 0,
      operatingHours: DEFAULT_OPERATING_HOURS,
      isActive: true,
    },
  });

  // Fetch sports when modal opens
  const fetchSports = async () => {
    if (sports.length > 0) return; // Already loaded

    setSportsLoading(true);
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
      setSportsLoading(false);
    }
  };

  // Handle modal open
  const handleOpenChange = (open: boolean) => {
    if (open) {
      fetchSports();
    } else {
      onClose();
      form.reset();
    }
  };

  const onSubmit = async (data: CreateCourtData) => {
    setIsLoading(true);
    try {
      console.log("🏟️ [ADD COURT] Submitting court data:", data);

      const response = await fetch("/api/owner/courts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Court added successfully!");
        onCourtAdded();
        onClose();
        form.reset();
      } else {
        console.error("❌ [ADD COURT] Error:", result.error);
        toast.error(result.error || "Failed to add court");
      }
    } catch (error) {
      console.error("❌ [ADD COURT] Network error:", error);
      toast.error("Failed to add court. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Court
          </DialogTitle>
          <DialogDescription>
            Add a new court to your venue. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Court Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Court Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Basketball Court 1, Tennis Court A"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Court Type */}
            <FormField
              control={form.control}
              name="courtType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Court Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select court type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COURT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sport */}
            <FormField
              control={form.control}
              name="sportId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sport</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sport" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sportsLoading ? (
                        <SelectItem value="" disabled>
                          Loading sports...
                        </SelectItem>
                      ) : (
                        sports.map((sport) => (
                          <SelectItem key={sport.id} value={sport.id}>
                            {sport.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price Per Hour */}
            <FormField
              control={form.control}
              name="pricePerHour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Per Hour (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="500"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable this court for bookings
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Court
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
