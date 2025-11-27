import { useState } from "react";
import { useRoute } from "wouter";
import { useLocation } from "wouter";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CourseDetail() {
  const [, params] = useRoute("/course/:id");
  const courseId = params?.id as string;
  const [, setLocation] = useLocation();
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  // Mock course data
  const courses: any = {
    "1": {
      title: "React Avançado",
      description: "Domine padrões avançados e performance em React",
      image: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&auto=format&fit=crop&q=60",
      students: 1240,
      level: "avançado",
      instructor: "João Silva",
      modules: [
        {
          id: "m1",
          title: "Hooks Avançados",
          lessons: [
            { id: "l1", title: "useContext e Prop Drilling", duration: "15:32", completed: false, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4" },
            { id: "l2", title: "useReducer vs useState", duration: "22:15", completed: false, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4" },
            { id: "l3", title: "Custom Hooks", duration: "18:45", completed: false, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4" },
          ]
        },
        {
          id: "m2",
          title: "Performance e Otimização",
          lessons: [
            { id: "l4", title: "React.memo e useMemo", duration: "19:20", completed: false, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4" },
            { id: "l5", title: "Code Splitting", duration: "24:10", completed: false, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4" },
            { id: "l6", title: "Lazy Loading", duration: "16:50", completed: false, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4" },
          ]
        },
        {
          id: "m3",
          title: "Padrões Avançados",
          lessons: [
            { id: "l7", title: "Render Props", duration: "21:05", completed: false, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4" },
            { id: "l8", title: "Higher Order Components", duration: "25:30", completed: false, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4" },
            { id: "l9", title: "Compound Components", duration: "20:15", completed: false, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4" },
          ]
        },
      ]
    },
    "2": {
      title: "Web Design Moderno",
      description: "Aprenda a criar interfaces incríveis com Tailwind CSS",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=60",
      students: 856,
      level: "intermediário",
      instructor: "Maria Design",
      modules: [
        {
          id: "m1",
          title: "Fundamentos de Design",
          lessons: [
            { id: "l1", title: "Princípios de Design", duration: "18:20", completed: false, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4" },
            { id: "l2", title: "Tipografia", duration: "16:45", completed: false, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4" },
          ]
        },
        {
          id: "m2",
          title: "Tailwind CSS",
          lessons: [
            { id: "l3", title: "Introdução ao Tailwind", duration: "20:10", completed: false, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4" },
            { id: "l4", title: "Componentes", duration: "25:50", completed: false, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4" },
          ]
        },
      ]
    },
    "3": {
      title: "JavaScript do Zero",
      description: "Fundamentos completos de JavaScript para iniciantes",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60",
      students: 2100,
      level: "iniciante",
      instructor: "Carlos Dev",
      modules: [
        {
          id: "m1",
          title: "Fundamentos",
          lessons: [
            { id: "l1", title: "Variáveis e Tipos", duration: "22:30", completed: false, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4" },
            { id: "l2", title: "Operadores", duration: "18:15", completed: false, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4" },
          ]
        },
        {
          id: "m2",
          title: "Funções",
          lessons: [
            { id: "l3", title: "Declaração de Funções", duration: "20:40", completed: false, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4" },
            { id: "l4", title: "Arrow Functions", duration: "16:25", completed: false, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4" },
          ]
        },
      ]
    }
  };

  const course = courseId ? courses[courseId] : null;

  if (!course) {
    return <div className="text-center py-12">Curso não encontrado</div>;
  }

  const currentLesson = selectedLesson 
    ? course.modules.flatMap((m: any) => m.lessons).find((l: any) => l.id === selectedLesson)
    : null;

  const getLevelColor = (level: string) => {
    switch (level) {
      case "iniciante":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "intermediário":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "avançado":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setLocation("/members")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold">{course.title}</h1>
          <p className="text-muted-foreground">Instrutor: {course.instructor}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Player Area */}
        <div className="lg:col-span-2">
          {currentLesson ? (
            <div className="space-y-4">
              <div className="bg-black rounded-lg overflow-hidden aspect-video shadow-2xl">
                <video 
                  src={currentLesson.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-heading font-bold">{currentLesson.title}</h2>
                <p className="text-muted-foreground">{currentLesson.duration}</p>
              </div>
            </div>
          ) : (
            <div className="bg-[#1a1d24] rounded-lg aspect-video flex items-center justify-center border border-[#2d3748]">
              <div className="text-center text-muted-foreground">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Selecione uma aula para começar</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar with Course Modules */}
        <div className="space-y-4">
          <div className="bg-[#1a1d24] rounded-lg p-4 border border-[#2d3748] space-y-2">
            <Badge className={getLevelColor(course.level)}>
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </Badge>
            <p className="text-sm text-gray-300">{course.description}</p>
            <p className="text-xs text-muted-foreground">{course.students.toLocaleString("pt-BR")} alunos</p>
          </div>

          {/* Modules List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {course.modules.map((module: any) => (
              <div key={module.id} className="bg-[#1a1d24] rounded-lg border border-[#2d3748] overflow-hidden">
                <div className="bg-[#2d3748] p-3">
                  <h3 className="font-semibold text-white text-sm">{module.title}</h3>
                </div>
                <div className="space-y-1 p-2">
                  {module.lessons.map((lesson: any) => (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson.id)}
                      className={`w-full text-left p-2 rounded text-sm transition-all ${
                        selectedLesson === lesson.id
                          ? "bg-indigo-600 text-white"
                          : "hover:bg-[#2d3748] text-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {selectedLesson === lesson.id ? (
                          <Play className="w-4 h-4 mt-0.5 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 border border-gray-500 rounded mt-0.5 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate">{lesson.title}</p>
                          <p className="text-xs opacity-70">{lesson.duration}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
