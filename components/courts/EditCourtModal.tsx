"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
  FormDescription,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Edit,
  Trash2,
  Clock,
  Users,
  Calendar,
  Settings,
  X,
  Plus,
} from "lucide-react";
import {
  updateCourtSchema,
  COURT_TYPES,
  DEFAULT_TIME_SLOT_CONFIG,
  DEFAULT_EXCLUDED_TIMES,
  DEFAULT_SLOT_DURATION,
  DEFAULT_CAPACITY,
  SLOT_DURATION_OPTIONS,
} from "@/types/court";
import type {
  UpdateCourtData,
  CourtWithRelations,
  ExcludedTimeRange,
  TimeSlotConfig,
} from "@/types/court";

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

  const form = useForm<UpdateCourtData>({
    resolver: zodResolver(updateCourtSchema),
    defaultValues: {
      id: "",
      name: "",
      courtType: "Standard",
      pricePerHour: 0,
      capacity: DEFAULT_CAPACITY,
      slotConfig: DEFAULT_TIME_SLOT_CONFIG,
      excludedTimes: DEFAULT_EXCLUDED_TIMES,
      slotDuration: DEFAULT_SLOT_DURATION,
      isActive: true,
    },
  });

  // Field array for excluded times
  const {
    fields: excludedTimeFields,
    append: appendExcludedTime,
    remove: removeExcludedTime,
  } = useFieldArray({
    control: form.control,
    name: "excludedTimes",
  });

  // Update form when court changes
  useEffect(() => {
    if (court) {
      form.reset({
        id: court.id,
        name: court.name,
        courtType: court.courtType as any,
        pricePerHour: court.pricePerHour,
        capacity: court.capacity || DEFAULT_CAPACITY,
        operatingHours: court.operatingHours,
        slotConfig: court.slotConfig || DEFAULT_TIME_SLOT_CONFIG,
        excludedTimes: court.excludedTimes || DEFAULT_EXCLUDED_TIMES,
        slotDuration: court.slotDuration || DEFAULT_SLOT_DURATION,
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
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

            {/* Court Capacity */}
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Court Capacity
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of people/players the court can accommodate
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time Slot Configuration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <h3 className="text-lg font-semibold">
                  Time Slot Configuration
                </h3>
              </div>
              <Separator />

              {/* Slot Duration */}
              <FormField
                control={form.control}
                name="slotDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booking Slot Duration</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select slot duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SLOT_DURATION_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value.toString()}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How long each booking slot should be
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Time Slot Range */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="slotConfig.startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available From</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slotConfig.endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Until</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Excluded Times */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-base">Break Periods</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      appendExcludedTime({
                        id: Date.now().toString(),
                        name: "",
                        startTime: "12:00",
                        endTime: "13:00",
                        days: [
                          "monday",
                          "tuesday",
                          "wednesday",
                          "thursday",
                          "friday",
                        ],
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Break Period
                  </Button>
                </div>
                <FormDescription>
                  Define periods when the court is not available for booking
                  (e.g., lunch break, maintenance)
                </FormDescription>

                {excludedTimeFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <FormField
                        control={form.control}
                        name={`excludedTimes.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1 mr-4">
                            <FormLabel>Break Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Lunch Break, Maintenance"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExcludedTime(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`excludedTimes.${index}.startTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`excludedTimes.${index}.endTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`excludedTimes.${index}.days`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Days</FormLabel>
                          <div className="flex flex-wrap gap-2">
                            {[
                              "monday",
                              "tuesday",
                              "wednesday",
                              "thursday",
                              "friday",
                              "saturday",
                              "sunday",
                            ].map((day) => (
                              <Badge
                                key={day}
                                variant={
                                  field.value?.includes(day)
                                    ? "default"
                                    : "outline"
                                }
                                className="cursor-pointer"
                                onClick={() => {
                                  const currentDays = field.value || [];
                                  if (currentDays.includes(day)) {
                                    field.onChange(
                                      currentDays.filter((d) => d !== day)
                                    );
                                  } else {
                                    field.onChange([...currentDays, day]);
                                  }
                                }}
                              >
                                {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>

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
