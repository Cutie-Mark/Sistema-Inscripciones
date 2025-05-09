import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { generarExcel } from "@/utils/excel";

import { DownloadCloud, FileSpreadsheet, Info } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

const Page = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const {olimpiada_id} = useParams()
    const handleDownload = async () => {
        setLoading(true);
        try {
            if(olimpiada_id){

                await generarExcel(olimpiada_id);
            }else{
                console.error("no existe la olimpiada")
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen  p-6">
            <Card className="w-full max-w-lg shadow-xl hover:shadow-2xl transition-shadow duration-300 animate-fade-in-up">
                <CardHeader className="">
                    <div className="flex items-center space-x-3">
                        <div className="p-2  rounded-lg">
                            <FileSpreadsheet className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                Plantilla de Inscripción
                            </CardTitle>
                            <CardDescription className="mt-1 text-gray-600">
                                Descarga una plantilla de Excel con validaciones
                                integradas y formatos profesionales.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="py-6">
                    <Button
                        onClick={handleDownload}
                        className="w-full group relative transition-all duration-300 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-emerald-200"
                        disabled={loading}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            {loading ? (
                                <>
                                    <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                                    <span>Generando plantilla...</span>
                                </>
                            ) : (
                                <>
                                    <DownloadCloud className="w-5 h-5 transition-transform group-hover:translate-y-0.5" />
                                    <span>Descargar Plantilla</span>
                                    <div className="absolute group-hover:opacity-20 transition-opacity" />
                                </>
                            )}
                        </div>
                    </Button>

                    <div className="mt-4 text-sm text-foreground/50 flex items-center space-x-2">
                        <Info className="w-4 h-4 text-foreground/40" />
                        <span>
                            El archivo incluye validaciones y formato
                            condicional
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
export default Page;
