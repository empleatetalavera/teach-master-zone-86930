import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Download, 
  Filter, 
  Eye,
  Mail,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockStudents = [
  {
    id: 1,
    name: "Demo Seminario",
    lastName1: "Web",
    lastName2: "",
    dni: "1111111",
    email: "demo@example.com",
    profile: "Alumno",
    company: "CUMLAUDE - DEMO",
    tutor: "TUTOR TUTOR",
    course: "Iniciación a Excel 2016",
    progress: 75,
    lastAccess: "21/10/2020 12:21:33"
  },
  {
    id: 2,
    name: "Tutor",
    lastName1: "Tutor",
    lastName2: "",
    dni: "",
    email: "tutor@example.com",
    profile: "TUTOR/A",
    company: "CUMLAUDE - DEMO",
    tutor: "TUTOR TUTOR",
    course: "Iniciación a Excel 2016",
    progress: 45,
    lastAccess: "20/10/2020 18:30:15"
  },
  {
    id: 3,
    name: "María",
    lastName1: "García",
    lastName2: "López",
    dni: "12345678A",
    email: "maria.garcia@example.com",
    profile: "Alumno",
    company: "CUMLAUDE - DEMO",
    tutor: "TUTOR TUTOR",
    course: "JavaScript Avanzado",
    progress: 92,
    lastAccess: "21/10/2020 09:15:22"
  },
];

export default function TeacherStudents() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    groupCode: "",
    groupName: "",
    name: "",
    lastName1: "",
    lastName2: "",
    dni: "",
    startDate: "",
    endDate: ""
  });

  const handleViewDetail = (studentId: number) => {
    navigate(`/dashboard/teacher/students/${studentId}`);
  };

  const handleExportReport = () => {
    // Mock export functionality
    const blob = new Blob(["Reporte de seguimiento..."], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ReporteSeguimiento.xlsx";
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seguimiento de Alumnos</h1>
          <p className="text-muted-foreground mt-2">
            Monitoriza el progreso y actividad de tus estudiantes
          </p>
        </div>
        <Button onClick={handleExportReport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtra por código de grupo, nombre, apellidos, NIF o fechas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="groupCode">Código del grupo</Label>
              <Input
                id="groupCode"
                placeholder="Ej: excel"
                value={filters.groupCode}
                onChange={(e) => setFilters({ ...filters, groupCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groupName">Nombre grupo</Label>
              <Input
                id="groupName"
                placeholder="Buscar grupo..."
                value={filters.groupName}
                onChange={(e) => setFilters({ ...filters, groupName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Inicio grupo desde</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Inicio grupo hasta</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="dni">NIF</Label>
              <Input
                id="dni"
                placeholder="Número de identificación"
                value={filters.dni}
                onChange={(e) => setFilters({ ...filters, dni: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Nombre del alumno"
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName1">Primer apellido</Label>
              <Input
                id="lastName1"
                placeholder="Primer apellido"
                value={filters.lastName1}
                onChange={(e) => setFilters({ ...filters, lastName1: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button>
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
            <Button variant="outline" onClick={() => setFilters({
              groupCode: "",
              groupName: "",
              name: "",
              lastName1: "",
              lastName2: "",
              dni: "",
              startDate: "",
              endDate: ""
            })}>
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seguimiento colectivo de alumnos</CardTitle>
          <CardDescription>
            {mockStudents.length} estudiantes encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido 1</TableHead>
                  <TableHead>Apellido 2</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.lastName1}</TableCell>
                    <TableCell>{student.lastName2}</TableCell>
                    <TableCell className="text-muted-foreground">{student.dni}</TableCell>
                    <TableCell className="text-muted-foreground">{student.email}</TableCell>
                    <TableCell>
                      <Badge variant={student.profile === "TUTOR/A" ? "secondary" : "default"}>
                        {student.profile}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{student.company}</TableCell>
                    <TableCell className="text-muted-foreground">{student.tutor}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[100px] bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground min-w-[40px]">
                          {student.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewDetail(student.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
