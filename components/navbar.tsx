"use client"

import { useRouter } from 'next/navigation';
import { Bell, Hexagon, Search, User, UserCog, Settings, Shield, Terminal, Activity, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  return (
    <header className="flex items-center justify-between py-4 border-b border-slate-700/50 mb-6" >
      <div className="flex items-center space-x-2">
        <Hexagon className="h-8 w-8 text-cyan-500" />
        <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Job Portal
        </span>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden md:flex items-center space-x-1 bg-slate-800/50 rounded-full px-3 py-1.5 border border-slate-700/50 backdrop-blur-sm">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search systems..."
            className="bg-transparent border-none focus:outline-none text-sm w-40 placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center space-x-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-100">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-cyan-500 rounded-full animate-pulse"></span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                  <AvatarFallback className="bg-slate-700 text-cyan-500">CM</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-slate-900/95 border-slate-700/50 backdrop-blur-sm"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-slate-100">Commander</p>
                  <p className="text-xs leading-none text-slate-400">admin@nexusos.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700/50" />
              <DropdownMenuItem className="text-slate-300 focus:bg-slate-800/50 focus:text-slate-100">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-300 focus:bg-slate-800/50 focus:text-slate-100">
                <UserCog className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-300 focus:bg-slate-800/50 focus:text-slate-100">
                <Settings className="mr-2 h-4 w-4" />
                <span>System Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-300 focus:bg-slate-800/50 focus:text-slate-100">
                <Shield className="mr-2 h-4 w-4" />
                <span>Security Center</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700/50" />
              <DropdownMenuItem className="text-slate-300 focus:bg-slate-800/50 focus:text-slate-100">
                <Terminal className="mr-2 h-4 w-4" />
                <span>Command Console</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-300 focus:bg-slate-800/50 focus:text-slate-100">
                <Activity className="mr-2 h-4 w-4" />
                <span>System Monitor</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700/50" />
              <DropdownMenuItem
                className="text-red-400 focus:bg-red-500/10 focus:text-red-300"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
};