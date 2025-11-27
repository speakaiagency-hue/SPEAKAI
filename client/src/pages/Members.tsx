import { useState } from "react";
import { Link } from "wouter";
import { Users, Plus, Edit2, Trash2, BookOpen, Star, Users2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type Course = {
  id: string;
  title: string;
  description: string;
  students: number;
  level: "iniciante" | "intermediário" | "avançado";
  image?: string;
};

export default function Members() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([
    {
      id: "1",
      title: "React Avançado",
      description: "Domine padrões avançados e performance em React",
      students: 1240,
      level: "avançado",
    },
    {
      id: "2",
      title: "Web Design Moderno",
      description: "Aprenda a criar interfaces incríveis com Tailwind CSS",
      students: 856,
      level: "intermediário",
    },
    {
      id: "3",
      title: "JavaScript do Zero",
      description: "Fundamentos completos de JavaScript para iniciantes",
      students: 2100,
      level: "iniciante",
    },
  ]);

  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    level: "intermediário" as const,
  });

  const handleAddCourse = () => {
    if (!newCourse.title || !newCourse.description) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    setCourses([
      ...courses,
      {
        id: Date.now().toString(),
        title: newCourse.title,
        description: newCourse.description,
        students: 0,
        level: newCourse.level,
      },
    ]);

    setNewCourse({ title: "", description: "", level: "intermediário" });
    toast({ title: "Curso adicionado com sucesso!" });
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
    toast({ title: "Curso removido" });
  };

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
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
              <BookOpen className="w-6 h-6" />
            </span>
            Área de Membros
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus cursos e acesso de membros
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold shadow-lg shadow-cyan-500/20">
              <Plus className="w-5 h-5 mr-2" /> Novo Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0f1117] border-[#2d3748]">
            <DialogHeader>
              <DialogTitle className="text-white">Criar Novo Curso</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Título do Curso</Label>
                <Input
                  placeholder="Ex: React Avançado"
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, title: e.target.value })
                  }
                  className="bg-[#1a1d24] border-[#2d3748] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Descrição</Label>
                <Textarea
                  placeholder="Descreva o conteúdo do seu curso..."
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, description: e.target.value })
                  }
                  className="bg-[#1a1d24] border-[#2d3748] text-white h-24 resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Nível</Label>
                <select
                  value={newCourse.level}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      level: e.target.value as any,
                    })
                  }
                  className="w-full bg-[#1a1d24] border border-[#2d3748] text-white rounded-lg p-2"
                >
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediário">Intermediário</option>
                  <option value="avançado">Avançado</option>
                </select>
              </div>
              <Button
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold mt-6"
                onClick={handleAddCourse}
              >
                Criar Curso
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1a1d24] border-[#2d3748] shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total de Cursos</p>
                <p className="text-3xl font-bold text-cyan-400 mt-1">
                  {courses.length}
                </p>
              </div>
              <BookOpen className="w-10 h-10 text-cyan-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1d24] border-[#2d3748] shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total de Alunos</p>
                <p className="text-3xl font-bold text-blue-400 mt-1">
                  {courses.reduce((sum, c) => sum + c.students, 0).toLocaleString("pt-BR")}
                </p>
              </div>
              <Users2 className="w-10 h-10 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1d24] border-[#2d3748] shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Média de Alunos</p>
                <p className="text-3xl font-bold text-indigo-400 mt-1">
                  {Math.round(
                    courses.reduce((sum, c) => sum + c.students, 0) / courses.length
                  ).toLocaleString("pt-BR")}
                </p>
              </div>
              <Star className="w-10 h-10 text-indigo-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid - Vitrine Clicável */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Link key={course.id} href={`/course/${course.id}`}>
            <a className="group cursor-pointer h-full">
              <Card
                className="bg-[#1a1d24] border-[#2d3748] shadow-lg hover:border-cyan-500/50 hover:shadow-cyan-500/10 transition-all duration-300 overflow-hidden h-full flex flex-col"
              >
                <div className="h-24 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-[#2d3748] group-hover:from-cyan-600/30 group-hover:to-blue-600/30 transition-colors" />
                <CardHeader className="pb-2 flex-1">
                  <CardTitle className="text-lg text-white flex items-center justify-between">
                    {course.title}
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{course.students.toLocaleString("pt-BR")} alunos</span>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getLevelColor(
                        course.level
                      )}`}
                    >
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
