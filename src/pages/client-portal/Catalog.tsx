import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Package, BookOpen, Award } from "lucide-react";
import { useState } from "react";

export default function ClientCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFamily, setSelectedFamily] = useState<string>("all");

  const professionalFamilies = [
    "Todas las familias",
    "Administración y Gestión",
    "Agraria",
    "Artes Gráficas",
    "Comercio y Marketing",
    "Edificación y Obra Civil",
    "Electricidad y Electrónica",
    "Energía y Agua",
    "Fabricación Mecánica",
    "Hostelería y Turismo",
    "Imagen Personal",
    "Imagen y Sonido",
    "Industrias Alimentarias",
    "Informática y Comunicaciones",
    "Instalación y Mantenimiento",
    "Madera, Mueble y Corcho",
    "Química",
    "Sanidad",
    "Seguridad y Medio Ambiente",
    "Servicios Socioculturales y a la Comunidad",
    "Textil, Confección y Piel",
    "Transporte y Mantenimiento de Vehículos",
    "Vidrio y Cerámica"
  ];

  const especialidadesFormativas = [
    { code: "ADGD0108", name: "Gestión Contable y Gestión Administrativa para Auditoría", family: "Administración y Gestión", level: 3, duration: 790, type: "Certificado de Profesionalidad" },
    { code: "ADGG0208", name: "Actividades Administrativas en la Relación con el Cliente", family: "Administración y Gestión", level: 2, duration: 610, type: "Certificado de Profesionalidad" },
    { code: "ADGG0408", name: "Operaciones Auxiliares de Servicios Administrativos y Generales", family: "Administración y Gestión", level: 1, duration: 430, type: "Certificado de Profesionalidad" },
    { code: "ADGN0108", name: "Financiación de Empresas", family: "Administración y Gestión", level: 3, duration: 650, type: "Certificado de Profesionalidad" },
    { code: "MF0233_2", name: "Ofimática", family: "Administración y Gestión", level: 2, duration: 190, type: "Especialidad Formativa" },
    { code: "MF0973_1", name: "Grabación de Datos", family: "Administración y Gestión", level: 1, duration: 90, type: "Especialidad Formativa" },
    
    { code: "COMM0110", name: "Marketing y Compraventa Internacional", family: "Comercio y Marketing", level: 3, duration: 780, type: "Certificado de Profesionalidad" },
    { code: "COMM0112", name: "Gestión de Marketing y Comunicación", family: "Comercio y Marketing", level: 3, duration: 710, type: "Certificado de Profesionalidad" },
    { code: "COMT0211", name: "Actividades de Gestión del Pequeño Comercio", family: "Comercio y Marketing", level: 2, duration: 570, type: "Certificado de Profesionalidad" },
    { code: "MF1002_2", name: "Inglés Profesional para Actividades Comerciales", family: "Comercio y Marketing", level: 2, duration: 90, type: "Especialidad Formativa" },
    { code: "MF2185_3", name: "Marketing Digital", family: "Comercio y Marketing", level: 3, duration: 150, type: "Especialidad Formativa" },
    
    { code: "IFCT0110", name: "Operación de Sistemas Informáticos", family: "Informática y Comunicaciones", level: 2, duration: 480, type: "Certificado de Profesionalidad" },
    { code: "IFCT0210", name: "Operación de Redes Departamentales", family: "Informática y Comunicaciones", level: 2, duration: 540, type: "Certificado de Profesionalidad" },
    { code: "IFCT0310", name: "Administración de Bases de Datos", family: "Informática y Comunicaciones", level: 3, duration: 630, type: "Certificado de Profesionalidad" },
    { code: "IFCD0110", name: "Confección y Publicación de Páginas Web", family: "Informática y Comunicaciones", level: 2, duration: 560, type: "Certificado de Profesionalidad" },
    { code: "MF0950_2", name: "Construcción de Páginas Web", family: "Informática y Comunicaciones", level: 2, duration: 210, type: "Especialidad Formativa" },
    { code: "MF0491_3", name: "Programación Web en el Entorno Cliente", family: "Informática y Comunicaciones", level: 3, duration: 180, type: "Especialidad Formativa" },
    
    { code: "SANT0108", name: "Atención Sanitaria a Múltiples Víctimas y Catástrofes", family: "Sanidad", level: 2, duration: 370, type: "Certificado de Profesionalidad" },
    { code: "SANT0208", name: "Transporte Sanitario", family: "Sanidad", level: 2, duration: 380, type: "Certificado de Profesionalidad" },
    { code: "SANP0108", name: "Farmacia", family: "Sanidad", level: 2, duration: 820, type: "Certificado de Profesionalidad" },
    { code: "MF0069_1", name: "Técnicas de Información y Atención al Cliente/Consumidor", family: "Sanidad", level: 1, duration: 90, type: "Especialidad Formativa" },
    
    { code: "SSCG0109", name: "Inserción Laboral de Personas con Discapacidad", family: "Servicios Socioculturales y a la Comunidad", level: 3, duration: 590, type: "Certificado de Profesionalidad" },
    { code: "SSCG0111", name: "Gestión de Llamadas de Teleasistencia", family: "Servicios Socioculturales y a la Comunidad", level: 2, duration: 390, type: "Certificado de Profesionalidad" },
    { code: "SSCS0108", name: "Atención Sociosanitaria a Personas Dependientes en Instituciones Sociales", family: "Servicios Socioculturales y a la Comunidad", level: 2, duration: 450, type: "Certificado de Profesionalidad" },
    { code: "SSCS0208", name: "Atención Sociosanitaria a Personas en el Domicilio", family: "Servicios Socioculturales y a la Comunidad", level: 2, duration: 450, type: "Certificado de Profesionalidad" },
    { code: "MF1017_2", name: "Intervención en la Atención Sociosanitaria en Instituciones", family: "Servicios Socioculturales y a la Comunidad", level: 2, duration: 140, type: "Especialidad Formativa" },
    
    { code: "HOTA0108", name: "Operaciones Básicas de Cocina", family: "Hostelería y Turismo", level: 1, duration: 360, type: "Certificado de Profesionalidad" },
    { code: "HOTG0208", name: "Venta de Productos y Servicios Turísticos", family: "Hostelería y Turismo", level: 3, duration: 560, type: "Certificado de Profesionalidad" },
    { code: "HOTR0208", name: "Operaciones Básicas de Restaurante y Bar", family: "Hostelería y Turismo", level: 1, duration: 410, type: "Certificado de Profesionalidad" },
    { code: "MF1048_2", name: "Preparación y Montaje de Materiales para Colectividades y Catering", family: "Hostelería y Turismo", level: 2, duration: 90, type: "Especialidad Formativa" },
    
    { code: "SEAD0112", name: "Docencia de la Formación Profesional para el Empleo", family: "Servicios Socioculturales y a la Comunidad", level: 3, duration: 380, type: "Certificado de Profesionalidad" },
    { code: "MF1442_3", name: "Programación Didáctica de Acciones Formativas", family: "Servicios Socioculturales y a la Comunidad", level: 3, duration: 60, type: "Especialidad Formativa" },
    { code: "MF1443_3", name: "Selección, Elaboración, Adaptación y Utilización de Materiales, Medios y Recursos Didácticos", family: "Servicios Socioculturales y a la Comunidad", level: 3, duration: 90, type: "Especialidad Formativa" },
    
    { code: "SEAG0108", name: "Gestión de Residuos Urbanos e Industriales", family: "Seguridad y Medio Ambiente", level: 3, duration: 570, type: "Certificado de Profesionalidad" },
    { code: "SEAG0109", name: "Interpretación y Educación Ambiental", family: "Seguridad y Medio Ambiente", level: 3, duration: 570, type: "Certificado de Profesionalidad" },
    { code: "SEAD0312", name: "Prevención de Riesgos Laborales", family: "Seguridad y Medio Ambiente", level: 3, duration: 60, type: "Especialidad Formativa" },
    
    { code: "TMVG0109", name: "Operaciones Auxiliares de Mantenimiento en Electromecánica de Vehículos", family: "Transporte y Mantenimiento de Vehículos", level: 1, duration: 360, type: "Certificado de Profesionalidad" },
    { code: "TMVG0209", name: "Mantenimiento del Motor y sus Sistemas Auxiliares", family: "Transporte y Mantenimiento de Vehículos", level: 2, duration: 640, type: "Certificado de Profesionalidad" },
  ];

  const filteredCourses = especialidadesFormativas.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFamily = selectedFamily === "all" || selectedFamily === "Todas las familias" || course.family === selectedFamily;
    return matchesSearch && matchesFamily;
  });

  const certificadosProfesionalidad = filteredCourses.filter(c => c.type === "Certificado de Profesionalidad");
  const especialidades = filteredCourses.filter(c => c.type === "Especialidad Formativa");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Catálogo SEPE</h1>
        <p className="text-muted-foreground mt-2">Especialidades Formativas y Certificados de Profesionalidad del SEPE</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por código o nombre..." 
            className="pl-10" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <Select value={selectedFamily} onValueChange={setSelectedFamily}>
          <SelectTrigger className="w-full md:w-[300px]">
            <SelectValue placeholder="Filtrar por familia profesional" />
          </SelectTrigger>
          <SelectContent>
            {professionalFamilies.map((family) => (
              <SelectItem key={family} value={family === "Todas las familias" ? "all" : family}>
                {family}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Package className="w-4 h-4 mr-2" />
          Utilización de licencias
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            <BookOpen className="w-4 h-4 mr-2" />
            Todos ({filteredCourses.length})
          </TabsTrigger>
          <TabsTrigger value="certificados">
            <Award className="w-4 h-4 mr-2" />
            Certificados ({certificadosProfesionalidad.length})
          </TabsTrigger>
          <TabsTrigger value="especialidades">
            <BookOpen className="w-4 h-4 mr-2" />
            Especialidades ({especialidades.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Familia Profesional</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No se encontraron resultados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => (
                    <TableRow key={course.code}>
                      <TableCell className="font-medium font-mono text-xs">{course.code}</TableCell>
                      <TableCell className="max-w-md">{course.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{course.family}</TableCell>
                      <TableCell>
                        <Badge variant={course.type === "Certificado de Profesionalidad" ? "default" : "secondary"}>
                          {course.type === "Certificado de Profesionalidad" ? "Certificado" : "Especialidad"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Nivel {course.level}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{course.duration} hrs.</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Ver ficha</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="certificados" className="mt-6">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Familia Profesional</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificadosProfesionalidad.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No se encontraron certificados de profesionalidad
                    </TableCell>
                  </TableRow>
                ) : (
                  certificadosProfesionalidad.map((course) => (
                    <TableRow key={course.code}>
                      <TableCell className="font-medium font-mono text-xs">{course.code}</TableCell>
                      <TableCell className="max-w-md">{course.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{course.family}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Nivel {course.level}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{course.duration} hrs.</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Ver ficha</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="especialidades" className="mt-6">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Familia Profesional</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {especialidades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No se encontraron especialidades formativas
                    </TableCell>
                  </TableRow>
                ) : (
                  especialidades.map((course) => (
                    <TableRow key={course.code}>
                      <TableCell className="font-medium font-mono text-xs">{course.code}</TableCell>
                      <TableCell className="max-w-md">{course.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{course.family}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Nivel {course.level}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{course.duration} hrs.</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Ver ficha</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
