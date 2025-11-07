import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Package } from "lucide-react";
import { useState } from "react";

export default function ClientCatalog() {
  const [searchTerm, setSearchTerm] = useState("");

  const courses = [
    { code: "AACC", name: "Altas capacidades: identificación, apoyo y estrategias en educación y salud", family: "Educación y Formación", subfamily: "Educación", duration: 40 },
    { code: "ABSENTISMO", name: "Absentismo laboral: prevención y gestión", family: "Recursos Humanos", subfamily: "Recursos humanos", duration: 15 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Catálogo de cursos</h1>
        <p className="text-muted-foreground mt-2">Explora nuestro catálogo completo de acciones formativas SCORM</p>
      </div>
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar en el catálogo..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Button variant="outline"><Filter className="w-4 h-4 mr-2" />Filtros</Button>
        <Button variant="outline"><Package className="w-4 h-4 mr-2" />Utilización de licencias</Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Familia</TableHead>
              <TableHead>Subfamilia</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.code}>
                <TableCell className="font-medium">{course.code}</TableCell>
                <TableCell>{course.name}</TableCell>
                <TableCell>{course.family}</TableCell>
                <TableCell>{course.subfamily}</TableCell>
                <TableCell><Badge variant="secondary">{course.duration} hrs.</Badge></TableCell>
                <TableCell className="text-right"><Button variant="outline" size="sm">Ver ficha</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
