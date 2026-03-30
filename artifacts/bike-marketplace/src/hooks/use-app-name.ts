import { useGetAdminProfile } from "@workspace/api-client-react";

export function useAppName(): string {
  const { data: profile } = useGetAdminProfile();
  return (profile as Record<string, unknown>)?.appName as string || "ApexMoto";
}
