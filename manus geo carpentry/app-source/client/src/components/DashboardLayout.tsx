import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { CalendarDays, ClipboardCheck, FolderHeart, LayoutDashboard, LogOut, PanelLeft, ShieldCheck } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const menuItems = [
  { icon: LayoutDashboard, label: "Resumen", path: "/" },
  { icon: FolderHeart, label: "Biblioteca", path: "/biblioteca" },
  { icon: ClipboardCheck, label: "Revisión editorial", path: "/revision-editorial" },
  { icon: CalendarDays, label: "Calendario", path: "/calendario" },
  { icon: ShieldCheck, label: "Limpieza", path: "/limpieza" },
];

const SIDEBAR_WIDTH_KEY = "media-agent-sidebar-width";
const DEFAULT_WIDTH = 272;
const MIN_WIDTH = 210;
const MAX_WIDTH = 410;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem(SIDEBAR_WIDTH_KEY)) || DEFAULT_WIDTH);
  const { loading, user } = useAuth();
  useEffect(() => localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString()), [sidebarWidth]);
  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) return <div className="min-h-screen bg-[#f4f1ea] grid place-items-center p-6"><div className="w-full max-w-md rounded-[2rem] bg-white p-10 text-center shadow-xl shadow-stone-900/10"><div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#203d37] text-xl font-black text-[#f2c36b]">GC</div><h1 className="font-serif text-3xl text-[#203d37]">Tu archivo, bajo control.</h1><p className="mt-3 text-sm leading-6 text-stone-600">Inicia sesión para gestionar y proteger la biblioteca privada de Geo Carpentry.</p><Button onClick={() => startLogin()} className="mt-7 w-full bg-[#203d37] text-white hover:bg-[#15302b]">Iniciar sesión</Button></div></div>;
  return <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}><DashboardShell setSidebarWidth={setSidebarWidth}>{children}</DashboardShell></SidebarProvider>;
}

function DashboardShell({ children, setSidebarWidth }: { children: React.ReactNode; setSidebarWidth: (value: number) => void }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  useEffect(() => {
    const move = (event: MouseEvent) => { if (!isResizing) return; const left = sidebarRef.current?.getBoundingClientRect().left ?? 0; const width = event.clientX - left; if (width >= MIN_WIDTH && width <= MAX_WIDTH) setSidebarWidth(width); };
    const up = () => setIsResizing(false);
    document.addEventListener("mousemove", move); document.addEventListener("mouseup", up);
    return () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
  }, [isResizing, setSidebarWidth]);
  return <><div className="relative" ref={sidebarRef}><Sidebar style={{ "--sidebar": "#203d37", "--sidebar-foreground": "#edf4ee", "--sidebar-accent": "#315a51", "--sidebar-accent-foreground": "#ffffff", "--sidebar-primary": "#f2c36b", "--sidebar-primary-foreground": "#203d37", "--sidebar-border": "#294a42" } as CSSProperties} className="border-r border-[#294a42] bg-[#203d37] text-stone-100"><SidebarHeader className="h-24 justify-center px-4"><button onClick={() => setLocation("/")} className="flex items-center gap-3 text-left"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f2c36b] font-black text-[#203d37]">GC</span><span><span className="block font-serif text-lg leading-none">Media Agent</span><span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c9d7cf]">Geo Carpentry</span></span></button></SidebarHeader><SidebarContent className="px-3"><SidebarMenu>{menuItems.map(item => <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={location === item.path} onClick={() => setLocation(item.path)} tooltip={item.label} className="mt-1 h-11 text-stone-200 hover:bg-white/10 hover:text-white data-[active=true]:bg-[#f2c36b] data-[active=true]:text-[#203d37]"><item.icon className="h-4 w-4" /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu><div className="mt-7 rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-[#d7e2dc]"><p className="font-semibold text-white">Protección activa</p><p className="mt-1">Los originales se guardan antes de generar revisiones o exportaciones.</p></div></SidebarContent><SidebarFooter className="p-4"><DropdownMenu><DropdownMenuTrigger asChild><button className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-white/10"><Avatar className="h-9 w-9 border border-white/20"><AvatarFallback className="bg-[#315a51] text-xs text-white">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0"><p className="truncate text-sm font-medium">{user?.name || "Propietario"}</p><p className="truncate text-xs text-[#c9d7cf]">Archivo privado</p></div></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={logout} className="text-destructive"><LogOut className="mr-2 h-4 w-4" />Cerrar sesión</DropdownMenuItem></DropdownMenuContent></DropdownMenu></SidebarFooter></Sidebar><div className="absolute right-0 top-0 h-full w-1 cursor-col-resize" onMouseDown={() => setIsResizing(true)} /></div><SidebarInset className="bg-[#f4f1ea]">{isMobile && <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-[#f4f1ea]/95 px-3 backdrop-blur"><SidebarTrigger /><span className="font-serif text-lg text-[#203d37]">Geo Carpentry Media</span></header>}<main className="min-h-screen p-4 md:p-8">{children}</main></SidebarInset></>;
}
