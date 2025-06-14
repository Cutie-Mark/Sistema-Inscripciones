import { useEffect, useState } from "react";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { getInscritosPorLista, postDataPostulante } from "@/models/api/postulantes";

import Loading from "@/components/Loading";
import NotFoundPage from "@/views/404";
import ReturnComponent from "@/components/ReturnComponent";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cambiarEstadoLista } from "@/models/api/listas";
import type { Postulante } from "../../../../../models/interfaces/columns";
import DialogPostulante from "@/components/DialogPostulante";
import type { postulanteSchema } from "@/components/FormPostulante";
import type { z } from "zod";

export default function Page() {
    const navigate = useNavigate();
    const [data, setData] = useState<Postulante[]>([]);
    const { ci, codigo, olimpiada_id } = useParams();
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editar, setEditar] = useState(false);
    useEffect(() => {
        fetchData();
    }, []);
    if (!codigo) return;
    const refresh = async () => {
        const data = await getInscritosPorLista(codigo);
        setData(data.data);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getInscritosPorLista(codigo);
            setData(data.data);
            console.log(data.estado, data.estado !== "Preinscrito");
            setEditar(data.estado === "Preinscrito");
            setNotFound(false);
        } catch {
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    const terminarRegistro = async () => {
        console.log("terminando registro");
        try {
            await cambiarEstadoLista(codigo, "Pago Pendiente");
            navigate(`/inscribir/${olimpiada_id}/${ci}`);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unexpected error occurred");
            }
        }
    };

    const onSubmit = async (data: z.infer<typeof postulanteSchema>) => {
        if (loading) return;
        setLoading(true);
        try {
            await postDataPostulante({ ...data, codigo_lista: codigo });
            toast.success("El postulante fue registrado exitosamente");
            //setShowForm(false);
            refresh();
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : "Hubo un error desconocido"
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;
    if (notFound) return <NotFoundPage />;

    return (
        <>
            <ReturnComponent />
            <div className="min-h-screen py-5">
                <div className="container mx-auto ">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-center">
                                Inscripciones de Postulantes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto space-y-5">
                            <div className="flex justify-between">
                                {editar && (
                                    <DialogPostulante
                                        onSubmit={onSubmit}
                                        getParams
                                    />
                                )}

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        {editar && data.length > 0 && (
                                            <Button>Finalizar registro</Button>
                                        )}
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Esta seguro que deseas finalizar
                                                el registro?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta accion impedira el registro
                                                de nuevos postulantes a la inscripcion
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={terminarRegistro}
                                            >
                                                Continuar
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            <Table>
                                {data.length === 0 && (
                                    <TableCaption>
                                        No existen postulantes registrados a
                                        esta inscripcion
                                    </TableCaption>
                                )}

                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombres</TableHead>
                                        <TableHead>Apellidos</TableHead>
                                        <TableHead>CI</TableHead>
                                        <TableHead>Area</TableHead>
                                        <TableHead>Categoria</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.map((inscripcion) => (
                                        <TableRow key={inscripcion.id}>
                                            <TableCell>
                                                {inscripcion.nombres}
                                            </TableCell>
                                            <TableCell>
                                                {inscripcion.apellidos}
                                            </TableCell>
                                            <TableCell>
                                                {inscripcion.ci}
                                            </TableCell>
                                            <TableCell>
                                                {inscripcion.area}
                                            </TableCell>
                                            <TableCell>
                                                {inscripcion.categoria}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
