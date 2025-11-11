import { Bell, Search, User, LogOut, Menu } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import logo from "../../../assets/Effortel_logo.svg";
import { User as UserType } from "../../../features/auth/types/auth";
import { color } from "../../../shared/utils/utils";
import { userService } from "../../users/services/userService";
import { roleService } from "../../roles/services/roleService";
import { Role } from "../../roles/types/role";
import { UserType as FullUserType } from "../../users/types/user";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [currentUserRole, setCurrentUserRole] = useState<string>("User");
  const [roleLookup, setRoleLookup] = useState<Record<number, Role>>({});
  const [isLoadingRole, setIsLoadingRole] = useState<boolean>(true);

  const loadCurrentUserRole = useCallback(async () => {
    if (!user?.email) {
      setIsLoadingRole(false);
      return;
    }

    setIsLoadingRole(true);
    try {
      // Load roles for lookup first (same as user management)
      const { roles } = await roleService.listRoles({
        limit: 100,
        offset: 0,
      });
      const mappedRoles: Record<number, Role> = {};
      roles.forEach((role) => {
        mappedRoles[role.id] = role;
      });
      setRoleLookup(mappedRoles);

      // Try to get user by email first (more reliable)
      let fullUser: FullUserType | null = null;
      try {
        const userResponseByEmail = await userService.getUserByEmail(
          user.email,
          true
        );
        if (userResponseByEmail.success && userResponseByEmail.data) {
          fullUser = userResponseByEmail.data as FullUserType;
        }
      } catch (emailErr) {
        console.log("Failed to get user by email, trying by ID:", emailErr);
      }

      // Fallback to user_id if email lookup failed
      if (!fullUser && user?.user_id) {
        try {
          const userResponseById = await userService.getUserById(user.user_id);
          if (userResponseById.success && userResponseById.data) {
            fullUser = userResponseById.data as FullUserType;
          }
        } catch (idErr) {
          console.log("Failed to get user by ID:", idErr);
        }
      }

      if (fullUser) {
        // Resolve role name using the same logic as user management
        const primaryRoleId = fullUser.primary_role_id ?? fullUser.role_id;
        const resolvedRoleName =
          primaryRoleId != null ? mappedRoles[primaryRoleId]?.name : undefined;
        const fallbackRoleName = fullUser.role_name;

        const finalRoleName = resolvedRoleName ?? fallbackRoleName ?? "User";
        console.log("Current user role:", {
          email: user.email,
          user_id: user.user_id,
          fullUser_id: fullUser.id,
          primary_role_id: primaryRoleId,
          role_name: fallbackRoleName,
          resolvedRoleName,
          finalRoleName,
          mappedRoles,
        });
        setCurrentUserRole(finalRoleName);
      } else {
        console.warn("Could not fetch current user details, using fallback");
        setCurrentUserRole(
          user?.role
            ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
            : "User"
        );
      }
    } catch (err) {
      console.error("Failed to load current user role:", err);
      // Fallback to simple role from auth context
      setCurrentUserRole(
        user?.role
          ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
          : "User"
      );
    } finally {
      setIsLoadingRole(false);
    }
  }, [user]);

  useEffect(() => {
    loadCurrentUserRole();
  }, [loadCurrentUserRole]);

  return (
    <header
      className="sticky top-0 z-40 m-0 p-0"
      style={{
        background: `linear-gradient(to bottom, ${color.gradients.sidebar.top} 0%, ${color.gradients.sidebar.middle} 70%, ${color.gradients.sidebar.bottom} 100%)`,
      }}
    >
      <div className="flex h-16 items-center justify-between px-5 lg:px-8">
        <div className="flex items-center gap-x-4 flex-1">
          <button
            onClick={onMenuClick}
            className="md:hidden rounded-md p-2 text-white/90 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative flex-1 max-w-xs sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
            <input
              className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
              placeholder="Search campaigns, products, users..."
              type="search"
              style={{ outline: "none" }}
            />
          </div>
        </div>

        <div className="flex items-center gap-x-4">
          <button
            type="button"
            className="relative p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-600 text-white rounded-full text-xs flex items-center justify-center font-medium">
              3
            </span>
          </button>

          <div className="flex items-center gap-x-3">
            <div className="flex items-center gap-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">
                  {user?.email || "User"}
                </div>
                <div className="text-xs font-medium leading-[140%] tracking-[0.05em] text-white/70">
                  {currentUserRole}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

interface GuestHeaderProps {
  isLoaded?: boolean;
  className?: string;
  onLogout?: () => void;
  showLogo?: boolean;
  showUserInfo?: boolean;
  variant?: "default" | "transparent" | "solid";
}

export function GuestHeader({
  isLoaded = true,
  className = "",
  onLogout,
  showLogo = true,
  showUserInfo = true,
  variant = "default",
}: GuestHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      try {
        await logout();
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };

  const getHeaderStyles = () => {
    const baseStyles = "relative z-10 transition-all duration-1000 ease-out";
    const loadedStyles = isLoaded
      ? "translate-y-0 opacity-100"
      : "-translate-y-4 opacity-0";

    switch (variant) {
      case "transparent":
        return `${baseStyles} ${loadedStyles} bg-transparent border-b border-white/10`;
      case "solid":
        return `${baseStyles} ${loadedStyles} bg-[#0a192f] border-b border-white/20`;
      case "default":
      default:
        return `${baseStyles} ${loadedStyles} bg-[#0a192f]/90 backdrop-blur-sm border-b border-white/10`;
    }
  };

  return (
    <header className={`${getHeaderStyles()} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 lg:h-24">
          {showLogo && (
            <div className="flex items-center">
              <div
                className="w-32 h-32 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate("/dashboard")}
              >
                <img
                  src={logo}
                  alt="Sentra Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {showUserInfo && (
            <div className="flex items-center space-x-4">
              <div className="text-sm text-white/80">
                {(user as UserType & { email?: string })?.email || "User"}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-sm text-white/80 hover:text-white transition-colors p-2 rounded-md hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
