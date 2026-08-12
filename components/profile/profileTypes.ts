export interface UserProfile {
  id: number;
  username: string;
  namaLengkap: string;
  email?: string;
  noTlp?: string;
  alamat?: string;
  foto?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  assignedSantris?: Array<{
    id: number;
    namaLengkap: string;
    username: string;
  }>;
  halaqah?: {
    namaHalaqah: string;
    guru?: {
      namaLengkap: string;
    };
  };
}
