import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { 
  User, 
  FileText, 
  Upload, 
  Check, 
  AlertCircle,
  Phone,
  Mail,
  CreditCard,
  GraduationCap,
  Loader2
} from "lucide-react";

interface StudentProfileCompletionProps {
  onComplete: () => void;
}

interface ProfileData {
  full_name: string;
  dni_nie: string;
  phone: string;
  birth_date: string;
  address: string;
  city: string;
  postal_code: string;
  province: string;
}

interface DocumentStatus {
  dni: boolean;
  titulacion: boolean;
}

const StudentProfileCompletion = ({ onComplete }: StudentProfileCompletionProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingDni, setUploadingDni] = useState(false);
  const [uploadingTitulacion, setUploadingTitulacion] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    dni_nie: "",
    phone: "",
    birth_date: "",
    address: "",
    city: "",
    postal_code: "",
    province: ""
  });

  const [documents, setDocuments] = useState<DocumentStatus>({
    dni: false,
    titulacion: false
  });

  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (user) {
      setUserEmail(user.email || "");
      loadExistingData();
    }
  }, [user]);

  const loadExistingData = async () => {
    if (!user?.id) return;

    try {
      // Load profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || "",
          dni_nie: profileData.dni_nie || "",
          phone: profileData.phone || "",
          birth_date: profileData.birth_date || "",
          address: profileData.address || "",
          city: profileData.city || "",
          postal_code: profileData.postal_code || "",
          province: profileData.province || ""
        });
      }

      // Load documents status
      const { data: docs } = await supabase
        .from('student_documents')
        .select('document_type')
        .eq('user_id', user.id);

      if (docs) {
        setDocuments({
          dni: docs.some(d => d.document_type === 'dni'),
          titulacion: docs.some(d => d.document_type === 'titulacion_previa')
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    if (!user?.id) return;

    // Validate required fields
    if (!profile.full_name || !profile.dni_nie || !profile.phone) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          dni_nie: profile.dni_nie,
          phone: profile.phone,
          birth_date: profile.birth_date || null,
          address: profile.address || null,
          city: profile.city || null,
          postal_code: profile.postal_code || null,
          province: profile.province || null
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Datos guardados correctamente");
      setStep(2);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error("Error al guardar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, documentType: 'dni' | 'titulacion_previa') => {
    if (!user?.id) return;

    const isUploading = documentType === 'dni' ? setUploadingDni : setUploadingTitulacion;
    isUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${documentType}_${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('student-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { error: dbError } = await supabase
        .from('student_documents')
        .insert({
          user_id: user.id,
          document_type: documentType,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          status: 'pending'
        });

      if (dbError) throw dbError;

      setDocuments(prev => ({
        ...prev,
        [documentType === 'dni' ? 'dni' : 'titulacion']: true
      }));

      toast.success(`Documento subido correctamente`);
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error("Error al subir el documento");
    } finally {
      isUploading(false);
    }
  };

  const handleComplete = () => {
    if (!documents.dni) {
      toast.error("Debes subir tu DNI/NIE para continuar");
      return;
    }
    onComplete();
  };

  const completionPercentage = () => {
    let completed = 0;
    if (profile.full_name) completed += 15;
    if (profile.dni_nie) completed += 15;
    if (profile.phone) completed += 15;
    if (profile.birth_date) completed += 10;
    if (profile.address) completed += 10;
    if (documents.dni) completed += 20;
    if (documents.titulacion) completed += 15;
    return completed;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Completa tu Perfil</h1>
        <p className="text-muted-foreground">
          Para poder matricularte en cursos y recibir tu diploma, necesitamos que completes tus datos personales
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span>Progreso del perfil</span>
              <span className="font-medium">{completionPercentage()}%</span>
            </div>
            <Progress value={completionPercentage()} className="h-2" />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div 
            className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${
              step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
            onClick={() => setStep(1)}
          >
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">Datos Personales</span>
          </div>
          <div className="w-8 h-0.5 bg-border" />
          <div 
            className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${
              step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
            onClick={() => profile.dni_nie && setStep(2)}
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Documentación</span>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nombre Completo *
                </Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => handleProfileChange('full_name', e.target.value)}
                  placeholder="Tu nombre completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dni_nie" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  DNI/NIE *
                </Label>
                <Input
                  id="dni_nie"
                  value={profile.dni_nie}
                  onChange={(e) => handleProfileChange('dni_nie', e.target.value.toUpperCase())}
                  placeholder="12345678A"
                  maxLength={9}
                />
                <p className="text-xs text-muted-foreground">Necesario para emitir tu diploma</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  value={userEmail}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Teléfono *
                </Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  placeholder="+34 612 345 678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={profile.birth_date}
                  onChange={(e) => handleProfileChange('birth_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => handleProfileChange('address', e.target.value)}
                  placeholder="Calle, número, piso..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={profile.city}
                  onChange={(e) => handleProfileChange('city', e.target.value)}
                  placeholder="Madrid"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Código Postal</Label>
                <Input
                  id="postal_code"
                  value={profile.postal_code}
                  onChange={(e) => handleProfileChange('postal_code', e.target.value)}
                  placeholder="28001"
                  maxLength={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Provincia</Label>
                <Input
                  id="province"
                  value={profile.province}
                  onChange={(e) => handleProfileChange('province', e.target.value)}
                  placeholder="Madrid"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={saveProfile} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    Continuar
                    <FileText className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Documentación requerida</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Para validar tu matrícula y emitir tu diploma, necesitamos que subas tu DNI/NIE. 
                    La titulación previa es opcional pero recomendada.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* DNI Upload */}
              <Card className={`p-6 border-2 transition-all ${documents.dni ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' : 'border-dashed border-border'}`}>
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    documents.dni ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'
                  }`}>
                    {documents.dni ? (
                      <Check className="w-8 h-8 text-green-600" />
                    ) : (
                      <CreditCard className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <h4 className="font-semibold mb-2">DNI/NIE *</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sube una copia de tu documento de identidad (ambas caras)
                  </p>
                  {documents.dni ? (
                    <p className="text-sm text-green-600 font-medium">✓ Documento subido</p>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'dni');
                        }}
                        disabled={uploadingDni}
                      />
                      <Button variant="outline" disabled={uploadingDni} asChild>
                        <span>
                          {uploadingDni ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Subiendo...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Subir DNI/NIE
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                  )}
                </div>
              </Card>

              {/* Titulación Upload */}
              <Card className={`p-6 border-2 transition-all ${documents.titulacion ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' : 'border-dashed border-border'}`}>
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    documents.titulacion ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'
                  }`}>
                    {documents.titulacion ? (
                      <Check className="w-8 h-8 text-green-600" />
                    ) : (
                      <GraduationCap className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <h4 className="font-semibold mb-2">Titulación Previa</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Título académico previo (ESO, Bachillerato, FP, Universidad...)
                  </p>
                  {documents.titulacion ? (
                    <p className="text-sm text-green-600 font-medium">✓ Documento subido</p>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'titulacion_previa');
                        }}
                        disabled={uploadingTitulacion}
                      />
                      <Button variant="outline" disabled={uploadingTitulacion} asChild>
                        <span>
                          {uploadingTitulacion ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Subiendo...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Subir Titulación
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                  )}
                </div>
              </Card>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Volver a Datos
              </Button>
              <Button onClick={handleComplete} disabled={!documents.dni}>
                {documents.dni ? (
                  <>
                    Acceder al Campus
                    <Check className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  "Sube tu DNI para continuar"
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentProfileCompletion;
