import useSWR from 'swr';

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then(res => res.json());

// Custom hooks for data fetching with caching
export const useDashboardData = (userRole?: string) => {
  return useSWR(
    userRole ? `/api/dashboard/${userRole}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );
};

export const useUserProfile = (userId?: number) => {
  return useSWR(
    userId ? `/api/users/${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // 10 minutes
    }
  );
};

export const useHalaqahList = () => {
  return useSWR('/api/halaqah', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 minutes
  });
};

export const useAnnouncements = (userRole?: string) => {
  return useSWR(
    userRole ? `/api/pengumuman?role=${userRole}` : '/api/pengumuman',
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 180000, // 3 minutes
    }
  );
};

export const useAnalyticsData = (type: string, params?: Record<string, any>) => {
  const queryString = params ? new URLSearchParams(params).toString() : '';
  return useSWR(
    `/api/analytics/${type}?${queryString}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // 10 minutes
    }
  );
};

// Mutation hooks for data updates
export const useCreateAnnouncement = () => {
  const { mutate } = useSWR('/api/pengumuman');

  const createAnnouncement = async (data: any) => {
    const response = await fetch('/api/pengumuman', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create announcement');
    }

    const result = await response.json();
    mutate(); // Revalidate announcements
    return result;
  };

  return { createAnnouncement };
};

export const useUpdateProfile = () => {
  const { mutate } = useSWR('/api/auth/me');

  const updateProfile = async (data: any) => {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const result = await response.json();
    mutate(); // Revalidate profile
    return result;
  };

  return { updateProfile };
};