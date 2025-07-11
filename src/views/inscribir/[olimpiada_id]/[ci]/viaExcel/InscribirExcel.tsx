"use client";
import { useState, useEffect } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { API_URL } from "@/viewModels/hooks/useApiRequest";
import {
  CategoriaExtendida,
  UploadResponse,
  type newExcelPostulante,
  type newPostulante,
} from "@/models/interfaces/postulantes";
import { ValidationError, ErroresDeFormato } from "@/models/interfaces/errores";
import { ErrorCheckboxRow } from "@/components/ErrorCheckboxRow";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import LoadingAlert from "@/components/loading-alert";
import { useParams } from "react-router-dom";
import { Olimpiada } from "@/models/interfaces/versiones";
import { ExcelParser } from "@/viewModels/lib/ExcelParser";
import { useNavigate } from "react-router-dom";
import { useUbicacion } from "@/viewModels/context/UbicacionContext";
import { useCategorias } from "@/viewModels/context/CategoriasContext";
import { newValidarFila } from "@/viewModels/usarVistaModelo/inscribir/excel/validations";
import { lazy, Suspense } from 'react';
import StepIndicator from "@/components/StepIndicator";

const DescargarPlantilla = lazy(() => import("../../../../../components/DescargarPlantilla"));

import StepOne from "./pasoUno";
import StepTwo from "./pasoDos";
interface FileUploadModalProps {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  onFilesChange?: (files: File[]) => void;
  triggerText?: string;
  title?: string;
  description?: string;
  olimpiada: Olimpiada;
  onSubmit?: () => void;
}

export const IncribirExcel = ({
  maxFiles = 1,
  maxSize = 10,
  accept = ".xlsx,.xls",
  onFilesChange,
  triggerText = "Inscribir por Excel",
  title = "Añadir archivo excel",
  description = "Selecciona un archivo de Excel de tu dispositivo o arrástralo y suéltalo aquí.",
  olimpiada,
  onSubmit = () => { },
}: FileUploadModalProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { ci, codigo, codigo_lista } = useParams();
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState<ValidationError[]>([]);
  const [erroresDeFormatoExcel, setErroresDeFormatoExcel] = useState<
    ErroresDeFormato[]
  >([]);

  const [cargandoCategorias, setCargandoCategorias] = useState(false);
  const [areasCategorias, setAreasCategorias] = useState<
    Map<string, CategoriaExtendida[]>
  >(new Map());

  const { departamentos, provincias, colegios, fetchUbicaciones } =
    useUbicacion();
  const { getAreasCategoriasPorOlimpiada } = useCategorias();

  const [postulantesExtraidos, setPostulantesExtraidos] = useState<
    newPostulante[]
  >([]);

  const navigate = useNavigate();

  // Función para reiniciar todo el estado
  const resetState = () => {
    setFiles([]);
    setCurrentStep(1);
    setErrores([]);
    setErroresDeFormatoExcel([]);
    setPostulantesExtraidos([]);
    setAreasCategorias(new Map());
  };

  // Función para ir al paso anterior
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 2) {
        setPostulantesExtraidos([]);
      }
    }
  };

  useEffect(() => {
    if (!loading && open) {
      setCargandoCategorias(true);
      const fetchData = async () => {
        try {
          await fetchUbicaciones();
          const areasMap = await getAreasCategoriasPorOlimpiada(
            Number(olimpiada.id)
          );
          setAreasCategorias(areasMap);
        } catch (error) {
          console.error("Error al cargar datos de validación:", error);
        } finally {
          setCargandoCategorias(false);
        }
      };

      fetchData();
    }
  }, [
    loading,
    open,
    olimpiada.id,
    getAreasCategoriasPorOlimpiada,
    fetchUbicaciones,
  ]);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    if (onFilesChange) {
      onFilesChange(newFiles);
    }
  };

  const newHandleProcesar = async () => {
    if (files.length === 0) return;

    const selectedFile = files[0];
    setLoading(true);

    try {
      const { jsonData, erroresDeFormato: formatoErrors } = await ExcelParser(
        selectedFile
      );
      setErroresDeFormatoExcel(formatoErrors);
      if (formatoErrors.length > 0) {
        setLoading(false);
        return;
      }

      let encontroFilaVacia = false;
      const postulantesData: newExcelPostulante[] = jsonData[0]
        .slice(1)
        .filter((fila) => {
          if (encontroFilaVacia) return false;

          const filaVacia = fila.every(
            (campo) =>
              campo === null ||
              (typeof campo === "string" && campo.trim() === "")
          );

          if (filaVacia) {
            encontroFilaVacia = true;
            return false;
          }

          return true;
        })
        .map((fila) => {
          let inscripciones: string[] = [];
          for (let index = 13; index < fila.length; index++) {
            inscripciones = [
              ...inscripciones,
              fila[index]?.toString().trim() || "",
            ];
          }

          return {
            nombres: fila[0]?.toString().trim() || "",
            apellidos: fila[1]?.toString().trim() || "",
            ci: fila[2]?.toString().trim() || "",
            fecha_nacimiento: fila[3]?.toString().trim() || "",
            correo_electronico: fila[4]?.toString().trim() || "",
            departamento: fila[5]?.toString().trim() || "",
            provincia: fila[6]?.toString().trim() || "",
            colegio: fila[7]?.toString().trim() || "",
            grado: fila[8]?.toString().trim() || "",
            telefono_referencia: fila[9]?.toString().trim() || "",
            telefono_pertenece_a: fila[10]?.toString().trim() || "",
            correo_referencia: fila[11]?.toString().trim() || "",
            correo_pertenece_a: fila[12]?.toString().trim() || "",
            inscripciones: [
              ...new Set(inscripciones.filter((inscripcion) => inscripcion)),
            ],
          };
        });

      if (postulantesData.length === 0) {
        throw new Error("No hay postulantes en el archivo");
      }

      const todosErrores: ValidationError[] = [];
      const postulantesConvertidos: newPostulante[] = [];
      postulantesData.forEach((fila, index) => {
        const erroresFila = newValidarFila(
          fila,
          index + 2,
          departamentos,
          provincias,
          colegios,
          areasCategorias,
          postulantesConvertidos
        );
        todosErrores.push(...erroresFila);
      });
      console.log("postulantes convertidos", postulantesConvertidos);
      console.log("errores", todosErrores);

      setErrores(todosErrores);
      setLoading(false);
      if (todosErrores.length > 0) return;
      setPostulantesExtraidos(postulantesConvertidos);
      setCurrentStep(2); // Avanzar al paso 2
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Error al procesar el archivo, " + error.message);
      } else {
        toast.error("Error al procesar el archivo, " + error);
      }
    } finally {
      setLoading(false);
    }
    if (errores.length > 0 || erroresDeFormatoExcel.length > 0) return;
  };

  function generarSufijo() {
    return Math.random().toString(36).substring(2, 10);
  }
  const inscribirPostulantes = async (postulantes: newPostulante[]) => {
    if (errores.length > 0) return;

    try {
      setLoading(true);
      const nombreLista = `excel${generarSufijo()}`;
      const payload = {
        ci: ci,
        nombre_lista: nombreLista,
        codigo_lista: codigo_lista || codigo,
        olimpiada_id: olimpiada.id,
        listaPostulantes: postulantes,
      };
      console.log("payload", payload);
      await axios.post<UploadResponse>(
        `${API_URL}/api/inscripciones/bulk`,
        payload
      );
      toast.success("Postulantes registrados exitosamente");
      onSubmit();
      setOpen(false);
      resetState();
      if (codigo || codigo_lista) {
        navigate(`./${codigo || codigo_lista}`);
      }
    } catch (err: unknown) {
      console.log("Aqui", err);
      let errorMessage = "Error al procesar el archivo.";
      if (err instanceof AxiosError) {
        errorMessage = err.response?.data.mensaje;
        setLoading(false);
        setErrores(
          err.response?.data.errores.map((error: string) => {
            //error en inscripciones de la fila 1 del estudiante con CI 13530843: Área o categoría duplicada (área: GEOGRAFIA, categoría: Quinto Nivel)
            const errorDividido = error.split(" ");
            const campo = "Error";
            const ci = errorDividido[11];
            const fila = errorDividido[6];
            const mensaje = error.substring(error.indexOf(":") + 1).trim();
            return { campo, ci, fila, mensaje };
          })
        );
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = "Error Desconocido al procesar el archivo";
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetState();
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          resetState();
        }
      }} >
        <DialogTrigger asChild>
          <Button
            className={`h-auto p-10 text-white flex bg-emerald-600 hover:bg-emerald-700 flex-col items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg`}
          >
            <FileSpreadsheet className="size-8 mb-1" />{" "}
            <p className="font-bolt text-lg">
              {triggerText || "Inscribir por Excel"}
            </p>
          </Button>
        </DialogTrigger>
        <DialogContent className={`max-h-[94vh] 
          ${currentStep==1?"sm:max-w-[500px] md:max-w-[600px]":"sm:max-w-[600px] md:max-w-[1200px]"}`}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {title}
            </DialogTitle>
            <StepIndicator currentStep={currentStep-1} steps={["Subir Archivo", "Revisar Datos"]} />
          </DialogHeader>
          <div className="">
            {cargandoCategorias && (
              <LoadingAlert message="Espere por favor, estamos cargando categorías y áreas..." />
            )}

            {!cargandoCategorias && (
              <>
                {currentStep === 1 && (
                  <>
                    <DialogDescription className="">
                      <p className="text-muted-foreground">{description}</p>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="font-medium text-sm">
                          Para empezar, descarga la plantilla oficial:
                        </p>
                        <div className="flex items-center justify-center">
                          <Suspense fallback={<div>Cargando plantilla...</div>}>
                            <DescargarPlantilla olimpiada={olimpiada} />
                          </Suspense>
                        </div>
                      </div>
                    </DialogDescription>
                    <StepOne
                      files={files}
                      maxFiles={maxFiles}
                      maxSize={maxSize}
                      accept={accept}
                      onFilesChange={handleFilesChange}
                      filesRefresh={files}
                      handleCancel={handleCancel}
                      newHandleProcesar={newHandleProcesar}
                    />
                  </>
                )}
                {currentStep === 2 && (
                  <StepTwo
                    postulantesExtraidos={postulantesExtraidos}
                    inscribirPostulantes={inscribirPostulantes}
                    onBack={goToPreviousStep}
                  />
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={loading}>
        <DialogContent className="h-auto gap-2">
          <DialogHeader>
            <DialogTitle>Cargando</DialogTitle>
            <DialogDescription>
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog
        open={errores.length > 0 || erroresDeFormatoExcel.length > 0}
        onOpenChange={(open) => {
          if (!open) {
            setErrores([]);
            setErroresDeFormatoExcel([]);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Errores de formato</DialogTitle>
            <div className="">
              <p className="text-sm pb-4 text-foreground/70">
                Se encontraron los siguientes errores en el archivo.
              </p>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {erroresDeFormatoExcel.map((error, index) => (
                  <ErrorCheckboxRow key={index}>
                    El campo{" "}
                    <span className="text-red-500">{error.columna}</span> en la
                    fila {error.fila} en la hoja {error.hoja} tiene el siguiente
                    error: {error.mensaje}
                  </ErrorCheckboxRow>
                ))}
                {Object.entries(
                  errores.reduce((acc, error) => {
                    const key = `${error.ci}-${error.fila}`;
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(error);
                    return acc;
                  }, {} as Record<string, (typeof errores)[0][]>)
                ).map(([key, erroresGrupo]) => {
                  const [ci, fila] = key.split("-");
                  return (
                    <div key={key} className="mb-3">
                      <div className="font-semibold text-orange-500">
                        Fila {fila} - CI {ci}
                      </div>
                      <ul className="ml-4 list-disc">
                        {erroresGrupo.map((error, index) => (
                          <li key={index} className="text-foreground">
                            {error.campo}:{" "}
                            <span className="text-red-500">
                              {error.mensaje}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              onClick={() => {
                setErrores([]);
                setErroresDeFormatoExcel([]);
              }}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default IncribirExcel;
