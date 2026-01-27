"use client";

import React, { useState } from "react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { ModeToggle } from "./ui/toggole-mode";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import Link from "next/link";

function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-2 py-3 md:py-4">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Avatar className="cursor-pointer">
              <AvatarImage src="/logo.png" />
              <AvatarFallback>Daribty Logo</AvatarFallback>
            </Avatar>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 items-center">
          <Menubar className="gap-4">
            <MenubarMenu>
              <MenubarTrigger>Taxe sur les terrains non bâtis</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  <Link href="/newTNB">TNB Nouvelle Tarif</Link>
                </MenubarItem>
              <MenubarSeparator />
                <MenubarItem>
                  <Link href="/terrainExo">Terrains Exo</Link>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem>
                  <Link href="/terrainNonExo">Terrains non Exo</Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger>Autres Taxes</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Taxi</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Début de boisson</MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger>Documentation</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Comment calculer la taxe urbaine</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Début de boisson</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

          <ModeToggle />
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden p-2 text-slate-700 dark:text-slate-200"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-4 mb-25">
          <Menubar className="flex-col gap-2">
            <MenubarMenu>
              <MenubarTrigger>Taxe sur les terrains non bâtis</MenubarTrigger>
              <MenubarContent className="block">
                <MenubarItem>
                  <Link href="/terrainExo">Terrains Exo</Link>
                </MenubarItem>
                <MenubarItem>
                  <Link href="/terrainNonExo">Terrains non Exo</Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger>Autres Taxes</MenubarTrigger>
              <MenubarContent className="block">
                <MenubarItem>Taxi</MenubarItem>
                <MenubarItem>Début de boisson</MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger>Documentation</MenubarTrigger>
              <MenubarContent className="block">
                <MenubarItem>Comment calculer la taxe urbaine</MenubarItem>
                <MenubarItem>Début de boisson</MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <div className="mt-2">
              <ModeToggle />
            </div>
          </Menubar>
        </div>
      )}
    </nav>
  );
}

export default Nav;
