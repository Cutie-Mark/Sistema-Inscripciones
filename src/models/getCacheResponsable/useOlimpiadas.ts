import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { request } from "@/models/api/solicitudes";
import { type Olimpiada } from "@/models/interfaces/versiones";

export const useOlimpiada = (
  olimpiadaId: number,
  options?: UseQueryOptions<Olimpiada, Error>
) => {
  return useQuery<Olimpiada, Error>({
    queryKey: ["olimpiada", olimpiadaId],
    staleTime: 1000 * 60 * 60, // 2 minutos sin marcarse como "stale"
    gcTime: 1000 * 60 * 60, // 2 minutos antes de purgar el cache
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await request<Olimpiada>(
        `/api/olimpiadas/${olimpiadaId}`
      );
      return response;
    },
    ...options,
  });
};
