"use client";

import FileUpload from "@/components/fileUpload";
import { Button } from "@/components/ui/button";
import {
  DialogFooter,
} from "@/components/ui/dialog";
import { HoverCard, HoverCardTrigger } from "@radix-ui/react-hover-card";
import { HoverCardContent } from "@/components/ui/hoverCard";

interface StepOneProps {
  files: File[];
  maxFiles: number;
  maxSize: number;
  accept: string;
  onFilesChange: (files: File[]) => void;
  filesRefresh: File[];
  handleCancel: () => void;
  newHandleProcesar: () => Promise<void>;
}

const StepOne = ({ files, maxFiles, maxSize, accept, onFilesChange, filesRefresh, handleCancel, newHandleProcesar }: StepOneProps) => {
  return (
    <>
      <FileUpload
        key={files[0]?.name}
        maxFiles={maxFiles}
        maxSize={maxSize}
        accept={accept}
        onFilesChange={onFilesChange}
        filesRefresh={filesRefresh}
      />
      <DialogFooter className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" onClick={() => handleCancel()}>
          Cancelar
        </Button>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              disabled={files.length === 0 || files.length > maxFiles}
              onClick={newHandleProcesar}
            >
              Procesar
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className=" p-2">
            <p className="text-sm text-zinc-500">
              No se ha seleccionado ningun archivo
            </p>
          </HoverCardContent>
        </HoverCard>
      </DialogFooter>
    </>
  );
};

export default StepOne;
