import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import NewPatient from "./pages/NewPatient";
import Consultation from "./pages/Consultation";
import ConsultationDetail from "./pages/ConsultationDetail";
import Clari from "./pages/Clari";
import Documents from "./pages/Documents";
import Features from "./pages/Features";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Plans from "./pages/Plans";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/patients" component={Patients} />
      <Route path="/patients/new" component={NewPatient} />
      <Route path="/patients/:id" component={PatientDetail} />
      <Route path="/consultation/new" component={Consultation} />
      <Route path="/consultation/:id" component={ConsultationDetail} />
      <Route path="/clari" component={Clari} />
      <Route path="/documents" component={Documents} />
      <Route path="/funcionalidades" component={Features} />
      <Route path="/privacidade" component={Privacy} />
      <Route path="/termos" component={Terms} />
      <Route path="/contato" component={Contact} />
      <Route path="/planos" component={Plans} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster position="top-right" richColors />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
