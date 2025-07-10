import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { PronounQuizPage } from "./components/PronounQuizPage";
import { GrammarQuizPage } from "./components/GrammarQuiz/GrammarQuizPage";
import { QuizSelectionPage } from "./components/QuizSelectionPage";
import { MASAQTestPage } from "./components/MASAQTestPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/quiz" element={<QuizSelectionPage />} />
          <Route path="/quiz/pronouns" element={<PronounQuizPage />} />
          <Route path="/quiz/grammar" element={<GrammarQuizPage />} />
          <Route path="/test/masaq" element={<MASAQTestPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
