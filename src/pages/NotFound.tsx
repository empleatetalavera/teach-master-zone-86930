import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, Phone } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-8 px-4">
        <div className="space-y-4">
          <h1 className="text-8xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-semibold text-foreground">Página No Encontrada</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Lo sentimos, no pudimos encontrar la página que buscas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" variant="default">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Ir al Inicio
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/platform">
              <BookOpen className="mr-2 h-4 w-4" />
              Ver Plataforma
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/contact">
              <Phone className="mr-2 h-4 w-4" />
              Contacto
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
