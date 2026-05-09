import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Download } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  filePath?: string | null;
  externalUrl?: string | null;
  kind: "video" | "pdf" | "auto";
}

export function ResourcePreviewDialog({ open, onOpenChange, title, filePath, externalUrl, kind }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let revoke: string | null = null;
    if (!open) { setUrl(null); return; }
    (async () => {
      try {
        setLoading(true);
        if (externalUrl) { setUrl(externalUrl); return; }
        if (!filePath) return;
        const { data, error } = await supabase.storage.from("module-content").createSignedUrl(filePath, 3600);
        if (error) throw error;
        const blob = await (await fetch(data.signedUrl)).blob();
        const objUrl = URL.createObjectURL(blob);
        revoke = objUrl;
        setUrl(objUrl);
      } finally {
        setLoading(false);
      }
    })();
    return () => { if (revoke) URL.revokeObjectURL(revoke); };
  }, [open, filePath, externalUrl]);

  const isVideo = kind === "video" || (kind === "auto" && /\.(mp4|webm|ogg|mov)(\?|$)/i.test(filePath || externalUrl || ""));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b shrink-0">
          <DialogTitle className="flex items-center justify-between gap-2">
            <span className="truncate">{title}</span>
            {url && (
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1" />Abrir</a>
                </Button>
                {!externalUrl && (
                  <Button asChild variant="outline" size="sm">
                    <a href={url} download={title}><Download className="h-3.5 w-3.5 mr-1" />Descargar</a>
                  </Button>
                )}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 bg-muted/30 overflow-hidden">
          {loading && <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin" /></div>}
          {!loading && url && (
            isVideo ? (
              <video src={url} controls className="w-full h-full bg-black" />
            ) : (
              <iframe src={url} title={title} className="w-full h-full border-0" />
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
