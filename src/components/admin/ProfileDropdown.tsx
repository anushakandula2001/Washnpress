"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Settings,
  KeyRound,
  Bell,
  Sun,
  Moon,
  HelpCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ProfileAvatar } from "@/components/admin/ProfileAvatar";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useTheme } from "@/hooks/useTheme";

interface ProfileDropdownProps {
  userName?: string;
  roleTitle?: string;
  email?: string;
  avatarUrl?: string | null;
  onLogoutClick: () => void;
}

export function ProfileDropdown({
  userName = "Platform Admin",
  roleTitle = "Administrator",
  email = "admin@washnpress.com",
  avatarUrl,
  onLogoutClick,
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { isDark, toggleTheme, mounted } = useTheme();

  // Close when clicking outside
  useOutsideClick(dropdownRef, () => setIsOpen(false), isOpen);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleMenuClick = (action?: () => void) => {
    setIsOpen(false);
    if (action) action();
  };

  const navigateTo = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Profile Trigger Header */}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Platform Admin user menu"
        className="group flex items-center gap-3 rounded-xl p-1.5 transition-all duration-200 hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <ProfileAvatar name={userName} src={avatarUrl} size="md" status="online" />
        <div className="hidden text-left sm:block">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold leading-tight text-foreground transition group-hover:text-primary">
              {userName}
            </p>
            <ChevronDown
              className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
                isOpen ? "rotate-180 text-primary" : ""
              }`}
            />
          </div>
          <p className="text-xs text-muted-foreground">{roleTitle}</p>
        </div>
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
            className="absolute right-0 z-50 mt-2 w-72 origin-top-right divide-y divide-border rounded-2xl border border-border bg-card shadow-2xl ring-1 ring-black/5 focus:outline-none"
          >
            {/* Profile Header */}
            <div className="p-4 bg-muted/30 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <ProfileAvatar name={userName} src={avatarUrl} size="lg" status="online" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{userName}</p>
                  <p className="inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                    {roleTitle}
                  </p>
                  <p className="truncate text-xs text-muted-foreground mt-0.5">{email}</p>
                </div>
              </div>
            </div>

            {/* Core Navigation Items */}
            <div className="p-1.5 space-y-0.5" role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => navigateTo("/admin/profile")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <User className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                <span>My Profile</span>
              </button>

              {/* <button
                type="button"
                role="menuitem"
                onClick={() => navigateTo("/admin/settings#account")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span>Account Settings</span>
              </button> */}

              {/* <button
                type="button"
                role="menuitem"
                onClick={() => navigateTo("/admin/change-password")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                <span>Change Password</span>
              </button> */}

              {/* <button
                type="button"
                role="menuitem"
                onClick={() => navigateTo("/admin/settings?tab=notifications")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span>Notification Preferences</span>
              </button> */}
            </div>

            {/* System Preferences & Support */}
            <div className="p-1.5 space-y-0.5" role="none">
              {/* <button
                type="button"
                role="menuitem"
                onClick={toggleTheme}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <div className="flex items-center gap-3">
                  {mounted && isDark ? (
                    <Sun className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Moon className="h-4 w-4 text-indigo-500" />
                  )}
                  <span>Theme</span>
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {mounted ? (isDark ? "Dark" : "Light") : "Toggle"}
                </span>
              </button> */}

              {/* <button
              //   type="button"
              //   role="menuitem"
              //   onClick={() => navigateTo("/admin/help")}
              //   className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              // >
              //   <HelpCircle className="h-4 w-4 text-muted-foreground" />
              //   <span>Help & Support</span>
              // </button> */}
            </div>

            {/* Logout Action */}
            <div className="p-1.5" role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => handleMenuClick(onLogoutClick)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
