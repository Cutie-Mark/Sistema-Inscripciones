import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/viewModels/hooks/useApiRequest";
import { Olimpiada } from "@/models/interfaces/versiones";

export interface VersionesPageProps {
  title: string;
  returnTo?: string;
  textoNoHayVersiones?: string;
  filter?: (value: Olimpiada, index: number, array: Olimpiada[]) => unknown;
  textoBoton?: string;
}

export function useVersionesPageViewModel({
  filter,
}: VersionesPageProps) {
  const [versiones, setVersiones] = useState<Olimpiada[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      
        const { data } = await axios.get<Olimpiada[]>(
          `${API_URL}/api/olimpiadas/conFases`
        );
        console.log("Data fetched:", data);
        if (filter) {
          setVersiones(data.filter(filter));
        } else {
          setVersiones(data);
        }
      
    } catch (error) {
      console.error("Error fetching versiones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    versiones,
    loading,
  };
}
