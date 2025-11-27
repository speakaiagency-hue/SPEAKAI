import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "wouter";
import { getUser, clearAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function UserMenu() {
  const [, navigate] = useNavigate();
  const user = getUser();

  if (!user) return null;

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-indigo-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-3 px-2 py-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-indigo-600 text-white text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-sm">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <UserIcon className="w-4 h-4 mr-2" />
          Perfil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500">
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
