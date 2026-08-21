import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import CalendarVisual from "./pages/CalendarVisual";
import EditorialReview from "./pages/EditorialReview";
import Home from "./pages/Home";

function Workspace({ section }: { section: "overview" | "library" | "calendar" | "cleanup" }) {
  return <DashboardLayout><Home section={section} /></DashboardLayout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Workspace section="overview" />} />
      <Route path="/biblioteca" component={() => <Workspace section="library" />} />
      <Route path="/revision-editorial" component={() => <DashboardLayout><EditorialReview /></DashboardLayout>} />
      <Route path="/calendario" component={() => <DashboardLayout><CalendarVisual /></DashboardLayout>} />
      <Route path="/limpieza" component={() => <Workspace section="cleanup" />} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
