import { Card } from "@/components/ui/card";
import { BookMarked, Award, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const stats = [
  {
    title: "Cursos Activos",
    value: "3",
    icon: BookMarked,
    color: "from-primary to-primary-glow"
  },
  {
    title: "Certificados",
    value: "5",
    icon: Award,
    color: "from-secondary to-secondary"
  },
  {
    title: "Horas Cursadas",
    value: "128",
    icon: Clock,
    color: "from-accent to-accent"
  },
  {
    title: "Progreso Promedio",
    value: "76%",
    icon: TrendingUp,
    color: "from-primary to-secondary"
  }
];

const StudentDashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mi Panel de Estudiante</h1>
        <p className="text-muted-foreground">Continúa tu formación y alcanza tus objetivos</p>
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

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Continúa Donde lo Dejaste</h3>
        <div className="space-y-4">
          {[
            { 
              name: "Marketing Digital Avanzado", 
              module: "Módulo 3: Redes Sociales", 
              progress: 65,
              color: "from-primary to-secondary"
            },
            { 
              name: "Excel para Negocios", 
              module: "Módulo 5: Tablas Dinámicas", 
              progress: 82,
              color: "from-secondary to-accent"
            },
            { 
              name: "Gestión de Proyectos", 
              module: "Módulo 2: Planificación", 
              progress: 45,
              color: "from-accent to-primary"
            },
          ].map((course, i) => (
            <Card key={i} className="p-6 border-border/50 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{course.name}</h4>
                  <p className="text-sm text-muted-foreground">{course.module}</p>
                </div>
                <Button size="sm" variant="outline">Continuar</Button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progreso</span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Próximas Evaluaciones</h3>
          <div className="space-y-3">
            {[
              { exam: "Examen Final Marketing", course: "Marketing Digital", date: "En 2 días" },
              { exam: "Quiz Módulo 5", course: "Excel para Negocios", date: "En 5 días" },
              { exam: "Actividad Práctica", course: "Gestión de Proyectos", date: "En 1 semana" },
            ].map((exam, i) => (
              <div key={i} className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium">{exam.exam}</p>
                  <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">{exam.date}</span>
                </div>
                <p className="text-sm text-muted-foreground">{exam.course}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Mis Certificados</h3>
          <div className="space-y-3">
            {[
              { name: "Fundamentos de Marketing", date: "Completado 12/2024" },
              { name: "Excel Básico", date: "Completado 11/2024" },
              { name: "Comunicación Efectiva", date: "Completado 10/2024" },
            ].map((cert, i) => (
              <div key={i} className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-border/50 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{cert.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{cert.date}</p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Award className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
