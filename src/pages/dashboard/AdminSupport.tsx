import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageCircle, Clock, CheckCircle, AlertCircle, User } from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  student_id: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface Message {
  id: string;
  message: string;
  user_id: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

const AdminSupport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("student_support_tickets")
        .select(`
          *,
          profiles:student_id (
            full_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets((data as any) || []);
    } catch (error: any) {
      console.error("Error loading tickets:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las consultas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from("student_support_messages")
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `)
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages((data as any) || []);
    } catch (error: any) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setIsSending(true);

    try {
      const { error } = await supabase
        .from("student_support_messages")
        .insert({
          ticket_id: selectedTicket.id,
          user_id: user!.id,
          message: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage("");
      await loadMessages(selectedTicket.id);

      toast({
        title: "Mensaje enviado",
        description: "Tu respuesta ha sido enviada al alumno",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    setIsUpdating(true);

    try {
      const updateData: any = { status: newStatus };
      if (newStatus === "resolved" || newStatus === "closed") {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("student_support_tickets")
        .update(updateData)
        .eq("id", ticketId);

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: `El ticket ha sido marcado como ${newStatus}`,
      });

      await loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Abierto</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500"><MessageCircle className="h-3 w-3 mr-1" />En progreso</Badge>;
      case "resolved":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Resuelto</Badge>;
      case "closed":
        return <Badge variant="outline">Cerrado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgente":
        return <Badge variant="destructive">Urgente</Badge>;
      case "alta":
        return <Badge className="bg-orange-500">Alta</Badge>;
      case "normal":
        return <Badge variant="secondary">Normal</Badge>;
      case "baja":
        return <Badge variant="outline">Baja</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      tecnico: "Técnico",
      academico: "Académico",
      administrativo: "Administrativo",
      otro: "Otro",
    };
    return labels[category] || category;
  };

  const filterTicketsByStatus = (status: string) => {
    return tickets.filter((t) => t.status === status);
  };

  const TicketTable = ({ tickets: filteredTickets }: { tickets: Ticket[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Alumno</TableHead>
          <TableHead>Asunto</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Prioridad</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredTickets.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              No hay tickets en esta categoría
            </TableCell>
          </TableRow>
        ) : (
          filteredTickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {ticket.profiles?.full_name || "Sin nombre"}
                </div>
              </TableCell>
              <TableCell className="font-medium">{ticket.subject}</TableCell>
              <TableCell>{getCategoryLabel(ticket.category)}</TableCell>
              <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
              <TableCell>
                {new Date(ticket.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        loadMessages(ticket.id);
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Gestionar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle>{ticket.subject}</DialogTitle>
                      <div className="flex gap-2 mt-2">
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                        <Badge variant="outline">{getCategoryLabel(ticket.category)}</Badge>
                      </div>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm font-semibold mb-2">
                          Alumno: {ticket.profiles?.full_name || "Sin nombre"}
                        </p>
                        <p className="text-sm font-semibold mb-2">Consulta inicial:</p>
                        <p className="text-sm">{ticket.message}</p>
                      </div>

                      <div className="flex gap-2">
                        <Select
                          value={ticket.status}
                          onValueChange={(value) => handleUpdateStatus(ticket.id, value)}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Abierto</SelectItem>
                            <SelectItem value="in_progress">En progreso</SelectItem>
                            <SelectItem value="resolved">Resuelto</SelectItem>
                            <SelectItem value="closed">Cerrado</SelectItem>
                          </SelectContent>
                        </Select>
                        {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>

                      <div className="border-t pt-4">
                        <p className="text-sm font-semibold mb-3">Conversación:</p>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`p-3 rounded-lg ${
                                msg.user_id === ticket.student_id
                                  ? "bg-muted mr-8"
                                  : "bg-primary text-primary-foreground ml-8"
                              }`}
                            >
                              <p className="text-xs font-semibold mb-1">
                                {msg.user_id === ticket.student_id
                                  ? ticket.profiles?.full_name || "Alumno"
                                  : msg.profiles?.full_name || "Soporte"}
                              </p>
                              <p className="text-sm">{msg.message}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(msg.created_at).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <Label htmlFor="new-message">Responder</Label>
                        <div className="flex gap-2 mt-2">
                          <Textarea
                            id="new-message"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escribe tu respuesta..."
                            rows={3}
                            disabled={isSending}
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={isSending || !newMessage.trim()}
                          >
                            {isSending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Enviar"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Atención al Alumno</h1>
        <p className="text-muted-foreground">
          Administra y responde las consultas de los alumnos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Abiertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filterTicketsByStatus("open").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filterTicketsByStatus("in_progress").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resueltas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filterTicketsByStatus("resolved").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consultas de Alumnos</CardTitle>
          <CardDescription>
            Gestiona todas las consultas organizadas por estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="open" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="open">Abiertas</TabsTrigger>
              <TabsTrigger value="in_progress">En Progreso</TabsTrigger>
              <TabsTrigger value="resolved">Resueltas</TabsTrigger>
              <TabsTrigger value="all">Todas</TabsTrigger>
            </TabsList>
            <TabsContent value="open">
              <TicketTable tickets={filterTicketsByStatus("open")} />
            </TabsContent>
            <TabsContent value="in_progress">
              <TicketTable tickets={filterTicketsByStatus("in_progress")} />
            </TabsContent>
            <TabsContent value="resolved">
              <TicketTable tickets={filterTicketsByStatus("resolved")} />
            </TabsContent>
            <TabsContent value="all">
              <TicketTable tickets={tickets} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSupport;
