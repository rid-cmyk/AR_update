export interface UserProfile {
  id: number;
  namaLengkap: string;
  username: string;
  foto?: string;
  noTlp?: string;
  role: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProfileContentProps {
  profile: UserProfile | null;
  onProfileUpdate: () => void;
}

export const NAVY = "#023047";
export const TEAL = "#219ebc";
export const TEAL_SOFT = "rgba(33, 158, 188, 0.15)";
export const GOLD = "#fb8500";
export const SLATE = "#64748b";
export const INK = "#0f172a";

export function formatRoleName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
