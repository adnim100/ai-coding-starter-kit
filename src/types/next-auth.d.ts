import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    totpEnabled?: boolean;
    accountPendingDeletion?: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      totpEnabled?: boolean;
      accountPendingDeletion?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    totpEnabled?: boolean;
    scheduledDeletion?: Date | null;
    accountPendingDeletion?: boolean;
  }
}
