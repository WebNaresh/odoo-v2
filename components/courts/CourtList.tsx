"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, MoreHorizontal, Users, IndianRupee } from "lucide-react";
import type { CourtWithRelations } from "@/types/court";
import { EditCourtModal } from "./EditCourtModal";
import { DeleteCourtDialog } from "./DeleteCourtDialog";

interface CourtListProps {
  courts: CourtWithRelations[];
  onCourtUpdated: () => void;
  onCourtDeleted: () => void;
}

export function CourtList({ courts, onCourtUpdated, onCourtDeleted }: CourtListProps) {
  const [editingCourt, setEditingCourt] = useState<CourtWithRelations | null>(null);
  const [deletingCourt, setDeletingCourt] = useState<CourtWithRelations | null>(null);

  const handleEdit = (court: CourtWithRelations) => {
    setEditingCourt(court);
  };

  const handleDelete = (court: CourtWithRelations) => {
    setDeletingCourt(court);
  };

  const handleEditClose = () => {
    setEditingCourt(null);
  };

  const handleDeleteClose = () => {
    setDeletingCourt(null);
  };

  if (courts.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-2">No courts added yet</p>
        <p className="text-sm text-muted-foreground">
          Add courts to start accepting bookings
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Court Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price/Hour</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courts.map((court) => (
              <TableRow key={court.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{court.name}</div>
                    {court.venue && (
                      <div className="text-sm text-muted-foreground">
                        {court.venue.name}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {court.courtType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="h-3 w-3" />
                    <span className="font-medium">{court.pricePerHour}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={court.isActive ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {court.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {court._count?.bookings || 0} bookings
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(court)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(court)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {courts.map((court) => (
          <Card key={court.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{court.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(court)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(court)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {court.venue && (
                <p className="text-sm text-muted-foreground">{court.venue.name}</p>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {court.courtType}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price/Hour</p>
                  <div className="flex items-center gap-1 mt-1">
                    <IndianRupee className="h-3 w-3" />
                    <span className="font-medium">{court.pricePerHour}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={court.isActive ? "default" : "secondary"}
                    className="text-xs mt-1"
                  >
                    {court.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bookings</p>
                  <p className="text-sm font-medium mt-1">
                    {court._count?.bookings || 0} bookings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      <EditCourtModal
        isOpen={!!editingCourt}
        onClose={handleEditClose}
        court={editingCourt}
        onCourtUpdated={() => {
          onCourtUpdated();
          handleEditClose();
        }}
      />

      {/* Delete Dialog */}
      <DeleteCourtDialog
        isOpen={!!deletingCourt}
        onClose={handleDeleteClose}
        court={deletingCourt}
        onCourtDeleted={() => {
          onCourtDeleted();
          handleDeleteClose();
        }}
      />
    </>
  );
}
