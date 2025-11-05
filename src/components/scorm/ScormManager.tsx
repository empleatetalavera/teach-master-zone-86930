import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileArchive, 
  MoreVertical, 
  Link as LinkIcon, 
  Trash2, 
  Calendar,
  User,
  HardDrive,
  Tag
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export default function ScormManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [moduleId, setModuleId] = useState("");

  // Fetch SCORM packages
  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["scorm-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scorm_packages")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Get uploader names separately
      const packagesWithNames = await Promise.all(
        data.map(async (pkg) => {
          if (pkg.uploaded_by) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", pkg.uploaded_by)
              .single();
            
            return { ...pkg, uploader_name: profile?.full_name || "Usuario" };
          }
          return { ...pkg, uploader_name: "Sistema" };
        })
      );
      
      return packagesWithNames;
    }
  });

  // Fetch courses for linking
  const { data: courses = [] } = useQuery({
    queryKey: ["courses-for-scorm"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, modules(id, title, order_index)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Link SCORM to module mutation
  const linkToModuleMutation = useMutation({
    mutationFn: async ({ packageId, moduleId }: { packageId: string; moduleId: string }) => {
      // Get the max order_index for this module
      const { data: existing } = await supabase
        .from("module_scorm_content")
        .select("order_index")
        .eq("module_id", moduleId)
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrder = existing && existing.length > 0 ? existing[0].order_index + 1 : 1;

      const { error } = await supabase
        .from("module_scorm_content")
        .insert({
          module_id: moduleId,
          scorm_package_id: packageId,
          order_index: nextOrder,
          is_required: true
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "SCORM vinculado",
        description: "El paquete se ha vinculado al módulo correctamente",
      });
      setLinkDialogOpen(false);
      setSelectedPackage(null);
      setModuleId("");
    },
    onError: (error: any) => {
      toast({
        title: "Error al vincular",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete SCORM mutation
  const deleteScormMutation = useMutation({
    mutationFn: async (packageId: string) => {
      // Get file path
      const { data: pkg } = await supabase
        .from("scorm_packages")
        .select("file_path")
        .eq("id", packageId)
        .single();

      if (!pkg) throw new Error("Package not found");

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("scorm-packages")
        .remove([pkg.file_path]);

      if (storageError) throw storageError;

      // Delete from database (cascade will handle linked records)
      const { error: dbError } = await supabase
        .from("scorm_packages")
        .delete()
        .eq("id", packageId);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast({
        title: "Paquete eliminado",
        description: "El paquete SCORM ha sido eliminado",
      });
      queryClient.invalidateQueries({ queryKey: ["scorm-packages"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleLinkToModule = (pkg: any) => {
    setSelectedPackage(pkg);
    setLinkDialogOpen(true);
  };

  const handleConfirmLink = () => {
    if (!selectedPackage || !moduleId) return;
    linkToModuleMutation.mutate({
      packageId: selectedPackage.id,
      moduleId
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Cargando paquetes SCORM...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileArchive className="h-5 w-5" />
            Paquetes SCORM Subidos
          </CardTitle>
          <CardDescription>
            Gestiona y vincula contenido SCORM a los módulos de tus cursos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {packages.length === 0 ? (
            <div className="text-center py-12">
              <FileArchive className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-2">No hay paquetes SCORM</p>
              <p className="text-sm text-muted-foreground">
                Sube tu primer paquete usando el formulario de arriba
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Versión</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Subido por</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{pkg.title}</p>
                        {pkg.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {pkg.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <Tag className="mr-1 h-3 w-3" />
                        SCORM {pkg.scorm_version}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <HardDrive className="h-3 w-3" />
                        {(pkg.file_size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {pkg.uploader_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(pkg.created_at), "dd/MM/yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleLinkToModule(pkg)}>
                            <LinkIcon className="mr-2 h-4 w-4" />
                            Vincular a módulo
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteScormMutation.mutate(pkg.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Link to Module Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular SCORM a Módulo</DialogTitle>
            <DialogDescription>
              Selecciona el módulo donde quieres incluir este contenido SCORM
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Paquete SCORM</Label>
              <Input value={selectedPackage?.title || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="module-select">Módulo del curso *</Label>
              <Select value={moduleId} onValueChange={setModuleId}>
                <SelectTrigger id="module-select">
                  <SelectValue placeholder="Selecciona un módulo" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <div key={course.id}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                        {course.title}
                      </div>
                      {course.modules?.map((module: any) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.order_index}. {module.title}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setLinkDialogOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmLink}
              disabled={!moduleId || linkToModuleMutation.isPending}
              className="flex-1"
            >
              {linkToModuleMutation.isPending ? "Vinculando..." : "Vincular"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}