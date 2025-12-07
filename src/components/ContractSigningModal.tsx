import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FileSignature, Check } from "lucide-react";

interface ContractSigningModalProps {
  open: boolean;
  onSigned: () => void;
  onSkip?: () => void;
  trainingCenterId: string;
  centerName: string;
}

const CONTRACT_VERSION = "1.0";

type PlanType = "mensual" | "trimestral" | "anual" | "anual_contenido";

const PLANS = {
  mensual: {
    name: "Alquiler Mensual",
    price: "500€/mes",
    commitment: "Sin compromiso de permanencia",
    description: "Solo plataforma"
  },
  trimestral: {
    name: "Plan Trimestral",
    price: "400€/mes",
    commitment: "Compromiso mínimo 3 meses",
    description: "Solo plataforma"
  },
  anual: {
    name: "Tarifa Plana Anual",
    price: "350€/mes + IVA",
    commitment: "Compromiso mínimo 12 meses",
    description: "Solo plataforma"
  },
  anual_contenido: {
    name: "Tarifa Plana Anual + Contenido",
    price: "450€/mes + IVA",
    commitment: "Compromiso mínimo 12 meses",
    description: "Plataforma + Acceso ilimitado a catálogo SCORM"
  }
};

export default function ContractSigningModal({
  open,
  onSigned,
  onSkip,
  trainingCenterId,
  centerName,
}: ContractSigningModalProps) {
  const [signerName, setSignerName] = useState("");
  const [signerDni, setSignerDni] = useState("");
  const [signerPosition, setSignerPosition] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("anual");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedDataProcessing, setAcceptedDataProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatureData, setSignatureData] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const plan = PLANS[selectedPlan];

  const generateContractHTML = () => {
    const currentDate = new Date().toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return `
      <h1>CONDICIONES GENERALES CONTRATACIÓN DE CAMPUS TALENTCLOUD SOLUTION</h1>
      
      <p>Las presentes cláusulas aplicarán con carácter general a la contratación de la plataforma virtual de aprendizaje online, en adelante Campus TalentCloud.</p>
      
      <p>De una parte, <strong>TalentCloud Solutions S.L.</strong>, con domicilio en España (en adelante "TalentCloud").</p>
      
      <p>De otra parte, <strong>${signerName}</strong> con DNI/NIE: <strong>${signerDni}</strong>, en representación de <strong>${centerName}</strong> (en adelante "El Cliente"), en calidad de <strong>${signerPosition}</strong>.</p>
      
      <p>Reconociéndose previa y recíprocamente la capacidad legal necesaria y suficiente para la formalización y firma del presente contrato.</p>
      
      <h2>PLAN CONTRATADO</h2>
      <p><strong>${plan.name}</strong> - ${plan.price}</p>
      <p>${plan.commitment}</p>
      <p>${plan.description}</p>
      
      <h2>CLÁUSULAS</h2>
      
      <h3>I. Objeto del Contrato</h3>
      <p>TalentCloud es distribuidor autorizado de Campus TalentCloud, compatible con las normas internacionales SCORM y de un amplio catálogo de cursos. Así como contenidos que han sido adaptados a los programas formativos del Fichero de Especialidades Formativas del SEPE u Organismos autonómicos competentes, Certificados de Profesionalidad entre otros.</p>
      
      <h3>II. Plataforma y Personalización</h3>
      <p>TalentCloud pone a disposición del Cliente una plataforma de formación online personalizada con su imagen, de la que se le facilitarán datos de administración para la gestión de la misma${selectedPlan === 'anual_contenido' ? ', junto con acceso ilimitado al catálogo de cursos SCORM' : ''}.</p>
      
      <h3>III. Propiedad Intelectual</h3>
      <p>En ningún caso la prestación de los servicios contratados por el Cliente supone la transmisión de la titularidad de los derechos de explotación que ostenta TalentCloud. El alcance de la colaboración se circunscribe a la impartición de títulos de contenidos respetando en todo momento la integridad de la obra. Para cualquier modificación de la misma por parte del Cliente se deberá contar con la autorización escrita de TalentCloud.</p>
      
      <h3>IV. Licencias de Contenidos</h3>
      ${selectedPlan === 'anual_contenido' 
        ? '<p>El Cliente tiene acceso ilimitado al catálogo de contenidos SCORM durante la vigencia del contrato.</p>' 
        : '<p>Si el Cliente hace uso de un contenido del catálogo de TalentCloud, los mismos se ceden en forma de licencias de uso, entendiendo que se activa una licencia en el momento de matriculación de un alumno en un grupo formativo, y la duración de dicha licencia activa es de 180 días.</p>'}
      
      <h3>V. Acreditaciones</h3>
      <p>Para solicitar cualquier acreditación sobre Certificados de Profesionalidad ante terceros, el Cliente deberá contar con autorización expresa de TalentCloud, salvo que en las condiciones particulares se indique otras condiciones.</p>
      
      <h3>VI. Responsabilidades del Cliente</h3>
      <p>El Cliente se compromete a hacer frente ante terceros de aquellas responsabilidades que fueran exigibles derivadas del uso de su plataforma de formación online. Especialmente de aquel contenido que no fuese licenciado por TalentCloud.</p>
      
      <h3>VII. Condiciones Económicas</h3>
      <p>El plan contratado es: <strong>${plan.name}</strong></p>
      <p>Precio: <strong>${plan.price}</strong></p>
      <p>${plan.commitment}</p>
      <p>Para la activación del servicio, los pagos se realizarán mediante transferencia bancaria a la cuenta: <strong>ES14 0182 0861 6802 0169 9387 (BBVA)</strong></p>
      <p>Para realizar el ingreso se debe indicar claramente el nombre del cliente.</p>
      ${selectedPlan !== 'anual_contenido' ? '<p>Los cursos SCORM se licencian por separado según catálogo vigente.</p>' : ''}
      
      <h3>VIII. Contenidos de Terceros</h3>
      <p>En el Campus TalentCloud se podrán impartir acciones formativas no pertenecientes a TalentCloud, cuyo alojamiento se facturará según las condiciones específicas.</p>
      <p>El Cliente puede subir contenido de terceros al Campus TalentCloud y reconoce tener todos los derechos de explotación necesarios para realizar esa acción y posteriores, eximiendo a TalentCloud de cualquier incidencia que pueda surgir con ese contenido.</p>
      
      <h3>IX. Demos y Usuarios de Prueba</h3>
      <p>Para el uso de demos, el Cliente deberá utilizar el usuario de alumno que se le facilita en el momento de la provisión del campus, facturándose el resto de alumnos matriculados independientemente del uso de los mismos.</p>
      
      <h3>X. Facturación y Pago</h3>
      <p>Los consumos o gastos que se realicen en aplicación de este contrato serán facturados por TalentCloud al Cliente, teniendo como forma de pago la domiciliación bancaria o transferencia.</p>
      <p>En el caso de contratación de nuevos servicios, estos deberán ser abonados antes de su provisión para la puesta en marcha del servicio.</p>
      
      <h3>XI. Irregularidades</h3>
      <p>En caso de detectar cualquier irregularidad en el uso de los perfiles facilitados, TalentCloud facturará las cantidades no cobradas en su caso, y habilitará a TalentCloud para la resolución unilateral del convenio.</p>
      
      <h3>XII. Impago</h3>
      <p>En caso de impago de los servicios prestados por TalentCloud, se suspenderán todos los servicios al Cliente hasta la regularización de la deuda contraída. Esta suspensión será comunicada al Cliente antes de su ejecución.</p>
      <p>En el momento en que se regularice esta situación, los servicios serán restaurados nuevamente. En caso de persistir la deuda, se resolverá este contrato y todas las obligaciones que emanan de él para TalentCloud.</p>
      <p>Esta resolución del contrato no evita que TalentCloud tome las medidas oportunas y legalmente establecidas para cobrar las deudas contraídas desde el primer momento.</p>
      
      <h3>XIII. Devolución de Recibos</h3>
      <p>En caso de devolución de recibos, TalentCloud repercutirá el coste de devolución y los gastos de gestión al Cliente para continuar con el servicio.</p>
      
      <h3>XIV. Modificación de Condiciones</h3>
      <p>TalentCloud se reserva el derecho de modificar las presentes condiciones generales de contratación de Campus TalentCloud. Con carácter previo a la aplicación de las nuevas condiciones, TalentCloud comunicará dichos cambios al Cliente, teniendo éste un plazo de 3 días hábiles para comunicar la NO aceptación de las mismas, lo que conllevará la resolución anticipada del presente acuerdo.</p>
      
      <h3>XV. Vigencia del Contrato</h3>
      <p>El presente contrato, salvo que venga recogido en sus condiciones particulares, tiene una vigencia según el plan contratado (${plan.commitment}), prorrogable de forma automática por periodos iguales.</p>
      <p>Para resolver el presente contrato, la parte que quiera rescindir deberá comunicarlo a la otra con una antelación mínima de 90 días antes de la renovación.</p>
      
      <h3>XVI. Baja Anticipada</h3>
      <p>En los casos de baja anticipada del servicio antes del vencimiento del contrato, implicará la aplicación de una penalización única que vendrá reflejada en las cláusulas específicas.</p>
      
      <h3>XVII. Cesión de Derechos</h3>
      <p>El Cliente consiente en este acto la cesión, total o parcial, de cualesquiera derechos u obligaciones titularidad de TalentCloud, derivados del presente contrato, siempre que tal cesión no altere en forma alguna los citados derechos u obligaciones según corresponda a los que obliga el presente contrato. TalentCloud notificará al Cliente tal cesión.</p>
      
      <h3>XVIII. Jurisdicción</h3>
      <p>Las cuestiones litigiosas a que pudiera dar lugar la interpretación y cumplimiento del presente Contrato quedarán sometidas a la jurisdicción de los Jueces y Tribunales de España.</p>
      
      <h3>XIX. Protección de Datos</h3>
      <p>Con arreglo a la Ley Orgánica 3/2018 de 5 de diciembre de Protección de Datos de Carácter Personal y Garantía de los Derechos Digitales, TalentCloud como encargado del tratamiento, y el Cliente como responsable, mantienen que la efectiva realización del presente contrato implica la necesidad de que ambas partes traten los datos personales de los alumnos con la finalidad indicada a lo largo del contrato de tratamiento de datos que se anexa al presente contrato de prestación de servicios.</p>
      
      <h3>XX. Subencargados del Tratamiento</h3>
      <p>En el marco del cumplimiento de las obligaciones contractuales, el encargado del tratamiento tendrá derecho a emplear los siguientes subencargados:</p>
      <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
        <tr><th>#</th><th>Nombre</th><th>Ámbito de aplicación</th></tr>
        <tr><td>1</td><td>Lovable Cloud Infrastructure</td><td>Hosting y operación de la plataforma</td></tr>
      </table>
      
      <hr/>
      
      <h3>XXI. Firma y Conformidad</h3>
      <p>En prueba de conformidad, se firma el presente contrato electrónicamente a través de la plataforma TalentCloud.</p>
      
      <p><strong>Plan contratado:</strong> ${plan.name} - ${plan.price}</p>
      <p><strong>Fecha de firma:</strong> ${currentDate}</p>
      <p><strong>Firmado electrónicamente por:</strong> ${signerName}</p>
      <p><strong>DNI/NIE:</strong> ${signerDni}</p>
      <p><strong>En representación de:</strong> ${centerName}</p>
      <p><strong>Cargo:</strong> ${signerPosition}</p>
      <p><strong>Email:</strong> ${signerEmail}</p>
      <p><strong>Versión del contrato:</strong> ${CONTRACT_VERSION}</p>
      
      <p style="margin-top: 20px;"><em>Este contrato ha sido firmado electrónicamente y tiene plena validez legal conforme al Reglamento (UE) Nº 910/2014 (eIDAS).</em></p>
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
        contract_type: selectedPlan,
        contract_version: CONTRACT_VERSION,
        signature_data: signatureData,
        contract_content: contractContent,
        user_agent: navigator.userAgent,
        metadata: {
          accepted_terms: acceptedTerms,
          accepted_data_processing: acceptedDataProcessing,
          signed_at_local: new Date().toISOString(),
          plan_name: plan.name,
          plan_price: plan.price,
          plan_commitment: plan.commitment,
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
                Las presentes cláusulas aplicarán con carácter general a la contratación de la plataforma virtual de aprendizaje online, en adelante Campus TalentCloud.
              </p>
              
              <p className="text-sm">
                De una parte, <strong>TalentCloud Solutions S.L.</strong>, con domicilio en España (en adelante "TalentCloud").
              </p>
              
              <p className="text-sm">
                De otra parte, el representante de <strong>{centerName || "[Centro de Formación]"}</strong> (en adelante "El Cliente").
              </p>

              <h3 className="text-base font-semibold mt-4">I. Objeto del Contrato</h3>
              <p className="text-sm">
                TalentCloud es distribuidor autorizado de Campus TalentCloud, compatible con las normas internacionales SCORM y de un amplio catálogo de cursos adaptados a los programas formativos del Fichero de Especialidades Formativas del SEPE, Certificados de Profesionalidad entre otros.
              </p>

              <h3 className="text-base font-semibold mt-4">II. Plataforma y Personalización</h3>
              <p className="text-sm">
                TalentCloud pone a disposición del Cliente una plataforma de formación online personalizada con su imagen, de la que se le facilitarán datos de administración para la gestión de la misma.
              </p>

              <h3 className="text-base font-semibold mt-4">III. Propiedad Intelectual</h3>
              <p className="text-sm">
                En ningún caso la prestación de los servicios contratados supone la transmisión de la titularidad de los derechos de explotación. Para cualquier modificación se deberá contar con la autorización escrita de TalentCloud.
              </p>

              <h3 className="text-base font-semibold mt-4">IV. Licencias de Contenidos</h3>
              <p className="text-sm">
                Los contenidos se ceden en forma de licencias de uso. Una licencia se activa al matricular un alumno en una acción formativa, con una duración de 180 días.
              </p>

              <h3 className="text-base font-semibold mt-4">V. Condiciones Económicas</h3>
              <p className="text-sm">Las tarifas aplicables serán:</p>
              <ul className="text-sm list-disc pl-5">
                <li><strong>Alquiler Mensual:</strong> 500€/mes (sin compromiso)</li>
                <li><strong>Plan Trimestral:</strong> 400€/mes (compromiso 3 meses)</li>
                <li><strong>Tarifa Plana Anual:</strong> 350€/mes + IVA (compromiso 12 meses)</li>
                <li><strong>Tarifa Plana Anual + Contenido:</strong> 450€/mes + IVA (compromiso 12 meses, acceso ilimitado SCORM)</li>
              </ul>
              <p className="text-sm mt-2">
                <strong>Cuenta bancaria:</strong> ES14 0182 0861 6802 0169 9387 (BBVA)
              </p>

              <h3 className="text-base font-semibold mt-4">VI. Responsabilidades del Cliente</h3>
              <p className="text-sm">
                El Cliente se compromete a hacer frente ante terceros de aquellas responsabilidades derivadas del uso de su plataforma, especialmente del contenido no licenciado por TalentCloud.
              </p>

              <h3 className="text-base font-semibold mt-4">VII. Contenidos de Terceros</h3>
              <p className="text-sm">
                El Cliente puede subir contenido de terceros y reconoce tener todos los derechos necesarios, eximiendo a TalentCloud de cualquier incidencia.
              </p>

              <h3 className="text-base font-semibold mt-4">VIII. Impago</h3>
              <p className="text-sm">
                En caso de impago, se suspenderán los servicios hasta regularización. La persistencia de la deuda conllevará resolución del contrato.
              </p>

              <h3 className="text-base font-semibold mt-4">IX. Vigencia</h3>
              <p className="text-sm">
                El contrato tiene vigencia según el plan contratado, prorrogable automáticamente. Para resolver el contrato, se requiere comunicación con 90 días de antelación.
              </p>

              <h3 className="text-base font-semibold mt-4">X. Protección de Datos</h3>
              <p className="text-sm">
                Conforme al RGPD y la LOPDGDD, TalentCloud actuará como encargado del tratamiento y el Cliente como responsable.
              </p>

              <h3 className="text-base font-semibold mt-4">XI. Jurisdicción</h3>
              <p className="text-sm">
                Las cuestiones litigiosas quedarán sometidas a los Juzgados y Tribunales de España.
              </p>

              <p className="text-xs text-muted-foreground mt-4 italic">
                Documento completo disponible tras la firma. Este es un resumen de las cláusulas principales.
              </p>
            </div>
          </ScrollArea>

          {/* Signing Form */}
          <ScrollArea className="h-[60vh]">
          <div className="space-y-4 pr-4">
            {/* Plan Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Seleccione su plan *</Label>
              <RadioGroup
                value={selectedPlan}
                onValueChange={(value) => setSelectedPlan(value as PlanType)}
                className="space-y-2"
              >
                {Object.entries(PLANS).map(([key, planInfo]) => (
                  <div
                    key={key}
                    className={`flex items-start space-x-3 border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedPlan === key ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedPlan(key as PlanType)}
                  >
                    <RadioGroupItem value={key} id={key} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={key} className="font-medium cursor-pointer">
                        {planInfo.name}
                      </Label>
                      <p className="text-sm text-primary font-semibold">{planInfo.price}</p>
                      <p className="text-xs text-muted-foreground">{planInfo.commitment}</p>
                      <p className="text-xs text-muted-foreground">{planInfo.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

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

            {onSkip && (
              <Button
                type="button"
                variant="ghost"
                onClick={onSkip}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Continuar sin firmar (firmar más tarde)
              </Button>
            )}
          </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
