import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Types for user management
export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: 'ADMIN' | 'FACILITY_OWNER' | 'USER';
  isBanned: boolean;
  bannedAt: Date | null;
  banReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    ownedVenues: number;
    bookings: number;
    reviews: number;
  };
}

export interface UserStatistics {
  totalUsers: number;
  bannedUsers: number;
  activeUsers: number;
  adminCount: number;
  ownerCount: number;
  userCount: number;
}

export interface UserListResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  statistics: UserStatistics;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  banStatus?: string;
}

// Query keys for user management
export const adminUserKeys = {
  all: ['admin-users'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...adminUserKeys.lists(), { filters }] as const,
  details: () => [...adminUserKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminUserKeys.details(), id] as const,
};

// Hook for fetching admin users with filters
export function useAdminUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: adminUserKeys.list(filters),
    queryFn: async (): Promise<UserListResponse> => {
      const params = new URLSearchParams();

      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.banStatus) params.append('banStatus', filters.banStatus);

      const response = await axios.get(`/api/admin/users?${params.toString()}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Hook for banning a user
export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      const response = await axios.post(`/api/admin/users/${userId}/ban`, {
        reason: reason || null,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all user lists to refresh data
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
    },
    onError: (error) => {
      console.error('Error banning user:', error);
    },
  });
}

// Hook for unbanning a user
export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await axios.post(`/api/admin/users/${userId}/unban`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all user lists to refresh data
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
    },
    onError: (error) => {
      console.error('Error unbanning user:', error);
    },
  });
}

