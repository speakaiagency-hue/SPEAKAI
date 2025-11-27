import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Prompt from "./pages/Prompt";
import ImagePage from "./pages/Image";
import VideoPage from "./pages/Video";
import Members from "./pages/Members";
import CourseDetail from "./pages/CourseDetail";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/chat" component={Chat} />
        <Route path="/prompt" component={Prompt} />
        <Route path="/image" component={ImagePage} />
        <Route path="/video" component={VideoPage} />
        <Route path="/members" component={Members} />
        <Route path="/course/:id" component={CourseDetail} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
