import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FileSignature, Download, Check } from "lucide-react";

interface ContractSigningModalProps {
  open: boolean;
  onSigned: () => void;
  trainingCenterId: string;
  centerName: string;
}

const CONTRACT_VERSION = "1.0";

export default function ContractSigningModal({
  open,
  onSigned,
  trainingCenterId,
  centerName,
}: ContractSigningModalProps) {
  const [signerName, setSignerName] = useState("");
  const [signerDni, setSignerDni] = useState("");
  const [signerPosition, setSignerPosition] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedDataProcessing, setAcceptedDataProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatureData, setSignatureData] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const generateContractHTML = () => {
    const currentDate = new Date().toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return `
      <h1>CONDICIONES GENERALES CONTRATACIÓN DE CAMPUS TALENTCLOUD SOLUTION</h1>
      
      <p>De una parte, TalentCloud Solutions S.L., con CIF B-XXXXXXXX y domicilio en España (en adelante "TalentCloud").</p>
      
      <p>De otra parte, <strong>${signerName}</strong> con DNI/NIE: <strong>${signerDni}</strong>, en representación de <strong>${centerName}</strong> (en adelante "El Cliente"), en calidad de <strong>${signerPosition}</strong>.</p>
      
      <p>Reconociéndose previa y recíprocamente la capacidad legal necesaria y suficiente para la formalización y firma del presente contrato.</p>
      
      <h2>CLÁUSULAS</h2>
      
      <h3>PRIMERA - Objeto del Contrato</h3>
      <p>TalentCloud pone a disposición del Cliente una plataforma de formación online (Campus Virtual) compatible con las normas internacionales SCORM, personalizada con la imagen del Cliente, junto con un catálogo de cursos adaptados a los programas formativos del SEPE y Certificados de Profesionalidad.</p>
      
      <h3>SEGUNDA - Servicios Contratados</h3>
      <ol>
        <li>Uso de la plataforma de teleformación Campus TalentCloud</li>
        <li>Acceso a contenidos SCORM del catálogo según plan contratado</li>
        <li>Personalización del campus con imagen corporativa del Cliente</li>
        <li>Soporte técnico y actualizaciones de la plataforma</li>
      </ol>
      
      <h3>TERCERA - Condiciones Económicas</h3>
      <p>Las tarifas aplicables serán:</p>
      <ul>
        <li><strong>Alquiler Mensual:</strong> 500€/mes (sin compromiso)</li>
        <li><strong>Plan Trimestral:</strong> 400€/mes (compromiso 3 meses)</li>
        <li><strong>Tarifa Plana Anual:</strong> 350€/mes + IVA (compromiso 12 meses)</li>
      </ul>
      <p>Los cursos SCORM se licencian por separado según catálogo vigente.</p>
      
      <h3>CUARTA - Licencias de Contenidos</h3>
      <p>Los contenidos se ceden en forma de licencias de uso. Una licencia se activa al matricular un alumno en una acción formativa, con una duración de 180 días.</p>
      
      <h3>QUINTA - Propiedad Intelectual</h3>
      <p>La prestación de servicios no supone transmisión de derechos de explotación. El Cliente deberá respetar la integridad de las obras y no podrá modificarlas sin autorización escrita.</p>
      
      <h3>SEXTA - Responsabilidades del Cliente</h3>
      <p>El Cliente se compromete a:</p>
      <ol>
        <li>Hacer frente a responsabilidades derivadas del uso de contenido no licenciado por TalentCloud</li>
        <li>No sublicenciar ni redistribuir los contenidos</li>
        <li>Mantener actualizados sus datos de contacto y facturación</li>
      </ol>
      
      <h3>SÉPTIMA - Protección de Datos</h3>
      <p>Conforme al RGPD y la LOPDGDD, TalentCloud actuará como encargado del tratamiento y el Cliente como responsable. Los datos de alumnos se tratarán exclusivamente para la finalidad de formación.</p>
      
      <h3>OCTAVA - Impago</h3>
      <p>En caso de impago, se suspenderán los servicios hasta regularización. La persistencia de la deuda conllevará resolución del contrato.</p>
      
      <h3>NOVENA - Vigencia</h3>
      <p>El contrato tiene vigencia según el plan contratado, prorrogable automáticamente. Para resolver el contrato, se requiere comunicación con 90 días de antelación.</p>
      
      <h3>DÉCIMA - Jurisdicción</h3>
      <p>Las cuestiones litigiosas quedarán sometidas a los Juzgados y Tribunales de España.</p>
      
      <hr/>
      
      <p><strong>Fecha de firma:</strong> ${currentDate}</p>
      <p><strong>Firmado electrónicamente por:</strong> ${signerName}</p>
      <p><strong>DNI/NIE:</strong> ${signerDni}</p>
      <p><strong>En representación de:</strong> ${centerName}</p>
      <p><strong>Cargo:</strong> ${signerPosition}</p>
      <p><strong>Email:</strong> ${signerEmail}</p>
      <p><strong>Versión del contrato:</strong> ${CONTRACT_VERSION}</p>
    `;
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    setSignatureData("");
  };

  const handleSign = async () => {
    if (!signerName || !signerDni || !signerPosition || !signerEmail) {
      toast.error("Por favor, complete todos los campos obligatorios");
      return;
    }

    if (!acceptedTerms || !acceptedDataProcessing) {
      toast.error("Debe aceptar todas las condiciones para continuar");
      return;
    }

    if (!signatureData) {
      toast.error("Por favor, firme en el recuadro de firma");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const contractContent = generateContractHTML();

      const { error } = await supabase.from("center_contracts").insert({
        training_center_id: trainingCenterId,
        signed_by: user.id,
        signer_name: signerName,
        signer_dni: signerDni,
        signer_position: signerPosition,
        signer_email: signerEmail,
        contract_type: "general",
        contract_version: CONTRACT_VERSION,
        signature_data: signatureData,
        contract_content: contractContent,
        user_agent: navigator.userAgent,
        metadata: {
          accepted_terms: acceptedTerms,
          accepted_data_processing: acceptedDataProcessing,
          signed_at_local: new Date().toISOString(),
        },
      });

      if (error) throw error;

      toast.success("Contrato firmado correctamente");
      onSigned();
    } catch (error: any) {
      console.error("Error signing contract:", error);
      toast.error("Error al firmar el contrato: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="w-5 h-5" />
            Condiciones Generales de Contratación - Campus TalentCloud
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Contract Content */}
          <ScrollArea className="h-[60vh] border rounded-lg p-4">
            <div className="prose prose-sm max-w-none">
              <h2 className="text-lg font-bold text-center mb-4">
                CONDICIONES GENERALES CONTRATACIÓN DE CAMPUS TALENTCLOUD SOLUTION
              </h2>
              
              <p className="text-sm">
                De una parte, <strong>TalentCloud Solutions S.L.</strong>, con domicilio en España (en adelante "TalentCloud").
              </p>
              
              <p className="text-sm">
                De otra parte, el representante de <strong>{centerName || "[Centro de Formación]"}</strong> (en adelante "El Cliente").
              </p>

              <h3 className="text-base font-semibold mt-4">PRIMERA - Objeto del Contrato</h3>
              <p className="text-sm">
                TalentCloud pone a disposición del Cliente una plataforma de formación online (Campus Virtual) 
                compatible con las normas internacionales SCORM, personalizada con la imagen del Cliente, 
                junto con un catálogo de cursos adaptados a los programas formativos del SEPE y Certificados de Profesionalidad.
              </p>

              <h3 className="text-base font-semibold mt-4">SEGUNDA - Servicios Contratados</h3>
              <ol className="text-sm list-decimal pl-5">
                <li>Uso de la plataforma de teleformación Campus TalentCloud</li>
                <li>Acceso a contenidos SCORM del catálogo según plan contratado</li>
                <li>Personalización del campus con imagen corporativa del Cliente</li>
                <li>Soporte técnico y actualizaciones de la plataforma</li>
              </ol>

              <h3 className="text-base font-semibold mt-4">TERCERA - Condiciones Económicas</h3>
              <p className="text-sm">Las tarifas aplicables serán:</p>
              <ul className="text-sm list-disc pl-5">
                <li><strong>Alquiler Mensual:</strong> 500€/mes (sin compromiso)</li>
                <li><strong>Plan Trimestral:</strong> 400€/mes (compromiso 3 meses)</li>
                <li><strong>Tarifa Plana Anual:</strong> 350€/mes + IVA (compromiso 12 meses)</li>
              </ul>

              <h3 className="text-base font-semibold mt-4">CUARTA - Licencias de Contenidos</h3>
              <p className="text-sm">
                Los contenidos se ceden en forma de licencias de uso. Una licencia se activa al matricular 
                un alumno en una acción formativa, con una duración de 180 días.
              </p>

              <h3 className="text-base font-semibold mt-4">QUINTA - Propiedad Intelectual</h3>
              <p className="text-sm">
                La prestación de servicios no supone transmisión de derechos de explotación. 
                El Cliente deberá respetar la integridad de las obras y no podrá modificarlas sin autorización escrita.
              </p>

              <h3 className="text-base font-semibold mt-4">SEXTA - Responsabilidades del Cliente</h3>
              <ol className="text-sm list-decimal pl-5">
                <li>Hacer frente a responsabilidades derivadas del uso de contenido no licenciado</li>
                <li>No sublicenciar ni redistribuir los contenidos</li>
                <li>Mantener actualizados sus datos de contacto y facturación</li>
              </ol>

              <h3 className="text-base font-semibold mt-4">SÉPTIMA - Protección de Datos</h3>
              <p className="text-sm">
                Conforme al RGPD y la LOPDGDD, TalentCloud actuará como encargado del tratamiento 
                y el Cliente como responsable. Los datos de alumnos se tratarán exclusivamente para la finalidad de formación.
              </p>

              <h3 className="text-base font-semibold mt-4">OCTAVA - Impago</h3>
              <p className="text-sm">
                En caso de impago, se suspenderán los servicios hasta regularización. 
                La persistencia de la deuda conllevará resolución del contrato.
              </p>

              <h3 className="text-base font-semibold mt-4">NOVENA - Vigencia</h3>
              <p className="text-sm">
                El contrato tiene vigencia según el plan contratado, prorrogable automáticamente. 
                Para resolver el contrato, se requiere comunicación con 90 días de antelación.
              </p>

              <h3 className="text-base font-semibold mt-4">DÉCIMA - Jurisdicción</h3>
              <p className="text-sm">
                Las cuestiones litigiosas quedarán sometidas a los Juzgados y Tribunales de España.
              </p>
            </div>
          </ScrollArea>

          {/* Signing Form */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="signerName">Nombre completo del firmante *</Label>
                <Input
                  id="signerName"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Nombre y apellidos"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signerDni">DNI/NIE *</Label>
                <Input
                  id="signerDni"
                  value={signerDni}
                  onChange={(e) => setSignerDni(e.target.value)}
                  placeholder="12345678A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signerPosition">Cargo/Posición *</Label>
                <Input
                  id="signerPosition"
                  value={signerPosition}
                  onChange={(e) => setSignerPosition(e.target.value)}
                  placeholder="Administrador, Director, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signerEmail">Email de contacto *</Label>
                <Input
                  id="signerEmail"
                  type="email"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  placeholder="email@ejemplo.com"
                />
              </div>
            </div>

            {/* Signature Pad */}
            <div className="space-y-2">
              <Label>Firma digital *</Label>
              <div className="border-2 border-dashed rounded-lg p-2 bg-white">
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={100}
                  className="w-full border rounded cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSignature}
                  className="mt-1"
                >
                  Limpiar firma
                </Button>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                />
                <Label htmlFor="acceptTerms" className="text-sm leading-tight">
                  He leído y acepto las Condiciones Generales de Contratación del Campus TalentCloud *
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptDataProcessing"
                  checked={acceptedDataProcessing}
                  onCheckedChange={(checked) => setAcceptedDataProcessing(checked as boolean)}
                />
                <Label htmlFor="acceptDataProcessing" className="text-sm leading-tight">
                  Acepto el tratamiento de datos conforme al RGPD y autorizo a TalentCloud como encargado del tratamiento *
                </Label>
              </div>
            </div>

            <Button
              onClick={handleSign}
              disabled={isSubmitting || !acceptedTerms || !acceptedDataProcessing || !signatureData}
              className="w-full"
            >
              {isSubmitting ? (
                "Firmando..."
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Firmar Contrato
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Al firmar, acepta que esta firma electrónica tiene validez legal según el Reglamento eIDAS
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
