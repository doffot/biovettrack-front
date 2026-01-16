// src/components/invoices/DateRangeSelector.tsx
import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { DateRangeType } from "../../types/reportTypes";

interface DateRangeSelectorProps {
  dateRange: DateRangeType;
  customFrom: string;
  customTo: string;
  onDateRangeChange: (dateRange: DateRangeType) => void;
  onCustomFromChange: (date: string) => void;
  onCustomToChange: (date: string) => void;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

const PRESET_OPTIONS: { value: DateRangeType; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "year", label: "Este año" },
  { value: "all", label: "Todo" },
];

export function DateRangeSelector({
  dateRange,
  customFrom,
  customTo,
  onDateRangeChange,
  onCustomFromChange,
  onCustomToChange,
}: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"presets" | "months" | "calendar">("presets");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const [tempFrom, setTempFrom] = useState<string>("");
  const [tempTo, setTempTo] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sincronizar temp con valores actuales al abrir
  useEffect(() => {
    if (isOpen && view === "calendar") {
      setTempFrom(customFrom);
      setTempTo(customTo);
      setSelectingStart(true);
    }
  }, [isOpen, view, customFrom, customTo]);

  const handlePresetSelect = (preset: DateRangeType) => {
    onDateRangeChange(preset);
    if (preset !== "custom") {
      onCustomFromChange("");
      onCustomToChange("");
    }
    setIsOpen(false);
  };

  const handleMonthSelect = (monthIndex: number) => {
    const year = calendarDate.getFullYear();
    const startOfMonth = new Date(year, monthIndex, 1);
    const endOfMonth = new Date(year, monthIndex + 1, 0);
    
    const fromStr = formatDateToString(startOfMonth);
    const toStr = formatDateToString(endOfMonth);
    
    onDateRangeChange("custom");
    onCustomFromChange(fromStr);
    onCustomToChange(toStr);
    setIsOpen(false);
  };

  const handleDayClick = (day: Date) => {
    const dateStr = formatDateToString(day);
    
    if (selectingStart) {
      setTempFrom(dateStr);
      setTempTo("");
      setSelectingStart(false);
    } else {
      if (tempFrom && dateStr < tempFrom) {
        setTempTo(tempFrom);
        setTempFrom(dateStr);
      } else {
        setTempTo(dateStr);
      }
      setSelectingStart(true);
    }
  };

  const applyCustomRange = () => {
    if (tempFrom) {
      onDateRangeChange("custom");
      onCustomFromChange(tempFrom);
      onCustomToChange(tempTo || tempFrom);
      setIsOpen(false);
    }
  };

  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isInRange = (day: Date): boolean => {
    if (!tempFrom) return false;
    const dayStr = formatDateToString(day);
    if (!tempTo) return dayStr === tempFrom;
    return dayStr >= tempFrom && dayStr <= tempTo;
  };

  const isEdge = (day: Date): boolean => {
    const dayStr = formatDateToString(day);
    return dayStr === tempFrom || dayStr === tempTo;
  };

  const getDisplayLabel = (): string => {
    if (dateRange === "custom" && customFrom) {
      if (customTo && customFrom !== customTo) {
        const from = new Date(customFrom + "T00:00:00");
        const to = new Date(customTo + "T00:00:00");
        
        if (from.getDate() === 1) {
          const lastDayOfMonth = new Date(from.getFullYear(), from.getMonth() + 1, 0);
          if (to.getTime() === lastDayOfMonth.getTime()) {
            return from.toLocaleDateString("es-VE", { month: "long", year: "numeric" });
          }
        }
        
        return `${formatDisplayDate(customFrom)} - ${formatDisplayDate(customTo)}`;
      }
      return formatDisplayDate(customFrom);
    }
    
    const preset = PRESET_OPTIONS.find(p => p.value === dateRange);
    return preset?.label || "Seleccionar";
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-md hover:border-slate-600 transition-colors text-sm text-vet-text"
      >
        <Calendar className="w-4 h-4 text-vet-muted" />
        <span>{getDisplayLabel()}</span>
        <ChevronDown className={`w-4 h-4 text-vet-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-slate-800 rounded-lg shadow-card border border-slate-700 z-50 min-w-[280px]">
          {/* Tabs de navegación */}
          <div className="flex items-center justify-between p-2 border-b border-slate-700">
            <div className="flex gap-1">
              <button
                onClick={() => setView("presets")}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  view === "presets"
                    ? "bg-vet-primary text-white"
                    : "text-vet-muted hover:bg-slate-700"
                }`}
              >
                Rápido
              </button>
              <button
                onClick={() => setView("months")}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  view === "months"
                    ? "bg-vet-primary text-white"
                    : "text-vet-muted hover:bg-slate-700"
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => {
                  setView("calendar");
                  setTempFrom(customFrom);
                  setTempTo(customTo);
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  view === "calendar"
                    ? "bg-vet-primary text-white"
                    : "text-vet-muted hover:bg-slate-700"
                }`}
              >
                Rango
              </button>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-700 rounded"
            >
              <X className="w-4 h-4 text-vet-muted" />
            </button>
          </div>

          {/* Vista de presets */}
          {view === "presets" && (
            <div className="p-2">
              {PRESET_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePresetSelect(option.value)}
                  className={`w-full px-3 py-2 text-sm text-left rounded transition-colors ${
                    dateRange === option.value && !customFrom
                      ? "bg-vet-primary text-white"
                      : "text-vet-text hover:bg-slate-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {/* Vista de meses */}
          {view === "months" && (
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setCalendarDate(new Date(calendarDate.getFullYear() - 1, 0))}
                  className="p-1 hover:bg-slate-700 rounded"
                >
                  <ChevronLeft className="w-4 h-4 text-vet-muted" />
                </button>
                <span className="text-sm font-medium text-vet-text">{calendarDate.getFullYear()}</span>
                <button
                  onClick={() => setCalendarDate(new Date(calendarDate.getFullYear() + 1, 0))}
                  className="p-1 hover:bg-slate-700 rounded"
                >
                  <ChevronRight className="w-4 h-4 text-vet-muted" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1">
                {MONTHS.map((month, index) => {
                  const now = new Date();
                  const isCurrentMonth =
                    now.getMonth() === index &&
                    now.getFullYear() === calendarDate.getFullYear();
                  
                  const monthStart = `${calendarDate.getFullYear()}-${String(index + 1).padStart(2, "0")}-01`;
                  const lastDay = new Date(calendarDate.getFullYear(), index + 1, 0).getDate();
                  const monthEnd = `${calendarDate.getFullYear()}-${String(index + 1).padStart(2, "0")}-${lastDay}`;
                  const isSelected = customFrom === monthStart && customTo === monthEnd;

                  return (
                    <button
                      key={month}
                      onClick={() => handleMonthSelect(index)}
                      className={`px-2 py-2 text-sm rounded transition-colors ${
                        isSelected
                          ? "bg-vet-primary text-white"
                          : isCurrentMonth
                          ? "bg-vet-primary/20 text-vet-primary font-medium"
                          : "text-vet-text hover:bg-slate-700"
                      }`}
                    >
                      {month.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vista de calendario */}
          {view === "calendar" && (
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))}
                  className="p-1 hover:bg-slate-700 rounded"
                >
                  <ChevronLeft className="w-4 h-4 text-vet-muted" />
                </button>
                <span className="text-sm font-medium text-vet-text">
                  {MONTHS[calendarDate.getMonth()]} {calendarDate.getFullYear()}
                </span>
                <button
                  onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))}
                  className="p-1 hover:bg-slate-700 rounded"
                >
                  <ChevronRight className="w-4 h-4 text-vet-muted" />
                </button>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {DAYS.map((day) => (
                  <div key={day} className="text-center text-xs text-vet-muted py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-0.5">
                {getDaysInMonth(calendarDate).map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="h-7" />;
                  }

                  const today = new Date();
                  const isToday =
                    day.getDate() === today.getDate() &&
                    day.getMonth() === today.getMonth() &&
                    day.getFullYear() === today.getFullYear();
                  const inRange = isInRange(day);
                  const edge = isEdge(day);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDayClick(day)}
                      className={`h-7 text-xs rounded transition-colors flex items-center justify-center ${
                        edge
                          ? "bg-vet-primary text-white"
                          : inRange
                          ? "bg-vet-primary/20 text-vet-primary"
                          : isToday
                          ? "ring-1 ring-vet-primary text-vet-primary"
                          : "text-vet-text hover:bg-slate-700"
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>

              {/* Footer con selección y botón */}
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-xs text-vet-muted mb-2">
                  {selectingStart ? "Selecciona fecha inicio" : "Selecciona fecha fin"}
                </p>
                {tempFrom && (
                  <p className="text-sm text-vet-text mb-2">
                    {formatDisplayDate(tempFrom)}
                    {tempTo && tempTo !== tempFrom && ` → ${formatDisplayDate(tempTo)}`}
                  </p>
                )}
                <button
                  onClick={applyCustomRange}
                  disabled={!tempFrom}
                  className="w-full py-2 bg-vet-primary text-white text-sm font-medium rounded-md hover:bg-vet-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}