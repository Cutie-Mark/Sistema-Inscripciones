import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { request } from "@/models/api/request";
import type { Area, Categoria } from "@/models/api/areas";
import { useParams } from "react-router-dom";
import type { Olimpiada } from "@/models/interfaces/versiones.type";
import { getOlimpiada } from "@/models/api/olimpiada";
import OlimpiadaNoEnCurso from "@/components/OlimpiadaNoEnCurso";
import ReturnComponent from "@/components/ReturnComponent";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Plus } from "lucide-react";

export default function Page() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [initialChecked, setInitialChecked] = useState<number[]>([]);

  const [searchArea, setSearchArea] = useState("");
  const [searchCategory, setSearchCategory] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const { olimpiada_id } = useParams();
  const [olimpiada, setOlimpiada] = useState<Olimpiada>();

  useEffect(() => {
    loadData();
    fetchOlimpiada();
  }, []);
  if (!olimpiada_id) return;

  const fetchOlimpiada = async () => {
    const olimpiada = await getOlimpiada(olimpiada_id);
    setOlimpiada(olimpiada);
  };
  const loadData = async () => {
    try {
      const [areasData, catsData] = await Promise.all([
        request<Area[]>(`/api/areas/categorias/olimpiada/${olimpiada_id}`),
        request<Categoria[]>("/api/categorias"),
      ]);

      setAreas(areasData);
      await setCategories(catsData);
      console.log(areasData);
      console.log(catsData);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al cargar datos");
    }
  };

  const openDialog = (area: Area) => {
    setSelectedArea(area);
    console.log(area);
    const ids =
      area.categorias?.filter((v) => v).map((c) => Number(c.id)) || [];
    setInitialChecked(ids);
    setChecked(ids.reduce((acc, id) => ({ ...acc, [id]: true }), {}));
    setSearchCategory("");
    setDialogOpen(true);
  };

  const toggleCategory = (id: number) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    if (!selectedArea) return;
    const selectedIds = Object.entries(checked)
      .filter(([, v]) => v)
      .map(([k]) => Number(k));
    const toAdd = selectedIds.filter((id) => !initialChecked.includes(id));
    const toRemove = initialChecked.filter((id) => !selectedIds.includes(id));
    try {
      await request("/api/categorias/area/olimpiada", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_area: Number(selectedArea.id),
          id_olimpiada: Number(olimpiada_id),
          agregar: toAdd,
          quitar: toRemove,
        }),
      });
      toast.success("Se asociaron las categorías exitosamente");
      setDialogOpen(false);
      loadData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    }
  };

  const filteredAreas = areas.filter((a) =>
    a.nombre.toLowerCase().includes(searchArea.toLowerCase())
  );

  const selectedCount = Object.values(checked).filter(Boolean).length;
  if (
    olimpiada &&
    (olimpiada?.fase?.fase.nombre_fase !== "Preparación" || !olimpiada.fase)
  )
    return (
      <OlimpiadaNoEnCurso
        olimpiada={olimpiada}
        text={"La olimpiada no esta en Fase de Preparación"}
      />
    );
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <ReturnComponent to="/admin/asociarCategorias" />
      <div className="p-6 space-y-6 justify-center items-center  grid">
        <Card className="w-full overflow-x-auto">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle>Áreas</CardTitle>
              <Badge>{filteredAreas.length}</Badge>
            </div>
            <Input
              placeholder="Buscar área..."
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
              className="max-w-xs"
            />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Nombre de Área</TableHead>
                  <TableHead className="max-w-xl">Categorias Asociadas</TableHead>
                  <TableHead className="max-w-xl">Asociar Categorias</TableHead>
                  
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAreas.map((area) => (
                  <TableRow key={area.id}>
                    <TableCell>{area.nombre}</TableCell>
                    <TableCell className="flex flex-wrap w-xl gap-1">
                      {area.categorias?.map((cat) => (
                        <Badge className=" rounded-xl" variant={"secondary"}>
                          {cat.nombre}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell className="w-full">
                      <div className="flex justify-center">
                        <Button size="sm" onClick={() => openDialog(area)}>
                          Asociar <Plus />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} >
                    Total: {filteredAreas.length}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Categorías para {selectedArea?.nombre} (
                <span className="font-semibold">{selectedCount}</span>)
              </DialogTitle>
            </DialogHeader>
            <div className="mb-4 flex items-center space-x-2">
              <Input
                placeholder="Buscar categoría..."
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="flex-1"
              />
              <Badge>{selectedCount} seleccionadas</Badge>
            </div>
            <ScrollArea className="h-80 w-full space-y-2 pr-2">
              <div className="grid grid-cols-2 gap-4">
                {categories
                  .filter((c) =>
                    c.nombre
                      .toLowerCase()
                      .includes(searchCategory.toLowerCase())
                  )
                  .map((cat) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${cat.id}`}
                        checked={!!checked[Number(cat.id)]}
                        onCheckedChange={() => toggleCategory(Number(cat.id))}
                      />
                      <Label htmlFor={`cat-${cat.id}`}>{cat.nombre}</Label>
                    </div>
                  ))}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
}
