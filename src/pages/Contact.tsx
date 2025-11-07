import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Mensaje enviado correctamente. Te contactaremos pronto.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      subject: "",
      message: ""
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "comercial@talentcloudsolution.es",
      href: "mailto:comercial@talentcloudsolution.es"
    },
    {
      icon: Phone,
      title: "Teléfono",
      value: "+34 665 673 416",
      href: "tel:+34665673416"
    },
    {
      icon: MapPin,
      title: "Ubicación",
      value: "Talavera de la Reina, Toledo",
      href: null
    },
    {
      icon: Clock,
      title: "Horario",
      value: "Lun-Vie: 9:00-18:00",
      href: null
    }
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4">Contáctanos</Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Estamos Aquí para{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Ayudarte
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              ¿Tienes preguntas? ¿Necesitas más información? Nuestro equipo está listo para atenderte
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">{info.title}</h3>
                    {info.href ? (
                      <a 
                        href={info.href} 
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-muted-foreground">{info.value}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>Envíanos un Mensaje</CardTitle>
                <CardDescription>
                  Completa el formulario y te responderemos lo antes posible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa/Centro</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto *</Label>
                    <Select 
                      required
                      value={formData.subject}
                      onValueChange={(value) => setFormData({ ...formData, subject: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un asunto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="demo">Solicitar Demo</SelectItem>
                        <SelectItem value="pricing">Información de Precios</SelectItem>
                        <SelectItem value="technical">Consulta Técnica</SelectItem>
                        <SelectItem value="support">Soporte</SelectItem>
                        <SelectItem value="partnership">Colaboración/Partnership</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje *</Label>
                    <Textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Cuéntanos en qué podemos ayudarte..."
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>¿Prefieres Hablar Directamente?</CardTitle>
                  <CardDescription>
                    Llámanos o envíanos un email. Estamos encantados de atenderte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Teléfono de Contacto</p>
                      <a href="tel:+34665673416" className="text-muted-foreground hover:text-primary">
                        +34 665 673 416
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">
                        Lunes a Viernes, 9:00 - 18:00
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold mb-1">Email Comercial</p>
                      <a 
                        href="mailto:comercial@talentcloudsolution.es" 
                        className="text-muted-foreground hover:text-primary break-all"
                      >
                        comercial@talentcloudsolution.es
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">
                        Respuesta en menos de 24 horas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Oficinas</CardTitle>
                  <CardDescription>
                    Visítanos en nuestras instalaciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold mb-1">TalentCloud Solution</p>
                      <p className="text-muted-foreground">
                        Talavera de la Reina<br />
                        Toledo, España
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Solicita cita previa para visitarnos
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-none">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">¿Necesitas Soporte Técnico?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Si ya eres cliente y necesitas ayuda técnica, accede a nuestro centro de soporte
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/support">Ir a Soporte</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
