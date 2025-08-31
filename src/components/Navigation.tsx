
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FaRegCommentDots, FaCog, FaSignOutAlt, FaUser } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { useUserPreferences } from "@/hooks/useUserPreferences";

const Navigation = () => {
  const { user, logout } = useAuth();
  const { preferences } = useUserPreferences();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <FaRegCommentDots className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">MessageHub</h1>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/dashboard">
              <Button variant={isActive('/dashboard') ? 'default' : 'ghost'} size="sm">
                Dashboard
              </Button>
            </Link>
            <Link to="/customers">
              <Button variant={isActive('/customers') ? 'default' : 'ghost'} size="sm">
                Customers
              </Button>
            </Link>
            <Link to="/compose-message">
              <Button variant={isActive('/compose-message') ? 'default' : 'ghost'} size="sm">
                Compose
              </Button>
            </Link>
            <Link to="/message-history">
              <Button variant={isActive('/message-history') ? 'default' : 'ghost'} size="sm">
                History
              </Button>
            </Link>
            {/* Admin links, only visible to admins */}
            {preferences?.user_role === 'admin' && (
              <>
                <Link to="/admin-dashboard">
                  <Button variant={isActive('/admin-dashboard') ? 'default' : 'ghost'} size="sm">
                    Admin Dashboard
                  </Button>
                </Link>
                <Link to="/admin-panel">
                  <Button variant={isActive('/admin-panel') ? 'default' : 'ghost'} size="sm">
                    Admin Panel
                  </Button>
                </Link>
                <Link to="/admin-payout">
                  <Button variant={isActive('/admin-payout') ? 'default' : 'ghost'} size="sm">
                    Admin Payout
                  </Button>
                </Link>
                <Link to="/admin-task-review">
                  <Button variant={isActive('/admin-task-review') ? 'default' : 'ghost'} size="sm">
                    Task Review
                  </Button>
                </Link>
                <Link to="/admin-request-queue">
                  <Button variant={isActive('/admin-request-queue') ? 'default' : 'ghost'} size="sm">
                    Request Queue
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <LanguageToggle />
            
            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.name || 'User'}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <Link to="/settings">
                  <DropdownMenuItem>
                    <FaCog className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <Link to="/payment">
                  <DropdownMenuItem>
                    <FaUser className="mr-2 h-4 w-4" />
                    <span>Subscription</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <FaSignOutAlt className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
