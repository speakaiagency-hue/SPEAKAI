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
import Admin from "./pages/Admin";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/admin" component={Admin} />
      <Route path="/" component={() => <Layout><Home /></Layout>} />
      <Route path="/chat" component={() => <Layout><Chat /></Layout>} />
      <Route path="/prompt" component={() => <Layout><Prompt /></Layout>} />
      <Route path="/image" component={() => <Layout><ImagePage /></Layout>} />
      <Route path="/video" component={() => <Layout><VideoPage /></Layout>} />
      <Route path="/members" component={() => <Layout><Members /></Layout>} />
      <Route path="/course/:id" component={() => <Layout><CourseDetail /></Layout>} />
      <Route component={() => <Layout><NotFound /></Layout>} />
    </Switch>
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
