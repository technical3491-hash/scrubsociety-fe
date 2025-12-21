'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, Home, FileText, Search, BookOpen, MessageSquare, Bell, LogOut, Globe, Gamepad2, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
// import ThemeToggle from "@/components/ThemeToggle";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";


interface NavbarProps {
  isLoggedIn?: boolean;
}

export default function Navbar({ isLoggedIn: propIsLoggedIn }: NavbarProps) {
  const pathname = usePathname();
  const { isAuthenticated, logout, isLoggingOut, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Prevent hydration mismatch by only using client-side auth after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Always use prop value during initial render to ensure SSR/client consistency
  // Only switch to client-side auth after mount if no prop was provided
  // This prevents hydration mismatches when isAuthenticated differs between server and client
  const [isLoggedIn, setIsLoggedIn] = useState(propIsLoggedIn ?? false);
  
  // Update isLoggedIn after mount if prop wasn't provided
  useEffect(() => {
    if (propIsLoggedIn === undefined && isMounted) {
      setIsLoggedIn(isAuthenticated ?? false);
    } else if (propIsLoggedIn !== undefined) {
      setIsLoggedIn(propIsLoggedIn);
    }
  }, [propIsLoggedIn, isAuthenticated, isMounted]);

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  // Get initials for avatar
  const getInitials = () => {
    if (user?.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/case-feed", label: "Cases", icon: FileText },
    { path: "/drug-search", label: "Drugs", icon: Search },
    { path: "/cme", label: "CME", icon: BookOpen },
    { path: "/chat", label: "Chat", icon: MessageSquare },
    { path: "/play-game", label: "Play Game", icon: Gamepad2 },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b" style={{ backgroundColor: 'hsl(220 50% 20%)', color: 'hsl(210 15% 95%)', borderColor: 'hsl(220 40% 30%)' }}>
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" data-testid="link-home">
          <div className="flex items-center space-x-2 cursor-pointer hover-elevate active-elevate-2 px-3 py-2 rounded-md">
            {/* <div className="w-8 h-8 bg-primary-foreground text-primary rounded-md flex items-center justify-center font-bold"> */}
            <Image
              src="/ScrubSocietyAI.png"
              alt="Logo"
              width={24}
              height={24}
              className="w-8 h-8 bg-white text-blue-600 rounded-md flex items-center justify-center font-bold object-contain"
            />
            {/* </div> */}
            <span className="text-xl font-bold hidden sm:inline">ScrubSocietyAI</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center space-x-1" suppressHydrationWarning>
          {isLoggedIn && navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} data-testid={`link-${item.label.toLowerCase()}`}>
                <Button
                  variant="ghost"
                  className={`text-white hover:bg-white/10 ${
                    isActive ? "bg-white/15" : ""
                  }`}
                  data-testid={`button-nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center space-x-2">
          {/* Desktop: Theme, Notifications, Profile */}
          <div className="hidden md:flex items-center space-x-2">
            {/* <ThemeToggle /> */}
            {isLoggedIn && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 relative"
                  data-testid="button-notifications"
                >
                  <Bell className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-destructive">
                    3
                  </Badge>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/10"
                      data-testid="button-profile-menu"
                    >
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                        {getInitials()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{getUserDisplayName()}</span>
                        {user?.email && (
                          <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {user.email}
                          </span>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer" data-testid="menu-profile">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-destructive focus:text-destructive" 
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      data-testid="menu-logout"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile: Theme toggle (left side of menu button) */}
          {/* <div className="md:hidden">
            <ThemeToggle />
          </div> */}

          {/* Mobile Menu Button - Right Corner */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-white/10"
                data-testid="button-menu-toggle"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col space-y-2 mt-8">
                {isLoggedIn ? (
                  <>
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.path;
                      return (
                        <Link key={item.path} href={item.path}>
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setMobileMenuOpen(false)}
                            data-testid={`button-mobile-${item.label.toLowerCase()}`}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {item.label}
                          </Button>
                        </Link>
                      );
                    })}
                    <Link href="/profile">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid="button-mobile-profile"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      disabled={isLoggingOut}
                      data-testid="button-mobile-logout"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/register">
                      <Button
                        variant="secondary"
                        className="w-full justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid="button-mobile-join-free"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Join Free
                      </Button>
                    </Link>
                    <Link href="/explore/cases">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid="button-mobile-explore-cases"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Explore Cases
                      </Button>
                    </Link>
                    <Link href="/play-game">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid="button-mobile-play-game"
                      >
                        <Gamepad2 className="w-4 h-4 mr-2" />
                        Play Game
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid="button-mobile-login"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop: Login/Register (when not logged in) */}
          {!isLoggedIn && (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                data-testid="button-login-nav"
              >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="secondary"
                  data-testid="button-register-nav"
                >
                  Join Free
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
