import { Card } from "@/components/ui/card";
import { BookOpen, Users, ClipboardCheck, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Mis Cursos",
    value: "8",
    icon: BookOpen,
    color: "from-primary to-primary-glow"
  },
  {
    title: "Alumnos Activos",
    value: "234",
    icon: Users,
    color: "from-secondary to-secondary"
  },
  {
    title: "Evaluaciones Pendientes",
    value: "12",
    icon: ClipboardCheck,
    color: "from-accent to-accent"
  },
  {
    title: "Mensajes sin Leer",
    value: "5",
    icon: MessageSquare,
    color: "from-primary to-secondary"
  }
];

const TeacherDashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Docente</h1>
          <p className="text-muted-foreground">Gestiona tus cursos y alumnos</p>
        </div>
        <Button variant="hero">Crear Nuevo Curso</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 border-border/50">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Próximas Clases Virtuales</h3>
          <div className="space-y-4">
            {[
              { course: "Marketing Digital", date: "Hoy, 15:00", students: 28 },
              { course: "Gestión Empresarial", date: "Mañana, 10:00", students: 32 },
              { course: "Excel Avanzado", date: "Vie, 16:00", students: 25 },
            ].map((clase, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div>
                  <p className="font-medium">{clase.course}</p>
                  <p className="text-sm text-muted-foreground">{clase.date} • {clase.students} alumnos</p>
                </div>
                <Button size="sm" variant="outline">Iniciar</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Alumnos Recientes</h3>
          <div className="space-y-4">
            {[
              { name: "Carlos Rodríguez", course: "Marketing Digital", progress: 75 },
              { name: "Laura Sánchez", course: "Excel Avanzado", progress: 92 },
              { name: "Pedro Gómez", course: "Gestión Empresarial", progress: 58 },
              { name: "María Torres", course: "Marketing Digital", progress: 83 },
            ].map((student, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.course}</p>
                  </div>
                  <span className="text-xs font-medium">{student.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-secondary to-accent h-1.5 rounded-full transition-all"
                    style={{ width: `${student.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
