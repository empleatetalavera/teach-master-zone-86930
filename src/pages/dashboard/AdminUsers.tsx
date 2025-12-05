import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader2, Shield, Search, RefreshCw, Edit2, Building2, Copy, CheckCircle2, Key, Mail, User } from "lucide-react";
import { UserRoleManager } from "@/components/UserRoleManager";
import { useAuth } from "@/lib/auth";

interface UserWithRole {
  id: string;
  email: string;
  role: string;
  created_at: string;
  full_name?: string;
  training_center_id?: string;
}

interface CreatedUserCredentials {
  email: string;
  password: string;
  fullName?: string;
  role: string;
}

// Generate a secure random password
const generatePassword = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const specialChars = '!@#$%&*';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  password += Math.floor(Math.random() * 10);
  return password;
};

const AdminUsers = () => {
  const { user, userRole } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [userCenterId, setUserCenterId] = useState<string | null>(null);
  
  // Credentials modal state
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [createdUserCredentials, setCreatedUserCredentials] = useState<CreatedUserCredentials | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const isSuperAdmin = userRole === 'super_admin';
  
  // New user form state
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "teacher" | "student">("student");
  const [newUserTrainingCenter, setNewUserTrainingCenter] = useState<string>("");
  const [trainingCenters, setTrainingCenters] = useState<Array<{ id: string; name: string }>>([]);
  
  const { toast } = useToast();
  
  // Auto-generate password when dialog opens
  useEffect(() => {
    if (isCreateDialogOpen && !newUserPassword) {
      setNewUserPassword(generatePassword());
    }
  }, [isCreateDialogOpen]);
  
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast({
        title: "Copiado",
        description: `${field} copiado al portapapeles`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      });
    }
  };
  
  const copyAllCredentials = async () => {
    if (!createdUserCredentials) return;
    const text = `Credenciales de acceso a la plataforma:\n\nEmail: ${createdUserCredentials.email}\nContraseña: ${createdUserCredentials.password}${createdUserCredentials.fullName ? `\nNombre: ${createdUserCredentials.fullName}` : ''}`;
    await copyToClipboard(text, 'credenciales');
  };

  useEffect(() => {
    const loadUserCenter = async () => {
      if (!user || isSuperAdmin) {
        loadUsers();
        loadTrainingCenters();
        return;
      }
      
      // Get center admin's training center
      const { data: profile } = await supabase
        .from('profiles')
        .select('training_center_id')
        .eq('id', user.id)
        .single();
      
      if (profile?.training_center_id) {
        setUserCenterId(profile.training_center_id);
      }
      
      loadUsers(profile?.training_center_id);
      loadTrainingCenters();
    };
    
    loadUserCenter();
  }, [user, isSuperAdmin]);

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const loadUsers = async (centerId?: string | null) => {
    try {
      setLoading(true);
      const effectiveCenterId = centerId || userCenterId;
      
      // Get all user_roles
      const { data: userRoles, error } = await supabase
        .from("user_roles")
        .select("user_id, role, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get all profiles separately (no FK relationship)
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, training_center_id");

      // Create a map for quick lookup
      const profileMap = new Map(
        (profiles || []).map((p: any) => [p.id, p])
      );

      // Combine data
      let usersWithRoles: UserWithRole[] = (userRoles || []).map((ur: any) => {
        const profile = profileMap.get(ur.user_id);
        return {
          id: ur.user_id,
          email: "Cargando...",
          role: ur.role,
          created_at: ur.created_at,
          full_name: profile?.full_name,
          training_center_id: profile?.training_center_id,
        };
      });

      // Filter by center if center admin
      if (!isSuperAdmin && effectiveCenterId) {
        usersWithRoles = usersWithRoles.filter(u => u.training_center_id === effectiveCenterId);
      }

      setUsers(usersWithRoles);
      setFilteredUsers(usersWithRoles);
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTrainingCenters = async () => {
    try {
      const { data, error } = await supabase
        .from("training_centers")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setTrainingCenters(data || []);
    } catch (error: any) {
      console.error("Error loading training centers:", error);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "teacher":
        return "default";
      case "student":
        return "secondary";
      case "inspector":
        return "outline";
      case "auditor":
        return "outline";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "teacher":
        return "Profesor";
      case "student":
        return "Alumno";
      case "inspector":
        return "Inspector";
      case "auditor":
        return "Auditor";
      default:
        return role;
    }
  };

  const handleRoleSuccess = () => {
    setIsRoleDialogOpen(false);
    setSelectedUser(null);
    loadUsers();
  };

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast({
        title: "Error",
        description: "Email y contraseña son obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (newUserPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);

      // Call edge function to create user
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: newUserEmail,
          password: newUserPassword,
          fullName: newUserFullName || undefined,
          role: newUserRole,
          trainingCenterId: newUserTrainingCenter || undefined,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Error al crear usuario');

      // Store credentials and show modal
      setCreatedUserCredentials({
        email: newUserEmail,
        password: newUserPassword,
        fullName: newUserFullName || undefined,
        role: newUserRole,
      });
      
      // Close create dialog and open credentials dialog
      setIsCreateDialogOpen(false);
      setIsCredentialsDialogOpen(true);

      // Reset form
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserFullName("");
      setNewUserRole("student");
      setNewUserTrainingCenter("");

      // Reload users
      loadUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Error al crear usuario",
        description: error.message || "No se pudo crear el usuario",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Gestión de Usuarios y Roles
          </h1>
          <p className="text-muted-foreground mt-2">
            Administra usuarios y asigna roles de forma segura
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => loadUsers()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Crear Usuario
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "admin").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Profesores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "teacher").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Alumnos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "student").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Busca usuarios y gestiona sus roles de forma segura
          </CardDescription>
          <div className="pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email, nombre o rol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol Actual</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                      {searchTerm
                        ? "No se encontraron usuarios con ese criterio"
                        : "No hay usuarios registrados"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.full_name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsRoleDialogOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Gestionar Rol
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gestionar Rol de Usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p className="text-sm font-medium">Usuario Seleccionado:</p>
                <p className="text-sm text-muted-foreground">
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                {selectedUser.full_name && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Nombre:</strong> {selectedUser.full_name}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  <strong>ID:</strong> <code className="text-xs">{selectedUser.id}</code>
                </p>
              </div>
              <UserRoleManager
                userId={selectedUser.id}
                currentRole={selectedUser.role as any}
                onSuccess={handleRoleSuccess}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open);
        if (!open) {
          setNewUserEmail("");
          setNewUserPassword("");
          setNewUserFullName("");
          setNewUserRole("student");
          setNewUserTrainingCenter("");
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <CardDescription>
              Crea un nuevo usuario y asigna su rol inicial. Las credenciales se mostrarán al finalizar.
            </CardDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña * (auto-generada)</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="text"
                  placeholder="Mínimo 6 caracteres"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  disabled={isCreating}
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setNewUserPassword(generatePassword())}
                  disabled={isCreating}
                  title="Generar nueva contraseña"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                La contraseña se mostrará después de crear el usuario para que puedas compartirla
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Nombre y apellidos"
                value={newUserFullName}
                onChange={(e) => setNewUserFullName(e.target.value)}
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol *</Label>
              <Select
                value={newUserRole}
                onValueChange={(value: any) => setNewUserRole(value)}
                disabled={isCreating}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Alumno</SelectItem>
                  <SelectItem value="teacher">Profesor</SelectItem>
                  {isSuperAdmin && <SelectItem value="admin">Administrador</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {isSuperAdmin && (
            <div className="space-y-2">
              <Label htmlFor="training-center">
                <Building2 className="inline-block w-4 h-4 mr-1" />
                Centro de Formación
              </Label>
              <Select
                value={newUserTrainingCenter}
                onValueChange={setNewUserTrainingCenter}
                disabled={isCreating}
              >
                <SelectTrigger id="training-center">
                  <SelectValue placeholder="Selecciona un centro (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin centro asignado</SelectItem>
                  {trainingCenters.map((center) => (
                    <SelectItem key={center.id} value={center.id}>
                      {center.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                El usuario verá el branding del centro seleccionado
              </p>
            </div>
            )}

            {!isSuperAdmin && userCenterId && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  El usuario será asignado automáticamente a tu centro de formación
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setNewUserEmail("");
                  setNewUserPassword("");
                  setNewUserFullName("");
                  setNewUserRole("student");
                  setNewUserTrainingCenter("");
                }}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateUser} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crear Usuario
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog - Shows after user creation */}
      <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Usuario Creado Exitosamente
            </DialogTitle>
            <CardDescription>
              Copia las credenciales y compártelas con el usuario por email, WhatsApp o el medio que prefieras.
            </CardDescription>
          </DialogHeader>
          
          {createdUserCredentials && (
            <div className="space-y-4 py-4">
              <div className="bg-muted rounded-lg p-4 space-y-3">
                {createdUserCredentials.fullName && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Nombre:</span>
                      <span className="text-sm">{createdUserCredentials.fullName}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email:</span>
                    <span className="text-sm font-mono">{createdUserCredentials.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(createdUserCredentials.email, 'Email')}
                  >
                    {copiedField === 'Email' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Contraseña:</span>
                    <span className="text-sm font-mono bg-background px-2 py-1 rounded">{createdUserCredentials.password}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(createdUserCredentials.password, 'Contraseña')}
                  >
                    {copiedField === 'Contraseña' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant="secondary">{getRoleLabel(createdUserCredentials.role)}</Badge>
                </div>
              </div>
              
              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={copyAllCredentials}
                >
                  {copiedField === 'credenciales' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Todo
                    </>
                  )}
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setIsCredentialsDialogOpen(false);
                    setCreatedUserCredentials(null);
                  }}
                >
                  Cerrar
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                Recuerda informar al usuario que puede cambiar su contraseña después de iniciar sesión.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
