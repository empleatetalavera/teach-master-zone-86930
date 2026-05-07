import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sun, Moon, Monitor, Palette, Type } from "lucide-react";
import { useUserPreferences, AccentColor, ThemeMode } from "@/hooks/useUserPreferences";

const ACCENTS: { id: AccentColor; label: string; className: string }[] = [
  { id: "teal", label: "Turquesa", className: "bg-teal-500" },
  { id: "blue", label: "Azul", className: "bg-blue-500" },
  { id: "green", label: "Verde", className: "bg-green-500" },
  { id: "purple", label: "Púrpura", className: "bg-purple-500" },
  { id: "orange", label: "Naranja", className: "bg-orange-500" },
  { id: "rose", label: "Rosa", className: "bg-rose-500" },
];

const THEMES: { id: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { id: "light", label: "Claro", Icon: Sun },
  { id: "dark", label: "Oscuro", Icon: Moon },
  { id: "system", label: "Sistema", Icon: Monitor },
];

export function UserPreferencesPanel() {
  const { prefs, update } = useUserPreferences();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Personalizar entorno de aprendizaje
        </CardTitle>
        <CardDescription>
          Ajusta el ambiente del campus a tu gusto. Los cambios se aplican al instante y se guardan en tu perfil.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium mb-3 block">Tema</Label>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map(({ id, label, Icon }) => (
              <Button
                key={id}
                variant={prefs.theme === id ? "default" : "outline"}
                onClick={() => update({ theme: id })}
                className="flex-col h-auto py-3 gap-1"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">Color de acento</Label>
          <div className="flex flex-wrap gap-3">
            {ACCENTS.map(({ id, label, className }) => (
              <button
                key={id}
                onClick={() => update({ accentColor: id })}
                title={label}
                aria-label={label}
                className={`h-10 w-10 rounded-full ${className} ring-offset-background transition-all hover:scale-110 ${
                  prefs.accentColor === id ? "ring-2 ring-foreground ring-offset-2" : ""
                }`}
              />
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 flex items-center gap-2">
            <Type className="h-4 w-4" />
            Tamaño de fuente: {Math.round(prefs.fontScale * 100)}%
          </Label>
          <Slider
            value={[prefs.fontScale]}
            min={0.85}
            max={1.5}
            step={0.05}
            onValueChange={([v]) => update({ fontScale: v })}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>A-</span>
            <span>Normal</span>
            <span>A+</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
