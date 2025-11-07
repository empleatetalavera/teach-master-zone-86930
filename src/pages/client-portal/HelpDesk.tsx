import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Headphones, Mail, Phone, MessageSquare } from "lucide-react";

export default function ClientHelpDesk() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Headphones className="h-8 w-8" />
          Help-Desk
        </h1>
        <p className="text-muted-foreground mt-2">¿Necesitas ayuda? Contacta con nuestro equipo de soporte</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enviar consulta</CardTitle>
            <CardDescription>Describe tu problema o pregunta y te responderemos lo antes posible</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Asunto</Label>
              <Input id="subject" placeholder="¿En qué podemos ayudarte?" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea id="message" placeholder="Describe tu consulta..." rows={6} />
            </div>
            <Button className="w-full">
              <MessageSquare className="w-4 h-4 mr-2" />
              Enviar consulta
            </Button>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de contacto</CardTitle>
              <CardDescription>También puedes contactarnos directamente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <a href="mailto:comercial@talentcloudsolution.es" className="text-sm text-primary hover:underline">
                    comercial@talentcloudsolution.es
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Teléfono</p>
                  <a href="tel:+34665673416" className="text-sm text-primary hover:underline">+34 665 673 416</a>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Preguntas frecuentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild><a href="/support">¿Cómo uso mis licencias?</a></Button>
              <Button variant="outline" className="w-full justify-start" asChild><a href="/support">¿Qué es un pack de horas?</a></Button>
              <Button variant="outline" className="w-full justify-start" asChild><a href="/support">¿Cómo accedo al catálogo?</a></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
