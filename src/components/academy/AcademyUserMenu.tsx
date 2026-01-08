import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, BarChart3, GraduationCap, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAcademyAuth } from '@/contexts/AcademyAuthContext';

export const AcademyUserMenu: React.FC = () => {
  const { user, academyUser, isAdmin, signOut } = useAcademyAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Button
        variant="outline"
        onClick={() => navigate('/academy/auth')}
        className="gap-2"
      >
        <User className="h-4 w-4" />
        Sign In
      </Button>
    );
  }

  const initials = academyUser?.full_name
    ? academyUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email?.[0]?.toUpperCase() || 'U';

  const handleSignOut = async () => {
    await signOut();
    navigate('/academy');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {academyUser?.full_name || 'Academy Learner'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/academy')}>
          <GraduationCap className="mr-2 h-4 w-4" />
          My Learning
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/academy/progress')}>
          <BarChart3 className="mr-2 h-4 w-4" />
          Progress Dashboard
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/academy/admin')}>
              <Settings className="mr-2 h-4 w-4" />
              Admin Dashboard
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AcademyUserMenu;
