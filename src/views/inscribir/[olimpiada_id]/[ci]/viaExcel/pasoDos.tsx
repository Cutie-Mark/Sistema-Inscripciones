"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DialogFooter,
} from "@/components/ui/dialog";
import { HoverCard, HoverCardTrigger } from "@radix-ui/react-hover-card";
import { HoverCardContent } from "@/components/ui/hoverCard";
import { newPostulante } from "@/models/interfaces/postulantes";

interface StepTwoProps {
  postulantesExtraidos: newPostulante[];
  inscribirPostulantes: (postulantes: newPostulante[]) => Promise<void>;
  onBack: () => void;
}

const StepTwo = ({ postulantesExtraidos, inscribirPostulantes, onBack }: StepTwoProps) => {
  return (
    <>
      {postulantesExtraidos.length > 0 && (
        <div className="max-h-4/6 h-4/6">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">
              Se encontraron {postulantesExtraidos.length} postulantes.
            </p>
          </div>
          {/* Después: envolvemos la tabla en un div que controla el scroll */}
          <div className="overflow-auto border max-h-[60vh] max-w-[80vw]">
            <Table className="">
              <TableHeader>
                <TableRow>
                  <TableHead>Nombres</TableHead>
                  <TableHead>Apellidos</TableHead>
                  <TableHead>CI</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Provincia</TableHead>
                  <TableHead>Colegio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {postulantesExtraidos.map((inscripcion) =>
                  inscripcion.nombresAreas.map((area, index) => (
                    <TableRow key={inscripcion.ci + index}>
                      <TableCell>{inscripcion.nombres}</TableCell>
                      <TableCell>{inscripcion.apellidos}</TableCell>
                      <TableCell>{inscripcion.ci}</TableCell>
                      <TableCell>{inscripcion.curso}</TableCell>
                      <TableCell>{area}</TableCell>
                      <TableCell>{inscripcion.nombresCategorias[index]}</TableCell>
                      <TableCell>{inscripcion.departamento}</TableCell>
                      <TableCell>{inscripcion.provincia}</TableCell>
                      <TableCell>{inscripcion.colegio}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Regresar
            </Button>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button
                  onClick={() => inscribirPostulantes(postulantesExtraidos)}
                >
                  Inscribir Postulantes
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className=" p-2">
                <p className="text-sm text-zinc-500">
                  No se ha seleccionado ningun archivo
                </p>
              </HoverCardContent>
            </HoverCard>
          </DialogFooter>
        </div>
      )}
    </>
  );
};

export default StepTwo;
