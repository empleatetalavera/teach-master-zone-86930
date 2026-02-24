import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader2, Shield, Search, RefreshCw, Edit2, Building2, Copy, CheckCircle2, Key, Mail, User, GraduationCap, Calendar, Clock, X, AlertTriangle, Trash2, MoreHorizontal, UserX } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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

interface StudentEnrollment {
  enrollment_id: string;
  course_id: string;
  course_title: string;
  enrolled_at: string;
  progress: number;
  course_end_date: string | null;
  days_remaining: number | null;
  is_expired: boolean;
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
  
  // Enrollment management state
  const [enrollmentSheetOpen, setEnrollmentSheetOpen] = useState(false);
  const [selectedUserForEnrollments, setSelectedUserForEnrollments] = useState<UserWithRole | null>(null);
  const [userEnrollments, setUserEnrollments] = useState<StudentEnrollment[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [unenrollingId, setUnenrollingId] = useState<string | null>(null);
  
  // Delete/Edit user state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editProfileDialogOpen, setEditProfileDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserWithRole | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editTrainingCenter, setEditTrainingCenter] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Change password state
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [userToChangePassword, setUserToChangePassword] = useState<UserWithRole | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Change email state
  const [changeEmailDialogOpen, setChangeEmailDialogOpen] = useState(false);
  const [userToChangeEmail, setUserToChangeEmail] = useState<UserWithRole | null>(null);
  const [newEmailValue, setNewEmailValue] = useState("");
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  
  const isSuperAdmin = userRole === 'super_admin';
  
  // New user form state
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "teacher" | "student" | "auditor" | "inspector">("student");
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

  // Load enrollments for a specific user
  const loadUserEnrollments = async (userId: string) => {
    setLoadingEnrollments(true);
    try {
      // Get enrollments with course info
      const { data: enrollments, error: enrollError } = await supabase
        .from("enrollments")
        .select(`
          id,
          course_id,
          enrolled_at,
          progress_percentage,
          courses (
            id,
            title,
            end_date
          )
        `)
        .eq("user_id", userId);

      if (enrollError) throw enrollError;

      const today = new Date();
      const enrichedEnrollments: StudentEnrollment[] = (enrollments || []).map((e: any) => {
        const endDate = e.courses?.end_date ? new Date(e.courses.end_date) : null;
        const daysRemaining = endDate ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
        
        return {
          enrollment_id: e.id,
          course_id: e.course_id,
          course_title: e.courses?.title || "Curso desconocido",
          enrolled_at: e.enrolled_at,
          progress: e.progress_percentage || 0,
          course_end_date: e.courses?.end_date,
          days_remaining: daysRemaining,
          is_expired: daysRemaining !== null && daysRemaining < 0
        };
      });

      setUserEnrollments(enrichedEnrollments);
    } catch (error: any) {
      console.error("Error loading enrollments:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las matrículas",
        variant: "destructive",
      });
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const handleOpenEnrollmentPanel = (user: UserWithRole) => {
    setSelectedUserForEnrollments(user);
    setEnrollmentSheetOpen(true);
    loadUserEnrollments(user.id);
  };

  const handleUnenrollUser = async (enrollmentId: string, courseTitle: string) => {
    setUnenrollingId(enrollmentId);
    try {
      const { error } = await supabase
        .from("enrollments")
        .delete()
        .eq("id", enrollmentId);

      if (error) throw error;

      toast({
        title: "Baja realizada",
        description: `Se ha dado de baja del curso "${courseTitle}"`,
      });

      // Refresh enrollments
      setUserEnrollments(prev => prev.filter(e => e.enrollment_id !== enrollmentId));
    } catch (error: any) {
      console.error("Error unenrolling:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUnenrollingId(null);
    }
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

  // Handle opening edit profile dialog
  const handleEditProfile = async (userItem: UserWithRole) => {
    setUserToEdit(userItem);
    setEditFullName(userItem.full_name || "");
    setEditTrainingCenter(userItem.training_center_id || "");
    setEditProfileDialogOpen(true);
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!userToEdit) return;
    
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editFullName || null,
          training_center_id: editTrainingCenter || null,
        })
        .eq("id", userToEdit.id);

      if (error) throw error;

      toast({
        title: "Perfil actualizado",
        description: "Los datos del usuario han sido actualizados",
      });

      setEditProfileDialogOpen(false);
      setUserToEdit(null);
      loadUsers();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle change password
  const handleOpenChangePassword = (userItem: UserWithRole) => {
    setUserToChangePassword(userItem);
    setNewPasswordValue(generatePassword());
    setChangePasswordDialogOpen(true);
  };

  // Handle change email
  const handleOpenChangeEmail = (userItem: UserWithRole) => {
    setUserToChangeEmail(userItem);
    setNewEmailValue(userItem.email !== "Cargando..." ? userItem.email : "");
    setChangeEmailDialogOpen(true);
  };

  const handleChangeEmail = async () => {
    if (!userToChangeEmail || !newEmailValue) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmailValue)) {
      toast({
        title: "Error",
        description: "Por favor, introduce un email válido",
        variant: "destructive",
      });
      return;
    }
    
    setIsChangingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: {
          userId: userToChangeEmail.id,
          newEmail: newEmailValue,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Error al cambiar el email');

      toast({
        title: "Email actualizado",
        description: "El nuevo email ha sido establecido correctamente",
      });

      setChangeEmailDialogOpen(false);
      setUserToChangeEmail(null);
      setNewEmailValue("");
      loadUsers();
    } catch (error: any) {
      console.error("Error changing email:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar el email",
        variant: "destructive",
      });
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleChangePassword = async () => {
    if (!userToChangePassword || !newPasswordValue) return;
    
    if (newPasswordValue.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }
    
    setIsChangingPassword(true);
    try {
      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: {
          userId: userToChangePassword.id,
          newPassword: newPasswordValue,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Error al cambiar la contraseña');

      toast({
        title: "Contraseña actualizada",
        description: "La nueva contraseña ha sido establecida correctamente",
      });

      setChangePasswordDialogOpen(false);
      setUserToChangePassword(null);
      setNewPasswordValue("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar la contraseña",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle delete user confirmation
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      // First delete user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userToDelete.id);

      if (roleError) throw roleError;

      // Remove from training center (set training_center_id to null)
      await supabase
        .from("profiles")
        .update({ training_center_id: null })
        .eq("id", userToDelete.id);

      toast({
        title: "Usuario dado de baja",
        description: "El usuario ha sido desvinculado y su rol eliminado",
      });

      setDeleteDialogOpen(false);
      setUserToDelete(null);
      loadUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo dar de baja al usuario",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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
          <Button onClick={() => loadUsers()} variant="outline" className="border-primary text-primary hover:bg-primary/10">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
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
                      <TableCell>
                        {user.role === 'student' ? (
                          <button
                            className="text-left hover:text-primary hover:underline cursor-pointer transition-colors"
                            onClick={() => handleOpenEnrollmentPanel(user)}
                          >
                            {user.full_name || "-"}
                          </button>
                        ) : (
                          user.full_name || "-"
                        )}
                      </TableCell>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setIsRoleDialogOpen(true);
                            }}>
                              <Shield className="h-4 w-4 mr-2" />
                              Gestionar Rol
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditProfile(user)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Editar Perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenChangePassword(user)}>
                              <Key className="h-4 w-4 mr-2" />
                              Cambiar Contraseña
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenChangeEmail(user)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Cambiar Email
                            </DropdownMenuItem>
                            {user.role === 'student' && (
                              <DropdownMenuItem onClick={() => handleOpenEnrollmentPanel(user)}>
                                <GraduationCap className="h-4 w-4 mr-2" />
                                Ver Matrículas
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                setUserToDelete(user);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Dar de Baja
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                  <SelectItem value="auditor">Auditor</SelectItem>
                  <SelectItem value="inspector">Inspector</SelectItem>
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
                value={newUserTrainingCenter || "none"}
                onValueChange={(value) => setNewUserTrainingCenter(value === "none" ? "" : value)}
                disabled={isCreating}
              >
                <SelectTrigger id="training-center">
                  <SelectValue placeholder="Selecciona un centro (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin centro asignado</SelectItem>
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
                className="border-muted-foreground/30"
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
              <Button onClick={handleCreateUser} disabled={isCreating} className="bg-primary text-primary-foreground hover:bg-primary/90">
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

      {/* Enrollment Management Sheet */}
      <Sheet open={enrollmentSheetOpen} onOpenChange={setEnrollmentSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Panel de Matrículas
            </SheetTitle>
            <SheetDescription>
              {selectedUserForEnrollments?.full_name || selectedUserForEnrollments?.email}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Cursos matriculados</p>
                <p className="text-2xl font-bold">{userEnrollments.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Cursos expirados</p>
                <p className="text-2xl font-bold text-destructive">
                  {userEnrollments.filter(e => e.is_expired).length}
                </p>
              </div>
            </div>

            {/* Enrollments List */}
            {loadingEnrollments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : userEnrollments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Este usuario no está matriculado en ningún curso
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {userEnrollments.map((enrollment) => (
                    <div
                      key={enrollment.enrollment_id}
                      className={`p-4 rounded-lg border ${enrollment.is_expired ? 'border-destructive/50 bg-destructive/5' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm leading-tight">{enrollment.course_title}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                          onClick={() => handleUnenrollUser(enrollment.enrollment_id, enrollment.course_title)}
                          disabled={unenrollingId === enrollment.enrollment_id}
                        >
                          {unenrollingId === enrollment.enrollment_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Progreso</span>
                          <span>{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2" />
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Inicio: {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString('es-ES') : 'N/A'}</span>
                        </div>
                        {enrollment.course_end_date && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Fin: {new Date(enrollment.course_end_date).toLocaleDateString('es-ES')}</span>
                          </div>
                        )}
                      </div>

                      {enrollment.days_remaining !== null && (
                        <div className="mt-2">
                          {enrollment.is_expired ? (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Expirado hace {Math.abs(enrollment.days_remaining)} días
                            </Badge>
                          ) : enrollment.days_remaining <= 7 ? (
                            <Badge variant="secondary" className="gap-1 bg-yellow-500/20 text-yellow-700">
                              <Clock className="h-3 w-3" />
                              {enrollment.days_remaining} días restantes
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <Clock className="h-3 w-3" />
                              {enrollment.days_remaining} días restantes
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Close Button */}
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setEnrollmentSheetOpen(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Dar de baja a este usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el rol del usuario <strong>{userToDelete?.full_name || userToDelete?.email}</strong> y lo desvinculará del centro de formación.
              <br /><br />
              El usuario no podrá acceder al sistema hasta que se le asigne un nuevo rol.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Dar de Baja
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileDialogOpen} onOpenChange={setEditProfileDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Perfil de Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                <strong>ID:</strong> <code className="text-xs">{userToEdit?.id}</code>
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editFullName">Nombre Completo</Label>
              <Input
                id="editFullName"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                placeholder="Nombre y apellidos"
                disabled={isSavingProfile}
              />
            </div>

            {isSuperAdmin && (
              <div className="space-y-2">
                <Label htmlFor="editCenter">Centro de Formación</Label>
                <Select
                  value={editTrainingCenter}
                  onValueChange={setEditTrainingCenter}
                  disabled={isSavingProfile}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin asignar</SelectItem>
                    {trainingCenters.map((center) => (
                      <SelectItem key={center.id} value={center.id}>
                        {center.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditProfileDialogOpen(false)}
                disabled={isSavingProfile}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                {isSavingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordDialogOpen} onOpenChange={(open) => {
        setChangePasswordDialogOpen(open);
        if (!open) {
          setUserToChangePassword(null);
          setNewPasswordValue("");
        }
      }}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Cambiar Contraseña
            </DialogTitle>
            <CardDescription>
              Establece una nueva contraseña para el usuario. 
              {userToChangePassword?.full_name && (
                <span className="font-medium"> ({userToChangePassword.full_name})</span>
              )}
            </CardDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Usuario:</span>
                <span className="font-mono text-muted-foreground">{userToChangePassword?.email || "Cargando..."}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <div className="flex gap-2">
                <Input
                  id="newPassword"
                  type="text"
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  disabled={isChangingPassword}
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setNewPasswordValue(generatePassword())}
                  disabled={isChangingPassword}
                  title="Generar nueva contraseña"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(newPasswordValue, 'Contraseña')}
                  disabled={isChangingPassword || !newPasswordValue}
                  title="Copiar contraseña"
                >
                  {copiedField === 'Contraseña' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Copia la contraseña antes de guardar para compartirla con el usuario
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setChangePasswordDialogOpen(false);
                  setUserToChangePassword(null);
                  setNewPasswordValue("");
                }}
                disabled={isChangingPassword}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleChangePassword} 
                disabled={isChangingPassword || !newPasswordValue || newPasswordValue.length < 6}
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Cambiar Contraseña
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Email Dialog */}
      <Dialog open={changeEmailDialogOpen} onOpenChange={(open) => {
        setChangeEmailDialogOpen(open);
        if (!open) {
          setUserToChangeEmail(null);
          setNewEmailValue("");
        }
      }}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Cambiar Email de Acceso
            </DialogTitle>
            <CardDescription>
              Cambia el email con el que el usuario accede a la plataforma.
              {userToChangeEmail?.full_name && (
                <span className="font-medium"> ({userToChangeEmail.full_name})</span>
              )}
            </CardDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Email actual:</span>
                <span className="font-mono text-muted-foreground">{userToChangeEmail?.email || "Cargando..."}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newEmail">Nuevo Email</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmailValue}
                onChange={(e) => setNewEmailValue(e.target.value)}
                placeholder="nuevo@email.com"
                disabled={isChangingEmail}
              />
              <p className="text-xs text-muted-foreground">
                El usuario deberá usar este nuevo email para acceder a la plataforma
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setChangeEmailDialogOpen(false);
                  setUserToChangeEmail(null);
                  setNewEmailValue("");
                }}
                disabled={isChangingEmail}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleChangeEmail} 
                disabled={isChangingEmail || !newEmailValue}
              >
                {isChangingEmail ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Cambiar Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
