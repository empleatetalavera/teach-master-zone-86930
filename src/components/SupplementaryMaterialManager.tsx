import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Link2, Download, Trash2, ExternalLink, Upload, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SupplementaryMaterial {
  id: string;
  formative_unit_id: string;
  title: string;
  description: string | null;
  material_type: 'document' | 'link';
  file_url: string | null;
  external_url: string | null;
  created_at: string;
  uploaded_by: string | null;
}

interface SupplementaryMaterialManagerProps {
  unitId: string;
  unitTitle: string;
  canEdit: boolean;
}

export const SupplementaryMaterialManager = ({ 
  unitId, 
  unitTitle, 
  canEdit 
}: SupplementaryMaterialManagerProps) => {
  // Store materials in local state (database table not yet created)
  const [materials, setMaterials] = useState<SupplementaryMaterial[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    material_type: 'document' as 'document' | 'link',
    external_url: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('El archivo no puede superar los 50MB');
        return;
      }
      setSelectedFile(file);
      if (!newMaterial.title) {
        setNewMaterial(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, '') }));
      }
    }
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.title.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    if (newMaterial.material_type === 'link' && !newMaterial.external_url.trim()) {
      toast.error('La URL es obligatoria para enlaces');
      return;
    }

    if (newMaterial.material_type === 'document' && !selectedFile) {
      toast.error('Debe seleccionar un archivo');
      return;
    }

    setUploading(true);

    try {
      // For now, store locally (database table will be created later)
      const newMaterialData: SupplementaryMaterial = {
        id: crypto.randomUUID(),
        formative_unit_id: unitId,
        title: newMaterial.title,
        description: newMaterial.description || null,
        material_type: newMaterial.material_type,
        file_url: selectedFile ? URL.createObjectURL(selectedFile) : null,
        external_url: newMaterial.material_type === 'link' ? newMaterial.external_url : null,
        created_at: new Date().toISOString(),
        uploaded_by: null
      };

      setMaterials(prev => [newMaterialData, ...prev]);
      toast.success('Material añadido correctamente');
      setDialogOpen(false);
      setNewMaterial({ title: '', description: '', material_type: 'document', external_url: '' });
      setSelectedFile(null);
    } catch (error: any) {
      console.error('Error adding material:', error);
      toast.error('Error al añadir el material');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (material: SupplementaryMaterial) => {
    if (!confirm('¿Está seguro de eliminar este material?')) return;

    try {
      setMaterials(prev => prev.filter(m => m.id !== material.id));
      toast.success('Material eliminado');
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Error al eliminar el material');
    }
  };

  return (
    <div className="flex items-start gap-3 mt-4 pt-4 border-t border-dashed">
      <div className="p-2 bg-purple-100 rounded">
        <FileText className="h-5 w-5 text-purple-600" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h5 className="font-semibold text-foreground">Material Didáctico Complementario</h5>
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              {materials.length} recurso{materials.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          {canEdit && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                  <Plus className="h-3 w-3" />
                  Añadir
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background border shadow-lg">
                <DialogHeader>
                  <DialogTitle>Añadir Material Complementario</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Tipo de material</Label>
                    <Select 
                      value={newMaterial.material_type} 
                      onValueChange={(val: 'document' | 'link') => setNewMaterial(prev => ({ ...prev, material_type: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg">
                        <SelectItem value="document">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Documento
                          </div>
                        </SelectItem>
                        <SelectItem value="link">
                          <div className="flex items-center gap-2">
                            <Link2 className="h-4 w-4" />
                            Enlace web
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Título *</Label>
                    <Input 
                      value={newMaterial.title}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Nombre del material"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción (opcional)</Label>
                    <Textarea 
                      value={newMaterial.description}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Breve descripción del material"
                      rows={2}
                    />
                  </div>

                  {newMaterial.material_type === 'document' ? (
                    <div className="space-y-2">
                      <Label>Archivo *</Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                        onChange={handleFileSelect}
                      />
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                      >
                        {selectedFile ? (
                          <div className="flex items-center justify-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">{selectedFile.name}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Click para seleccionar archivo
                            </span>
                            <span className="text-xs text-muted-foreground">
                              PDF, Word, Excel, PowerPoint (máx. 50MB)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>URL del enlace *</Label>
                      <Input 
                        value={newMaterial.external_url}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, external_url: e.target.value }))}
                        placeholder="https://ejemplo.com/recurso"
                        type="url"
                      />
                    </div>
                  )}

                  <Button 
                    onClick={handleAddMaterial} 
                    className="w-full"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir Material
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Description notice */}
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 mb-3">
          <p className="text-xs text-purple-800">
            En este apartado se incluye material didáctico complementario que sirva de <strong>refuerzo y ampliación de conocimientos</strong> para el alumno en cada unidad didáctica. En concreto, este material puede adoptar los siguientes formatos:
          </p>
          <p className="text-xs text-purple-700 mt-2 italic">
            Encontrarás archivos de documentos de texto o enlaces webs a documentos que servirán al alumno de ampliación y refuerzo del temario.
          </p>
        </div>

        {/* Materials list */}
        {materials.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No hay materiales complementarios disponibles para esta unidad.
          </p>
        ) : (
          <div className="space-y-2">
            {materials.map((material) => (
              <div 
                key={material.id} 
                className="flex items-center justify-between p-3 bg-purple-50/50 border border-purple-100 rounded-lg hover:bg-purple-100/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {material.material_type === 'document' ? (
                    <FileText className="h-4 w-4 text-purple-600" />
                  ) : (
                    <Link2 className="h-4 w-4 text-blue-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{material.title}</p>
                    {material.description && (
                      <p className="text-xs text-muted-foreground">{material.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {material.material_type === 'document' && material.file_url && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7"
                      onClick={() => window.open(material.file_url!, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  {material.material_type === 'link' && material.external_url && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7"
                      onClick={() => window.open(material.external_url!, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  {canEdit && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteMaterial(material)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
