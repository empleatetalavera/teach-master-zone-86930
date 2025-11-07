import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Package, Edit, Trash2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

interface ContentOrder {
  id: string;
  training_center_id: string;
  content_type: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  price: number | null;
  created_at: string;
  training_centers: {
    name: string;
  };
}

interface TrainingCenter {
  id: string;
  name: string;
}

export default function AdminContentOrders() {
  const [orders, setOrders] = useState<ContentOrder[]>([]);
  const [centers, setCenters] = useState<TrainingCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ContentOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [userCenterId, setUserCenterId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, userRole } = useAuth();

  const isSuperAdmin = userRole === "super_admin";

  const [formData, setFormData] = useState({
    training_center_id: "",
    content_type: "course",
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    due_date: "",
    price: "",
  });

  useEffect(() => {
    loadUserCenter();
  }, [user]);

  useEffect(() => {
    if (userCenterId || isSuperAdmin) {
      loadData();
    }
  }, [userCenterId, isSuperAdmin]);

  const loadUserCenter = async () => {
    if (!user || isSuperAdmin) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("training_center_id")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setUserCenterId(data?.training_center_id || null);
    } catch (error: any) {
      console.error("Error loading user center:", error);
    }
  };

  const loadData = async () => {
    try {
      let ordersQuery = supabase
        .from("content_orders")
        .select("*, training_centers(name)");

      // Filter by center if not super_admin
      if (!isSuperAdmin && userCenterId) {
        ordersQuery = ordersQuery.eq("training_center_id", userCenterId);
      }

      const ordersRes = await ordersQuery.order("created_at", { ascending: false });

      // Load centers - super_admin sees all, admin sees only theirs
      let centersQuery = supabase
        .from("training_centers")
        .select("id, name")
        .eq("is_active", true);

      if (!isSuperAdmin && userCenterId) {
        centersQuery = centersQuery.eq("id", userCenterId);
      }

      const centersRes = await centersQuery;

      if (ordersRes.error) throw ordersRes.error;
      if (centersRes.error) throw centersRes.error;

      setOrders(ordersRes.data || []);
      setCenters(centersRes.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-fill center for non-super admin
    const training_center_id = isSuperAdmin ? formData.training_center_id : userCenterId;

    if (!training_center_id) {
      toast({
        title: "Error",
        description: "No se pudo determinar el centro de formación",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      training_center_id,
      content_type: formData.content_type,
      title: formData.title,
      description: formData.description || null,
      status: formData.status,
      priority: formData.priority,
      price: formData.price ? parseFloat(formData.price) : null,
      due_date: formData.due_date || null,
    };

    try {
      if (editingOrder) {
        // Super_admin can edit all fields, admin can only edit some
        const updateData = isSuperAdmin 
          ? submitData 
          : {
              title: formData.title,
              description: formData.description || null,
              content_type: formData.content_type,
            };

        const { error } = await supabase
          .from("content_orders")
          .update(updateData)
          .eq("id", editingOrder.id);

        if (error) throw error;
        toast({ title: "Pedido actualizado correctamente" });
      } else {
        const { error } = await supabase
          .from("content_orders")
          .insert([submitData]);

        if (error) throw error;
        toast({ 
          title: "Solicitud enviada correctamente",
          description: isSuperAdmin 
            ? "Pedido creado" 
            : "Tu solicitud ha sido enviada al equipo de TalentCloudSolution"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (order: ContentOrder) => {
    // Admin de centro solo puede editar sus propios pedidos pendientes
    if (!isSuperAdmin && order.status !== "pending") {
      toast({
        title: "No permitido",
        description: "Solo puedes editar pedidos pendientes",
        variant: "destructive",
      });
      return;
    }

    setEditingOrder(order);
    setFormData({
      training_center_id: order.training_center_id,
      content_type: order.content_type,
      title: order.title,
      description: order.description || "",
      status: order.status,
      priority: order.priority,
      due_date: order.due_date ? order.due_date.split("T")[0] : "",
      price: order.price?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const order = orders.find(o => o.id === id);
    
    // Admin de centro solo puede eliminar pedidos pendientes
    if (!isSuperAdmin && order?.status !== "pending") {
      toast({
        title: "No permitido",
        description: "Solo puedes eliminar pedidos pendientes",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("¿Está seguro de eliminar este pedido?")) return;

    try {
      const { error } = await supabase
        .from("content_orders")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Pedido eliminado" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingOrder(null);
    setFormData({
      training_center_id: "",
      content_type: "course",
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      due_date: "",
      price: "",
    });
  };

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      course: "Curso",
      module: "Módulo",
      video: "Vídeo",
      document: "Documento",
      custom: "Personalizado",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: "secondary", label: "Pendiente" },
      in_progress: { variant: "default", label: "En Progreso" },
      completed: { variant: "default", label: "Completado" },
      cancelled: { variant: "destructive", label: "Cancelado" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      low: { variant: "secondary", label: "Baja" },
      medium: { variant: "outline", label: "Media" },
      high: { variant: "default", label: "Alta" },
      urgent: { variant: "destructive", label: "Urgente" },
    };
    const config = variants[priority] || variants.medium;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredOrders = filterStatus === "all" 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    in_progress: orders.filter(o => o.status === "in_progress").length,
    completed: orders.filter(o => o.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {isSuperAdmin ? "Pedidos de Contenido" : "Solicitar Contenido"}
          </h1>
          <p className="text-muted-foreground">
            {isSuperAdmin 
              ? "Gestiona los pedidos de contenido de los centros"
              : "Solicita cursos y contenido formativo para tu centro"
            }
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {isSuperAdmin ? "Nuevo Pedido" : "Nueva Solicitud"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOrder 
                  ? (isSuperAdmin ? "Editar Pedido" : "Editar Solicitud")
                  : (isSuperAdmin ? "Nuevo Pedido de Contenido" : "Nueva Solicitud de Contenido")
                }
              </DialogTitle>
              {!isSuperAdmin && !editingOrder && (
                <p className="text-sm text-muted-foreground">
                  Tu solicitud será revisada por el equipo de TalentCloudSolution
                </p>
              )}
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSuperAdmin && (
                <div>
                  <Label htmlFor="training_center_id">Centro de Formación *</Label>
                  <Select
                    value={formData.training_center_id}
                    onValueChange={(value) => setFormData({ ...formData, training_center_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar centro" />
                    </SelectTrigger>
                    <SelectContent>
                      {centers.map((center) => (
                        <SelectItem key={center.id} value={center.id}>
                          {center.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="content_type">Tipo de Contenido *</Label>
                  <Select
                    value={formData.content_type}
                    onValueChange={(value) => setFormData({ ...formData, content_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="course">Curso</SelectItem>
                      <SelectItem value="module">Módulo</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="document">Documento</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe los detalles del pedido"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                    disabled={!isSuperAdmin}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in_progress">En Progreso</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  {!isSuperAdmin && (
                    <p className="text-xs text-muted-foreground mt-1">
                      El estado será actualizado por TalentCloudSolution
                    </p>
                  )}
                </div>
                {isSuperAdmin && (
                  <div>
                    <Label htmlFor="due_date">Fecha de Entrega</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                )}
              </div>

              {isSuperAdmin && (
                <div>
                  <Label htmlFor="price">Precio (€)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingOrder 
                    ? "Actualizar" 
                    : (isSuperAdmin ? "Crear Pedido" : "Enviar Solicitud")
                  }
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.in_progress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                {isSuperAdmin ? "Pedidos de Contenido" : "Mis Solicitudes"}
              </CardTitle>
              <CardDescription>
                {filteredOrders.length} {isSuperAdmin ? "pedidos" : "solicitudes"}
              </CardDescription>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completados</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay pedidos
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {isSuperAdmin && <TableHead>Centro</TableHead>}
                  <TableHead>Contenido</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Estado</TableHead>
                  {isSuperAdmin && <TableHead>Entrega</TableHead>}
                  {isSuperAdmin && <TableHead>Precio</TableHead>}
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    {isSuperAdmin && (
                      <TableCell className="font-medium">
                        {order.training_centers.name}
                      </TableCell>
                    )}
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.title}</div>
                        {order.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {order.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getContentTypeLabel(order.content_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(order.priority)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell>
                        {order.due_date ? (
                          <div className="text-sm">
                            {new Date(order.due_date).toLocaleDateString()}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    )}
                    {isSuperAdmin && (
                      <TableCell>
                        {order.price ? `€${order.price.toFixed(2)}` : "-"}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {(isSuperAdmin || order.status === "pending") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(order)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {(isSuperAdmin || order.status === "pending") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(order.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
