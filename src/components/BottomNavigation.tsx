
import { Home, Book, Search, Bookmark, Settings, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const BottomNavigation = () => {
  const navigate = useNavigate();
  
  const navItems = [
    { icon: Home, label: "Home", active: true, path: "/" },
    { icon: Book, label: "Surahs", active: false, path: "/" },
    { icon: Brain, label: "Quiz", active: false, path: "/quiz" },
    { icon: Bookmark, label: "Bookmarks", active: false, path: "/" },
    { icon: Settings, label: "Settings", active: false, path: "/" },
  ];

  return (
    <nav className="bg-[#1a1a1a] border-t border-gray-800 px-4 py-2">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-1 px-3 py-2 h-auto ${
              item.active 
                ? "text-[#FFD700]" 
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => navigate(item.path)}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
};
