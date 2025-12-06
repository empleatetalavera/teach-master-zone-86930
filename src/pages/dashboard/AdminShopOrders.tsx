import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Search, Eye, CheckCircle, XCircle, Clock, Package, Loader2, Mail } from "lucide-react";

interface Order {
  id: string;
  user_id: string | null;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_details: any;
  guest_email: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: {
    name: string;
    description: string;
  };
}

export default function AdminShopOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  const loadOrderItems = async (orderId: string) => {
    setLoadingItems(true);
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select(`
          id,
          product_id,
          quantity,
          unit_price,
          subtotal,
          product:products (name, description)
        `)
        .eq("order_id", orderId);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error("Error loading order items:", error);
    } finally {
      setLoadingItems(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      
      toast.success(`Estado actualizado a: ${getStatusLabel(newStatus)}`);
      loadOrders();
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, payment_status: newStatus } : null);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Error al actualizar el pedido");
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "Pendiente";
      case "paid": return "Pagado";
      case "cancelled": return "Cancelado";
      case "refunded": return "Reembolsado";
      default: return status;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600"><Clock className="w-3 h-3 mr-1" /> Pendiente</Badge>;
      case "paid":
        return <Badge variant="secondary" className="bg-green-500/10 text-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Pagado</Badge>;
      case "cancelled":
        return <Badge variant="secondary" className="bg-red-500/10 text-red-600"><XCircle className="w-3 h-3 mr-1" /> Cancelado</Badge>;
      case "refunded":
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">Reembolsado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "bank_transfer": return "Transferencia Bancaria";
      case "paypal": return "PayPal";
      case "redsys": return "Tarjeta (Redsys)";
      case "klarna": return "Klarna";
      default: return method;
    }
  };

  const getClientInfo = (order: Order) => {
    if (order.guest_name || order.guest_email) {
      return {
        name: order.guest_name || "Sin nombre",
        email: order.guest_email || "Sin email",
        phone: order.guest_phone || "-",
        isGuest: true
      };
    }
    
    const billingInfo = order.order_details?.billingInfo;
    return {
      name: billingInfo?.name || "Usuario registrado",
      email: billingInfo?.email || "-",
      phone: billingInfo?.phone || "-",
      company: billingInfo?.company || "-",
      cif: billingInfo?.cif || "-",
      isGuest: false
    };
  };

  const filteredOrders = orders.filter(order => {
    const client = getClientInfo(order);
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.payment_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const openOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    await loadOrderItems(order.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Pedidos de la Tienda</h1>
          <p className="text-muted-foreground">Gestiona los pedidos recibidos de la tienda online</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Package className="w-4 h-4 mr-2" />
            {orders.length} pedidos
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.payment_status === "pending").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pagados</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.payment_status === "paid").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancelados</p>
                <p className="text-2xl font-bold text-red-600">
                  {orders.filter(o => o.payment_status === "cancelled").length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                <p className="text-2xl font-bold text-primary">
                  €{orders.filter(o => o.payment_status === "paid").reduce((sum, o) => sum + o.total_amount * 1.21, 0).toFixed(2)}
                </p>
              </div>
              <Package className="w-8 h-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID, nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="paid">Pagados</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
                <SelectItem value="refunded">Reembolsados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
          <CardDescription>
            {filteredOrders.length} pedido(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Método de Pago</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const client = getClientInfo(order);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell>{getPaymentMethodLabel(order.payment_method)}</TableCell>
                    <TableCell className="font-semibold">
                      €{(order.total_amount * 1.21).toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.payment_status)}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openOrderDetails(order)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Pedido #{order.id.slice(0, 8).toUpperCase()}</DialogTitle>
                            <DialogDescription>
                              Creado el {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedOrder && (
                            <div className="space-y-6">
                              {/* Client Info */}
                              <div className="bg-muted/50 rounded-lg p-4">
                                <h4 className="font-semibold mb-3">Datos del Cliente</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Nombre:</span>
                                    <p className="font-medium">{client.name}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Email:</span>
                                    <p className="font-medium">{client.email}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Teléfono:</span>
                                    <p className="font-medium">{client.phone}</p>
                                  </div>
                                  {client.company && (
                                    <div>
                                      <span className="text-muted-foreground">Empresa:</span>
                                      <p className="font-medium">{client.company}</p>
                                    </div>
                                  )}
                                  {client.cif && (
                                    <div>
                                      <span className="text-muted-foreground">CIF/NIF:</span>
                                      <p className="font-medium">{client.cif}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Order Items */}
                              <div>
                                <h4 className="font-semibold mb-3">Productos</h4>
                                {loadingItems ? (
                                  <div className="flex justify-center py-4">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {orderItems.map((item) => (
                                      <div key={item.id} className="flex justify-between items-center border-b pb-2">
                                        <div>
                                          <p className="font-medium">{item.product?.name || "Producto"}</p>
                                          <p className="text-sm text-muted-foreground">
                                            Cantidad: {item.quantity} × €{item.unit_price.toFixed(2)}
                                          </p>
                                        </div>
                                        <p className="font-semibold">€{item.subtotal.toFixed(2)}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Totals */}
                              <div className="bg-muted/50 rounded-lg p-4">
                                <div className="flex justify-between text-sm mb-2">
                                  <span>Subtotal:</span>
                                  <span>€{selectedOrder.total_amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-2">
                                  <span>IVA (21%):</span>
                                  <span>€{(selectedOrder.total_amount * 0.21).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2">
                                  <span>Total:</span>
                                  <span>€{(selectedOrder.total_amount * 1.21).toFixed(2)}</span>
                                </div>
                              </div>

                              {/* Payment Info */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-muted-foreground">Método de pago</p>
                                  <p className="font-medium">{getPaymentMethodLabel(selectedOrder.payment_method)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-muted-foreground">Estado actual</p>
                                  {getStatusBadge(selectedOrder.payment_status)}
                                </div>
                              </div>

                              {/* Notes */}
                              {selectedOrder.order_details?.notes && (
                                <div>
                                  <h4 className="font-semibold mb-2">Notas del cliente</h4>
                                  <p className="text-sm bg-muted/50 rounded-lg p-3">
                                    {selectedOrder.order_details.notes}
                                  </p>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex flex-wrap gap-2 pt-4 border-t">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateOrderStatus(selectedOrder.id, "paid")}
                                  disabled={selectedOrder.payment_status === "paid"}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Marcar como Pagado
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateOrderStatus(selectedOrder.id, "pending")}
                                  disabled={selectedOrder.payment_status === "pending"}
                                >
                                  <Clock className="w-4 h-4 mr-1" />
                                  Marcar Pendiente
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateOrderStatus(selectedOrder.id, "cancelled")}
                                  disabled={selectedOrder.payment_status === "cancelled"}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Cancelar
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.location.href = `mailto:${client.email}?subject=Pedido%20%23${selectedOrder.id.slice(0,8).toUpperCase()}`}
                                >
                                  <Mail className="w-4 h-4 mr-1" />
                                  Contactar Cliente
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron pedidos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}