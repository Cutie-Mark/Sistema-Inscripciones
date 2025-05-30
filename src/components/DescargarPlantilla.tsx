import { Download } from "lucide-react";
import  { useState } from "react";
import { Button } from "./ui/button";
import type { Olimpiada } from "@/types/versiones.type";
import { generarExcel } from "@/utils/excel";

const DescargarPlantilla = ({ olimpiada }: { olimpiada: Olimpiada }) => {
    const [loadingExcel, setLoadingExcel] = useState(false);
    const onClick = async () => {
        setLoadingExcel(true);
        await generarExcel(olimpiada.id, olimpiada.nombre);
        setLoadingExcel(false);
    };
    return (
        <>
            <Button
                variant={"link"}
                disabled={loadingExcel}
                className=" mb-2  text-green-600 border-green-200 hover:text-green-500 transition-colors"
                onClick={async (e) => { e.preventDefault(); onClick(); }}
            >
                {loadingExcel ? (
                    <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full" />
                        Descargando...
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Plantilla de Inscripción
                    </div>
                )}
            </Button>
        </>
    );
};

export default DescargarPlantilla;
