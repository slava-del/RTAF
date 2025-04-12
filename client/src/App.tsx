import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CompanyPage from "@/pages/company-page";
import ResidentsPage from "@/pages/residents-page";
import FieldSelectionPage from "@/pages/field-selection-page";
import PrePaymentPage from "@/pages/pre-payment-page";
import FormSubmissionPage from "@/pages/form-submission-page";
import ReceivedDocumentsPage from "@/pages/received-documents-page";
import { ProtectedRoute } from "./lib/protected-route";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/company" component={CompanyPage} />
      <ProtectedRoute path="/residents" component={ResidentsPage} />
      <ProtectedRoute path="/field-selection" component={FieldSelectionPage} />
      <ProtectedRoute path="/pre-payment" component={PrePaymentPage} />
      <ProtectedRoute path="/form-submission" component={FormSubmissionPage} />
      <ProtectedRoute path="/received-documents" component={ReceivedDocumentsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
