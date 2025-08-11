"use client";

import { useState, useEffect } from "react";
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
import { Loader2, Edit } from "lucide-react";
import { updateCourtSchema, COURT_TYPES } from "@/types/court";
import type { UpdateCourtData, CourtWithRelations } from "@/types/court";
import { getSortedSports } from "@/constants/sports";

interface EditCourtModalProps {
  isOpen: boolean;
  onClose: () => void;
  court: CourtWithRelations | null;
  onCourtUpdated: () => void;
}

export function EditCourtModal({
  isOpen,
  onClose,
  court,
  onCourtUpdated,
}: EditCourtModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Use predefined sports sorted by popularity and name
  const sports = getSortedSports();

  const form = useForm<UpdateCourtData>({
    resolver: zodResolver(updateCourtSchema),
    defaultValues: {
      id: "",
      name: "",
      courtType: "Standard",
      sportId: "",
      pricePerHour: 0,
      isActive: true,
    },
  });

  // Update form when court changes
  useEffect(() => {
    if (court) {
      form.reset({
        id: court.id,
        name: court.name,
        courtType: court.courtType as any,
        sportId: court.sportId,
        pricePerHour: court.pricePerHour,
        operatingHours: court.operatingHours,
        isActive: court.isActive,
      });
    }
  }, [court, form]);

  // Handle modal open/close
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const onSubmit = async (data: UpdateCourtData) => {
    if (!court) return;

    setIsLoading(true);
    try {
      console.log("🏟️ [EDIT COURT] Updating court data:", data);

      const response = await fetch(`/api/owner/courts/${court.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Court updated successfully!");
        onCourtUpdated();
        onClose();
      } else {
        console.error("❌ [EDIT COURT] Error:", result.error);
        toast.error(result.error || "Failed to update court");
      }
    } catch (error) {
      console.error("❌ [EDIT COURT] Network error:", error);
      toast.error("Failed to update court. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!court) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Court
          </DialogTitle>
          <DialogDescription>Update the court details below.</DialogDescription>
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sport" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sports.map((sport) => (
                        <SelectItem key={sport.id} value={sport.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{sport.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {sport.category}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
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
                Update Court
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
