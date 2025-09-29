"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const teams = [
  {
    label: "Acme Inc.",
    value: "acme",
    plan: "Pro",
  },
  {
    label: "Monsters Inc.",
    value: "monsters",
    plan: "Starter",
  },
];

type Team = (typeof teams)[number];

export function TeamSwitcher() {
  const [open, setOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team>(teams[0]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Sélectionner une équipe"
          className="w-full justify-between bg-sidebar-accent/20 border-sidebar-border hover:bg-sidebar-accent/40 transition-all duration-200 hover:shadow-sm"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-5 w-5 rounded bg-amber-500 flex items-center justify-center text-xs font-medium text-white">
              {selectedTeam.label.charAt(0)}
            </div>
            <div className="flex flex-col items-start min-w-0">
              <div className="text-sm font-medium truncate">
                {selectedTeam.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {selectedTeam.plan} plan
              </div>
            </div>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" side="right" align="start">
        <Command>
          <CommandInput placeholder="Rechercher une équipe..." />
          <CommandList>
            <CommandEmpty>Aucune équipe trouvée.</CommandEmpty>
            <CommandGroup heading="Équipes">
              {teams.map((team) => (
                <CommandItem
                  key={team.value}
                  value={team.value}
                  onSelect={() => {
                    setSelectedTeam(team);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="h-5 w-5 rounded bg-amber-500 flex items-center justify-center text-xs font-medium text-white">
                    {team.label.charAt(0)}
                  </div>
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {team.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {team.plan} plan
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedTeam.value === team.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup>
              <CommandItem className="flex items-center gap-2 text-muted-foreground">
                <Plus className="h-4 w-4" />
                Créer une équipe
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
