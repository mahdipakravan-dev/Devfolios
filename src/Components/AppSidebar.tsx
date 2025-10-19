import {
  ArrowDownAZ,
  ArrowUpAZ,
  Calendar,
  TrendingUp,
  Users,
  Star,
  Shuffle,
  ChevronRight,
  Filter,
  Heart,
  Loader,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/Components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/Components/ui/collapsible";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Badge } from "@/Components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { cn } from "@/lib/utils";

import LogoIcon from "@/Components/Logo";
import { useMemo, useState } from "react";
import { useCurrentPortfolio } from "@/store/useCurrentPortfolio";
import { usePortfoliosData } from "@/hooks/usePortfoliosData";
import { useFavPortfolios } from "@/store/useFavPortfolios";
import type { Portfolio } from "@/types";

type SortOption =
  | "popularity"
  | "recent"
  | "followers"
  | "stars"
  | "name-asc"
  | "name-desc";

const sortOptions = [
  { value: "popularity", label: "Popularity", icon: TrendingUp },
  { value: "recent", label: "Recently Added", icon: Calendar },
  { value: "followers", label: "Followers", icon: Users },
  { value: "stars", label: "GitHub Stars", icon: Star },
  { value: "name-asc", label: "Name (A-Z)", icon: ArrowDownAZ },
  { value: "name-desc", label: "Name (Z-A)", icon: ArrowUpAZ },
] as const;

export const AppSidebar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popularity");
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "fav">("all");

  const { username, setUsername } = useCurrentPortfolio();
  const { setOpenMobile } = useSidebar();
  const { data: portfolios, isLoading: isPortfoliosPending } =
    usePortfoliosData();
  const {
    portfolios: favPortfolios,
    addPortfolio,
    removePortfolio,
  } = useFavPortfolios();

  const favUsernames = useMemo(
    () => favPortfolios.map((p) => p.username),
    [favPortfolios]
  );

  const handleHeartClick = (portfolio: Portfolio) => {
    if (favUsernames.includes(portfolio.username)) {
      removePortfolio(portfolio.username);
    } else {
      addPortfolio(portfolio);
    }
  };

  const handleRandom = () => {
    const list = filterType === "fav" ? favPortfolios : portfolios ?? [];
    if (list.length === 0) return;
    const random = list[Math.floor(Math.random() * list.length)];
    setUsername(random.username);

    document.getElementById(`portfolio-${random.username}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const filteredPortfolios = useMemo(() => {
    const list = filterType === "fav" ? favPortfolios : portfolios ?? [];

    return list
      .filter((portfolio) => {
        const query = searchQuery.toLowerCase();
        return (
          portfolio.name.toLowerCase().includes(query) ||
          portfolio.username.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "popularity":
            return b.popularity - a.popularity;
          case "followers":
            return b.followers - a.followers;
          case "stars":
            return b.stars - a.stars;
          case "name-asc":
            return a.name.localeCompare(b.name);
          case "name-desc":
            return b.name.localeCompare(a.name);
          default:
            return 0;
        }
      });
  }, [portfolios, favPortfolios, searchQuery, sortBy, filterType]);

  return (
    <Sidebar className="!border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 h-full"
            >
              <div className="flex items-center justify-between">
                <a href="/" className="inline-flex items-center gap-2">
                  <LogoIcon size="sm" className="shadow-2xl" />
                  <span className="-mb-1.5 font-forge text-2xl tracking-wider">
                    Devfolios
                  </span>
                </a>
                <SidebarTrigger />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="font-forge !text-lg tracking-wider hover:bg-accent/50 transition-colors cursor-pointer flex items-center justify-between w-full">
                Filters
                <ChevronRight
                  className={cn(
                    "size-4 transition-transform",
                    isFiltersOpen && "rotate-90"
                  )}
                />
              </CollapsibleTrigger>
            </SidebarGroupLabel>

            <CollapsibleContent>
              <SidebarGroupContent className="space-y-3 mt-3 px-2 pb-4">
                <div className="flex items-start flex-col gap-2">
                  <Input
                    id="search"
                    type="search"
                    placeholder="Search portfolios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-full"
                  />
                  <div className="px-0.5 w-full flex items-center justify-center gap-1">
                    <Button
                      onClick={handleRandom}
                      variant="outline"
                      className="w-1/2"
                      size="icon"
                    >
                      <Shuffle className="size-4" />
                    </Button>
                    <Button
                      onClick={() => setIsSortOpen((prev) => !prev)}
                      variant="outline"
                      className="w-1/2"
                      size="icon"
                    >
                      <Filter className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-2">
                  <Label className="text-xs text-muted-foreground">Show</Label>
                  <RadioGroup
                    value={filterType}
                    onValueChange={(v) => setFilterType(v as "all" | "fav")}
                    className="flex items-center gap-3 mt-1"
                  >
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="text-sm cursor-pointer">
                        All
                      </Label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="fav" id="fav" />
                      <Label
                        htmlFor="fav"
                        className="text-sm cursor-pointer flex items-center gap-1"
                      >
                        Favorites
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {isSortOpen && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Sort By
                    </Label>
                    <Select
                      value={sortBy}
                      onValueChange={(v) => setSortBy(v as SortOption)}
                    >
                      <SelectTrigger className="w-full mt-1 h-9">
                        <SelectValue placeholder="Select sort" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <opt.icon className="size-3.5 text-muted-foreground" />
                              {opt.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <SidebarGroup className="flex-1 overflow-hidden">
          <SidebarGroupLabel className="font-forge text-lg tracking-wider flex items-center justify-between">
            <span>{filterType === "fav" ? "Favorites" : "Portfolios"}</span>
            <Badge variant="secondary" className="text-xs font-sans">
              {filteredPortfolios?.length ?? 0}
            </Badge>
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <div className="w-full overflow-y-auto h-[calc(100vh-20rem)] ] scrollbar-none">
              <div className="space-y-2 pb-4 w-full">
                {filteredPortfolios?.map((portfolio) => (
                  <div
                    id={`portfolio-${portfolio.username}`}
                    key={portfolio.username}
                    onClick={(e) => {
                      setUsername(portfolio.username);
                      setOpenMobile(false);
                      e.currentTarget.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                  >
                    <div
                      className={cn(
                        "group/card relative w-full p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200 hover:shadow-md cursor-pointer",
                        { "bg-accent": username === portfolio.username }
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="size-10 ring ring-ring">
                          <AvatarImage
                            src={`https://github.com/${portfolio.username}.png`}
                            alt={portfolio.name}
                          />
                          <AvatarFallback className="text-xs">
                            {portfolio.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm truncate group-hover/card:text-primary transition-colors">
                            {portfolio.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {new URL(portfolio.portfolioLink).hostname}
                          </p>
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          className={cn(
                            "opacity-0 group-hover/card:opacity-100 transition-opacity",
                            {
                              "opacity-100": favUsernames.includes(
                                portfolio.username
                              ),
                            }
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHeartClick(portfolio);
                          }}
                        >
                          <Heart
                            className={cn("size-4", {
                              "fill-red-400 text-red-400":
                                favUsernames.includes(portfolio.username),
                            })}
                          />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredPortfolios?.length === 0 && !isPortfoliosPending  && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No portfolios found
                  </div>
                )}

                {isPortfoliosPending && filterType === 'all' && (
                  <div className="text-center py-8 text-sm text-muted-foreground inline-flex mx-auto items-center justify-center gap-2">
                    <Loader className="size-4 animate-spin" /> Loading...
                  </div>
                )}
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
