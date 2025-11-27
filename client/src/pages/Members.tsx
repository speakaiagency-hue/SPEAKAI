import { Link } from "wouter";
import { BookOpen, Star, Users2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import reactCover from "@assets/generated_images/react_advanced_course_cover.png";
import webDesignCover from "@assets/generated_images/web_design_modern_course_cover.png";
import javascriptCover from "@assets/generated_images/javascript_zero_course_cover.png";

type Course = {
  id: string;
  title: string;
  description: string;
  students: number;
  level: "iniciante" | "intermediário" | "avançado";
  image?: string;
};

export default function Members() {
  // VITRINE - Clientes visualizam apenas, sem poder editar
  // Admin gerencia tudo em /admin
  
  const courses: Course[] = [
    {
      id: "1",
      title: "React Avançado",
      description: "Domine padrões avançados e performance em React",
      students: 1240,
      level: "avançado",
      image: reactCover,
    },
    {
      id: "2",
      title: "Web Design Moderno",
      description: "Aprenda a criar interfaces incríveis com Tailwind CSS",
      students: 856,
      level: "intermediário",
      image: webDesignCover,
    },
    {
      id: "3",
      title: "JavaScript do Zero",
      description: "Fundamentos completos de JavaScript para iniciantes",
      students: 2100,
      level: "iniciante",
      image: javascriptCover,
    },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case "iniciante":
        return "bg-green-500/10 text-green-400";
      case "intermediário":
        return "bg-yellow-500/10 text-yellow-400";
      case "avançado":
        return "bg-red-500/10 text-red-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "iniciante":
        return "Iniciante";
      case "intermediário":
        return "Intermediário";
      case "avançado":
        return "Avançado";
      default:
        return level;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-indigo-600/10 text-indigo-500">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold">Área de Membros</h1>
            <p className="text-muted-foreground">Acesse todos os nossos cursos e aprenda do seu jeito</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1a1d24] border-[#2d3748]">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-1">Cursos Disponíveis</p>
              <p className="text-3xl font-bold text-primary">{courses.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1d24] border-[#2d3748]">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-1">Alunos Totais</p>
              <p className="text-3xl font-bold text-indigo-400">{courses.reduce((acc, c) => acc + c.students, 0).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1d24] border-[#2d3748]">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-1">Taxa de Conclusão</p>
              <p className="text-3xl font-bold text-green-400">87%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-heading font-bold">Nossos Cursos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link key={course.id} href={`/course/${course.id}`}>
              <a>
                <Card className="h-full bg-[#1a1d24] border-[#2d3748] hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer group overflow-hidden">
                  {/* Course Cover Image */}
                  {course.image && (
                    <div className="relative h-48 overflow-hidden bg-[#0f1117]">
                      <img 
                        src={course.image} 
                        alt={course.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d24] via-transparent to-transparent" />
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-xl group-hover:text-indigo-400 transition-colors">
                            {course.title}
                          </CardTitle>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-indigo-400 group-hover:translate-x-1 transition-all mt-1" />
                      </div>
                      <Badge className={`w-fit ${getLevelColor(course.level)}`}>
                        {getLevelLabel(course.level)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-[#2d3748] pt-4">
                      <Users2 className="w-4 h-4" />
                      <span>{course.students.toLocaleString()} alunos</span>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-indigo-600/10 to-violet-600/10 border-indigo-500/30">
        <CardContent className="pt-8 text-center space-y-4">
          <div className="flex justify-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          </div>
          <div>
            <h3 className="text-xl font-heading font-bold mb-2">Aprenda com os Melhores</h3>
            <p className="text-muted-foreground">Escolha um curso e comece sua jornada de aprendizado hoje mesmo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
