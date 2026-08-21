import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, ClipboardCheck, Clapperboard, FileClock, FolderHeart, Loader2 } from "lucide-react";

function isPreviewable(mimeType: string) {
  return mimeType.startsWith("image/") && !mimeType.includes("heic");
}

export default function EditorialReview() {
  const { data, isLoading } = trpc.media.dashboard.useQuery(undefined, { retry: false });

  if (isLoading) {
    return <div className="grid min-h-[75vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-[#203d37]" /></div>;
  }

  const assets = data?.assets ?? [];
  const projects = data?.projects ?? [];
  const work = assets.filter(asset => asset.category === "Trabajos de Geo Carpentry");
  const unassigned = work.filter(asset => !asset.projectId);
  const pending = work.filter(asset => asset.reviewStatus === "Pendiente");
  const stages = ["Antes", "Durante", "Después"] as const;

  return <div className="mx-auto max-w-7xl space-y-7">
    <header className="border-b border-stone-300 pb-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9c6b20]">Espacio no publicable</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight text-[#203d37] md:text-5xl">Revisión editorial de obra</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Revisa los medios de trabajo antes de asignarlos a un proyecto, una etapa o un borrador. Esta vista no crea publicaciones, no aprueba limpieza y no modifica tus medios.</p>
    </header>

    <section className="grid gap-4 sm:grid-cols-3">
      <Metric icon={FolderHeart} label="Medios de trabajo" value={work.length} note="listos para revisión" />
      <Metric icon={FileClock} label="Sin proyecto" value={unassigned.length} note="sin asignación automática" />
      <Metric icon={CheckCircle2} label="Pendientes" value={pending.length} note="sin aprobación editorial" />
    </section>

    <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <Card className="border-stone-200 shadow-sm">
        <CardHeader><CardTitle className="flex items-center gap-2 font-serif text-2xl text-[#203d37]"><ClipboardCheck className="h-5 w-5 text-[#b77a21]" />Medios para revisar</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {work.slice(0, 24).map(asset => <article key={asset.id} className="overflow-hidden rounded-xl border border-stone-200 bg-white">
              <div className="h-28 bg-stone-100">{isPreviewable(asset.mimeType) ? <img src={asset.storageUrl} alt={asset.originalFilename} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-stone-400"><Clapperboard className="h-7 w-7" /></div>}</div>
              <div className="space-y-2 p-3"><p className="truncate text-sm font-semibold text-[#203d37]">{asset.originalFilename}</p><div className="flex flex-wrap gap-1"><Badge variant="outline" className="text-[10px]">{asset.projectId ? "Proyecto asignado" : "Sin proyecto"}</Badge><Badge variant="outline" className="text-[10px]">{asset.stage ?? "Sin etapa"}</Badge><Badge variant="outline" className="text-[10px]">{asset.reviewStatus}</Badge></div></div>
            </article>)}
          </div>
          {work.length > 24 && <p className="mt-5 text-center text-sm text-stone-500">Se muestran los primeros 24 de {work.length}. Usa Biblioteca para asignar manualmente proyecto y etapa.</p>}
        </CardContent>
      </Card>
      <div className="space-y-5">
        <Card className="border-stone-200"><CardHeader><CardTitle className="font-serif text-2xl text-[#203d37]">Etapas confirmadas</CardTitle></CardHeader><CardContent className="space-y-3">{stages.map(stage => <div key={stage} className="flex items-center justify-between border-b border-stone-100 pb-3 text-sm last:border-0"><span className="text-stone-600">{stage}</span><Badge className="bg-stone-100 text-stone-700 hover:bg-stone-100">{work.filter(asset => asset.stage === stage).length}</Badge></div>)}<p className="pt-2 text-xs leading-5 text-stone-500">Las etapas sin evidencia visual se mantienen vacías para revisión manual.</p></CardContent></Card>
        <Card className="border-[#e7d7b6] bg-[#fffaf0]"><CardHeader><CardTitle className="font-serif text-xl text-[#5d4318]">Proyectos reales</CardTitle></CardHeader><CardContent className="space-y-3">{projects.length ? projects.map(project => <div key={project.id} className="rounded-xl border border-[#eadcbf] bg-white/70 p-3"><p className="font-medium text-[#5d4318]">{project.name}</p><p className="mt-1 text-xs text-[#735925]">Asigna medios solo después de confirmar que pertenecen a esta obra.</p></div>) : <p className="text-sm leading-6 text-[#735925]">Aún no hay proyectos reales registrados.</p>}<p className="border-t border-[#eadcbf] pt-3 text-xs leading-5 text-[#735925]">No se generan publicaciones ni borradores desde esta vista.</p></CardContent></Card>
      </div>
    </section>
  </div>;
}

function Metric({ icon: Icon, label, value, note }: { icon: typeof FolderHeart; label: string; value: number; note: string }) {
  return <Card className="border-stone-200 bg-white shadow-sm"><CardContent className="p-5"><Icon className="h-5 w-5 text-[#b77a21]" /><p className="mt-5 text-3xl font-semibold tracking-tight text-[#203d37]">{value}</p><p className="mt-1 font-medium text-stone-700">{label}</p><p className="mt-1 text-xs leading-5 text-stone-500">{note}</p></CardContent></Card>;
}
