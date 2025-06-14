import { useEffect, useState } from "react";
import { getListasPostulantes } from "@/models/api/postulantes";
import FormResponsable from "../../FormResponsable";
import NotFoundPage from "../../../404";
import Loading from "@/components/Loading";
import ReturnComponent from "@/components/ReturnComponent";
import Footer from "@/components/Footer";
import ButtonsGrid from "@/components/ButtonsGrid";
import { ButtonConfig } from "@/models/interfaces/buttons.interface";
import { Receipt, List, CheckCircle } from "lucide-react";
import { useOlimpiada } from "@/models/getCacheResponsable/useOlimpiadas";
import InscribirPostulante from "../../../../components/InscribirPostulante";
import ShareUrl from "../../ShareUrl";
import OlimpiadaNoEnCurso from "@/components/OlimpiadaNoEnCurso";
import InscribirExcel from "@/components/InscribirExcel";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Pasos from "./pasos";

const Page = () => {
  const [openFormResponsable, setOpenFormResponsable] = useState(false);
  const [loading, setLoading] = useState(true);
  const { ci, olimpiada_id } = useParams();
  const {
    data: olimpiada,
    isLoading: olimpiadaLoading,
    isError: olimpiadaError,
  } = useOlimpiada(Number(olimpiada_id));
  const buttons: ButtonConfig[] = [
    {
      label: "Ver Inscripciones",
      to: `listas`,
      Icon: List,
    },
    {
      label: "Generar Orden de Pago",
      to: `generarOrden`,
      Icon: Receipt,
      color: "amber",
    },
    {
      label: "Subir Comprobante de Pago",
      to: `subirComprobanteDePago`,
      Icon: CheckCircle,
      color: "slate",
    },
  ];
  const refresh = async () => {
    setLoading(true);
    try {
      await getListasPostulantes(ci!);
      setOpenFormResponsable(false);
    } catch {
      setOpenFormResponsable(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      refresh();
    } catch {
      console.error("Error al obtener las inscripciones de postulantes");
    }
  };

  useEffect(() => {
    if (!ci || ci.length < 7 || ci.length > 10) return;
    fetchData();
  }, [ci]);

  useEffect(() => {
    if (olimpiadaError) {
      console.error("Error al obtener olimpiada");
    }
  }, [olimpiadaError]);

  if (!ci || ci.length < 7 || ci.length > 10) {
    return <NotFoundPage />;
  }
  if (!olimpiada_id || olimpiadaLoading) return <Loading />;

  if (loading) return <Loading />;
  if (openFormResponsable)
    return (
      <FormResponsable
        onClose={() => {
          setOpenFormResponsable(false);
        }}
      />
    );
  if (!olimpiada) return <NotFoundPage />;
  console.log(olimpiada);
  if (!olimpiada.fase?.fase.nombre_fase.includes("inscripción")) {
    return <OlimpiadaNoEnCurso olimpiada={olimpiada} />;
  }
  return (
    <div className="flex flex-col min-h-screen items-center">
      <Header />
      <div className="flex flex-col items-center justify-center w-full p-4 max-w-6xl">
        <div className=" w-full">
          <ReturnComponent to="/" />
        </div>

        <h2 className="text-3xl font-bold text-center">
          Bienvenido a la Olimpiada {olimpiada?.nombre}
        </h2>

        <div className="w-full p-4  mx-auto my-auto gap-3 flex flex-col">
          <ButtonsGrid buttons={buttons}>
            <InscribirPostulante olimpiada={olimpiada} />
            <InscribirExcel
              olimpiada={olimpiada}
              onSubmit={() => fetchData()}
            />
          </ButtonsGrid>
        </div>
        <ShareUrl />
      </div>
      <Pasos />
      <Footer />
    </div>
  );
};

export default Page;
