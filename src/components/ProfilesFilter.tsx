"use client";
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  SlidersHorizontal, 
  MapPin, 
  Star, 
  DollarSign, 
  Tag, 
  X, 
  ChevronDown,
  Check,
  RotateCcw
} from 'lucide-react';
import { countries, specialties, priceRanges, ratingOptions } from '@/data/countries';
import { cn } from '@/lib/utils';

export interface FilterState {
  countries: string[];
  specialties: string[];
  priceRange: { min: number; max: number };
  minRating: number;
  verifiedOnly: boolean;
}

interface ProfilesFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resultCount: number;
  variant?: 'dark' | 'light';
}

export function ProfilesFilter({ filters, onFiltersChange, resultCount, variant = 'light' }: ProfilesFilterProps) {
  const [countrySearch, setCountrySearch] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [specialtyOpen, setSpecialtyOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLight = variant === 'light';

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.countries.length > 0) count++;
    if (filters.specialties.length > 0) count++;
    if (filters.priceRange.max < Infinity || filters.priceRange.min > 0) count++;
    if (filters.minRating > 0) count++;
    if (filters.verifiedOnly) count++;
    return count;
  }, [filters]);

  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries;
    return countries.filter(c => 
      c.name.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  const toggleCountry = (countryName: string) => {
    const newCountries = filters.countries.includes(countryName)
      ? filters.countries.filter(c => c !== countryName)
      : [...filters.countries, countryName];
    onFiltersChange({ ...filters, countries: newCountries });
  };

  const toggleSpecialty = (specialty: string) => {
    const newSpecialties = filters.specialties.includes(specialty)
      ? filters.specialties.filter(s => s !== specialty)
      : [...filters.specialties, specialty];
    onFiltersChange({ ...filters, specialties: newSpecialties });
  };

  const setPriceRange = (range: { min: number; max: number }) => {
    onFiltersChange({ ...filters, priceRange: range });
  };

  const setMinRating = (rating: number) => {
    onFiltersChange({ ...filters, minRating: rating });
  };

  const setVerifiedOnly = (verified: boolean) => {
    onFiltersChange({ ...filters, verifiedOnly: verified });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      countries: [],
      specialties: [],
      priceRange: { min: 0, max: Infinity },
      minRating: 0,
      verifiedOnly: false,
    });
  };

  // Style classes based on variant
  const styles = {
    panel: "bg-gray-50 dark:bg-[#01223F]/60 backdrop-blur-3xl rounded-lg p-8 border border-gray-100 dark:border-white/5 shadow-lg dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] sticky top-24",
    label: "text-gray-900 dark:text-white font-bold tracking-[0.05em] text-[10px] lg:text-xs uppercase mb-4 opacity-50 flex items-center gap-2",
    button: "bg-white dark:bg-white/[0.03] border-gray-100 dark:border-white/5 text-gray-500 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all duration-500 rounded-md h-11 px-4",
    buttonInactive: "bg-white dark:bg-white/[0.02] border-gray-100 dark:border-white/5 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all duration-500 rounded-md h-11 px-4",
    buttonActive: "bg-gradient-to-r from-[#00CDAC] to-[#02AAB0] border-none text-white font-bold shadow-[0_8px_24px_-8px_rgba(0,205,172,0.5)] transition-all duration-300 rounded-md h-11 px-4",
    popover: "bg-white dark:bg-[#082C4E]/90 backdrop-blur-3xl border-gray-200 dark:border-white/10 shadow-md dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] rounded-lg",
    commandInput: "text-gray-900 dark:text-white placeholder:text-gray-300 dark:text-white/20 h-12 border-none ring-0 focus:ring-0",
    commandEmpty: "text-gray-400 dark:text-white/40 py-10 text-center text-sm font-medium",
    commandItem: "text-gray-500 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer rounded-md transition-all m-1 p-3",
    specialtyItem: "flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all group",
    checkbox: "border-white/20 data-[state=checked]:bg-[#00CDAC] data-[state=checked]:border-transparent rounded-lg w-5 h-5 transition-all ease-out",
    verifiedBox: "flex items-center gap-4 p-5 rounded-lg bg-gradient-to-br from-[#00CDAC]/10 to-transparent border border-[#00CDAC]/20 cursor-pointer hover:border-[#00CDAC]/40 transition-all group overflow-hidden relative shadow-lg shadow-[#00CDAC]/5",
    verifiedText: "text-gray-600 dark:text-white/80 text-sm font-semibold group-hover:text-gray-900 dark:hover:text-white transition-colors relative z-10",
    clearButton: "w-full text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:bg-white/5 text-[10px] font-bold uppercase tracking-[0.2em] mt-6 py-4 rounded-md transition-all flex items-center justify-center gap-2",
    sheetContent: "w-full sm:w-[400px] bg-gray-50 dark:bg-[#01223F] border-gray-200 dark:border-white/10 p-0",
    sheetHeader: "p-8 border-b border-gray-100 dark:border-white/5",
    sheetTitle: "text-gray-900 dark:text-white flex items-center gap-3 text-2xl font-bold tracking-tight",
    sheetFooter: "p-8 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#01223F]/90 backdrop-blur-2xl",
    mobileButton: "bg-[#01223f]/80 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-[#01223f] hover:text-gray-900 dark:hover:text-white backdrop-blur-2xl rounded-lg px-6 h-12 shadow-xl shadow-black/20",
  };

interface FilterContentProps {
  filters: FilterState;
  countryOpen: boolean;
  setCountryOpen: (open: boolean) => void;
  countrySearch: string;
  setCountrySearch: (search: string) => void;
  filteredCountries: typeof countries;
  toggleCountry: (name: string) => void;
  specialtyOpen: boolean;
  setSpecialtyOpen: (open: boolean) => void;
  toggleSpecialty: (name: string) => void;
  setPriceRange: (range: { min: number; max: number }) => void;
  setMinRating: (rating: number) => void;
  setVerifiedOnly: (verified: boolean) => void;
  activeFilterCount: number;
  clearAllFilters: () => void;
}

const FilterContent = ({
  filters,
  countryOpen,
  setCountryOpen,
  countrySearch,
  setCountrySearch,
  filteredCountries,
  toggleCountry,
  specialtyOpen,
  setSpecialtyOpen,
  toggleSpecialty,
  setPriceRange,
  setMinRating,
  setVerifiedOnly,
  activeFilterCount,
  clearAllFilters,
}: FilterContentProps) => {
  const styles = {
    label: "text-gray-900 dark:text-white font-bold tracking-[0.05em] text-[10px] lg:text-xs uppercase mb-4 opacity-50 flex items-center gap-2",
    button: "bg-white dark:bg-white/[0.03] border-gray-100 dark:border-white/5 text-gray-500 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all duration-500 rounded-md h-11 px-4",
    buttonInactive: "bg-white dark:bg-white/[0.02] border-gray-100 dark:border-white/5 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all duration-500 rounded-md h-11 px-4",
    buttonActive: "bg-gradient-to-r from-[#00CDAC] to-[#02AAB0] border-none text-white font-bold shadow-[0_8px_24px_-8px_rgba(0,205,172,0.5)] transition-all duration-300 rounded-md h-11 px-4",
    popover: "bg-white dark:bg-[#082C4E]/90 backdrop-blur-3xl border-gray-200 dark:border-white/10 shadow-md dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] rounded-lg",
    commandInput: "text-gray-900 dark:text-white placeholder:text-gray-300 dark:text-white/20 h-12 border-none ring-0 focus:ring-0",
    commandEmpty: "text-gray-400 dark:text-white/40 py-10 text-center text-sm font-medium",
    commandItem: "text-gray-500 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer rounded-md transition-all m-1 p-3",
    specialtyItem: "flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all group",
    checkbox: "border-white/20 data-[state=checked]:bg-[#00CDAC] data-[state=checked]:border-transparent rounded-lg w-5 h-5 transition-all ease-out",
    verifiedBox: "flex items-center gap-4 p-5 rounded-lg bg-gradient-to-br from-[#00CDAC]/10 to-transparent border border-[#00CDAC]/20 cursor-pointer hover:border-[#00CDAC]/40 transition-all group overflow-hidden relative shadow-lg shadow-[#00CDAC]/5",
    verifiedText: "text-gray-600 dark:text-white/80 text-sm font-semibold group-hover:text-gray-900 dark:hover:text-white transition-colors relative z-10",
    clearButton: "w-full text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:bg-white/5 text-[10px] font-bold uppercase tracking-[0.2em] mt-6 py-4 rounded-md transition-all flex items-center justify-center gap-2",
  };

  return (
    <div className="space-y-6">
      {/* Country Filter */}
      <div className="space-y-3">
        <div className={cn("flex items-center gap-2", styles.label)}>
          <MapPin className="w-4 h-4 text-[#00CDAC]" />
          <span>Location</span>
        </div>
        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-between", styles.button)}
            >
              {filters.countries.length === 0 
                ? 'Select countries' 
                : `${filters.countries.length} selected`}
              <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className={cn("w-80 p-0 z-[100]", styles.popover)} align="start">
            <Command className="bg-transparent">
              <CommandInput 
                placeholder="Search countries..." 
                value={countrySearch}
                onValueChange={setCountrySearch}
                className={styles.commandInput}
              />
              <CommandList>
                <CommandEmpty className={styles.commandEmpty}>No country found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-64">
                    {filteredCountries.map((country) => (
                      <CommandItem
                        key={country.code}
                        value={country.name}
                        onSelect={() => toggleCountry(country.name)}
                        className={styles.commandItem}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filters.countries.includes(country.name) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {country.name}
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {filters.countries.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.countries.map(country => (
              <Badge 
                key={country} 
                variant="secondary"
                className="bg-[#00CDAC]/10 text-[#00CDAC] border border-[#00CDAC]/20 hover:bg-[#00CDAC]/20 transition-all cursor-pointer rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                onClick={() => toggleCountry(country)}
              >
                {country}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Specialty Filter */}
      <div className="space-y-3">
        <div className={cn("flex items-center gap-2", styles.label)}>
          <Tag className="w-4 h-4 text-[#00CDAC]" />
          <span>Specialty</span>
        </div>
        <Popover open={specialtyOpen} onOpenChange={setSpecialtyOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-between", styles.button)}
            >
              {filters.specialties.length === 0 
                ? 'Select specialties' 
                : `${filters.specialties.length} selected`}
              <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className={cn("w-80 p-0 z-[100]", styles.popover)} align="start">
            <ScrollArea className="h-64 p-2">
              <div className="space-y-1">
                {specialties.map((specialty) => (
                  <div
                    key={specialty}
                    className={cn(
                      styles.specialtyItem,
                      filters.specialties.includes(specialty) && "bg-highlight/20"
                    )}
                    onClick={() => toggleSpecialty(specialty)}
                  >
                    <Checkbox 
                      checked={filters.specialties.includes(specialty)}
                      className={styles.checkbox}
                    />
                    <span className="text-sm">{specialty}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
        {filters.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.specialties.map(specialty => (
              <Badge 
                key={specialty} 
                variant="secondary"
                className="bg-[#00CDAC]/10 text-[#00CDAC] border border-[#00CDAC]/20 hover:bg-[#00CDAC]/20 transition-all cursor-pointer rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                onClick={() => toggleSpecialty(specialty)}
              >
                {specialty}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3">
        <div className={cn("flex items-center gap-2", styles.label)}>
          <DollarSign className="w-4 h-4 text-[#00CDAC]" />
          <span>Price Range</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {priceRanges.map((range) => {
            const isActive = filters.priceRange.min === range.min && filters.priceRange.max === range.max;
            return (
              <Button
                key={range.label}
                variant="outline"
                size="sm"
                className={cn(
                  "text-xs",
                  isActive ? styles.buttonActive : styles.buttonInactive
                )}
                onClick={() => setPriceRange({ min: range.min, max: range.max })}
              >
                {range.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-3">
        <div className={cn("flex items-center gap-2", styles.label)}>
          <Star className="w-4 h-4 text-[#00CDAC]" />
          <span>Minimum Rating</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ratingOptions.map((option) => {
            const isActive = filters.minRating === option.value;
            return (
              <Button
                key={option.label}
                variant="outline"
                size="sm"
                className={cn(
                  "text-xs",
                  isActive ? styles.buttonActive : styles.buttonInactive
                )}
                onClick={() => setMinRating(option.value)}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Verified Only */}
      <div 
        className={styles.verifiedBox}
        onClick={() => setVerifiedOnly(!filters.verifiedOnly)}
      >
        <Checkbox 
          checked={filters.verifiedOnly}
          className={styles.checkbox}
        />
        <span className={styles.verifiedText}>Verified facilitators only</span>
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          className={styles.clearButton}
          onClick={clearAllFilters}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Clear all filters
        </Button>
      )}
    </div>
  );
};

  return (
    <>
      {/* Desktop Filter Panel */}
      <div className="hidden lg:block w-72 flex-shrink-0">
        <div className={styles.panel}>
          <div className="flex items-center justify-between mb-8">
            <h3 className={cn("font-bold flex items-center gap-2 text-lg text-gray-900 dark:text-white", "")}>
              <SlidersHorizontal className="w-5 h-5 text-[#00CDAC]" />
              Filters
            </h3>
            {activeFilterCount > 0 && (
              <Badge className="bg-[#00CDAC] text-white font-bold rounded-full h-6 w-6 p-0 flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          <FilterContent 
            filters={filters}
            countryOpen={countryOpen}
            setCountryOpen={setCountryOpen}
            countrySearch={countrySearch}
            setCountrySearch={setCountrySearch}
            filteredCountries={filteredCountries}
            toggleCountry={toggleCountry}
            specialtyOpen={specialtyOpen}
            setSpecialtyOpen={setSpecialtyOpen}
            toggleSpecialty={toggleSpecialty}
            setPriceRange={setPriceRange}
            setMinRating={setMinRating}
            setVerifiedOnly={setVerifiedOnly}
            activeFilterCount={activeFilterCount}
            clearAllFilters={clearAllFilters}
          />
        </div>
      </div>

      {/* Mobile Filter Button & Sheet */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className={styles.mobileButton}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="bg-highlight text-white ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className={styles.sheetContent}>
            <SheetHeader className={styles.sheetHeader}>
              <SheetTitle className={styles.sheetTitle}>
                <SlidersHorizontal className="w-5 h-5" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="bg-highlight text-white">
                    {activeFilterCount}
                  </Badge>
                )}
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-140px)]">
              <div className="p-5">
                <FilterContent 
                  filters={filters}
                  countryOpen={countryOpen}
                  setCountryOpen={setCountryOpen}
                  countrySearch={countrySearch}
                  setCountrySearch={setCountrySearch}
                  filteredCountries={filteredCountries}
                  toggleCountry={toggleCountry}
                  specialtyOpen={specialtyOpen}
                  setSpecialtyOpen={setSpecialtyOpen}
                  toggleSpecialty={toggleSpecialty}
                  setPriceRange={setPriceRange}
                  setMinRating={setMinRating}
                  setVerifiedOnly={setVerifiedOnly}
                  activeFilterCount={activeFilterCount}
                  clearAllFilters={clearAllFilters}
                />
              </div>
            </ScrollArea>
            <div className={styles.sheetFooter}>
              <Button 
                className="w-full bg-highlight hover:bg-highlight/90 text-highlight-foreground"
                onClick={() => setMobileOpen(false)}
              >
                Show {resultCount} results
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
