"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import type { CourtWithRelations } from "@/types/court";

interface DeleteCourtDialogProps {
  isOpen: boolean;
  onClose: () => void;
  court: CourtWithRelations | null;
  onCourtDeleted: () => void;
}

export function DeleteCourtDialog({
  isOpen,
  onClose,
  court,
  onCourtDeleted,
}: DeleteCourtDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!court) return;

    setIsLoading(true);
    try {
      console.log("🏟️ [DELETE COURT] Deleting court:", court.id);

      const response = await fetch(`/api/owner/courts/${court.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Court deleted successfully!");
        onCourtDeleted();
        onClose();
      } else {
        console.error("❌ [DELETE COURT] Error:", result.error);
        toast.error(result.error || "Failed to delete court");
      }
    } catch (error) {
      console.error("❌ [DELETE COURT] Network error:", error);
      toast.error("Failed to delete court. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!court) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete Court
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete <strong>{court.name}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. All associated time slots and
              booking history will be permanently removed.
            </p>
            {court._count && court._count.bookings > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> This court has{" "}
                  {court._count.bookings} booking(s) associated with it. Make
                  sure there are no active bookings before deleting.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Court
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
