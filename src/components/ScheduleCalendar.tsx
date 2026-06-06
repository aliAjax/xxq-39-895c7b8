import { useState, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Bell,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  X,
  Filter,
} from 'lucide-react';
import { ClothingElement, CATEGORY_LABELS, STATUS_LABELS, ProductionStatus } from '../types';
import { useStore } from '../store/useStore';
import {
  getStartOfDay,
  isSameDay,
  getStartOfWeek,
  getStartOfMonth,
  getMonthMatrix,
  isToday as isTodayUtil,
  isCurrentMonth as isCurrentMonthUtil,
  formatRangeText,
} from '../utils/dateUtils';

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

type ViewMode = 'week' | 'month';
type FilterStatus = 'all' | 'overdue' | 'pending' | 'in_progress';

interface ScheduledElement extends ClothingElement {
  displayDate: number;
  isStartDate: boolean;
  isDueDate: boolean;
}

const getElementStatusCategory = (element: ClothingElement): FilterStatus => {
  const today = getStartOfDay(Date.now());
  const status = element.status as ProductionStatus;

  if (element.scheduleDueDate && status !== 'completed') {
    const dueDay = getStartOfDay(element.scheduleDueDate);
    if (dueDay < today) {
      return 'overdue';
    }
  }

  if (status === 'in_progress') {
    return 'in_progress';
  }

  if (status === 'pending' || status === 'confirmed') {
    return 'pending';
  }

  return 'all';
};

const FILTER_LABELS: Record<FilterStatus, string> = {
  all: '全部',
  overdue: '已逾期',
  pending: '待开始',
  in_progress: '制作中',
};

export function ScheduleCalendar() {
  const {
    characters,
    activeCharacterId,
    setSelectedElement,
    setShowScheduleCalendar,
  } = useStore();

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [currentAnchor, setCurrentAnchor] = useState(() => getStartOfDay(Date.now()));

  const character = characters.find((c) => c.id === activeCharacterId);

  const weekDates = useMemo(() => {
    const weekStart = getStartOfWeek(currentAnchor);
    const dates: number[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      dates.push(date.getTime());
    }
    return dates;
  }, [currentAnchor]);

  const monthDates = useMemo(() => {
    const monthStart = getStartOfMonth(currentAnchor);
    return getMonthMatrix(monthStart);
  }, [currentAnchor]);

  const scheduledElements = useMemo(() => {
    if (!character) return { withSchedule: [], withoutSchedule: [] };

    const withSchedule: ScheduledElement[] = [];
    const withoutSchedule: ClothingElement[] = [];

    character.elements.forEach((element) => {
      const hasStart = !!element.scheduleStartDate;
      const hasDue = !!element.scheduleDueDate;

      if (!hasStart && !hasDue) {
        withoutSchedule.push(element);
        return;
      }

      if (hasStart && hasDue) {
        const startDay = getStartOfDay(element.scheduleStartDate!);
        const dueDay = getStartOfDay(element.scheduleDueDate!);
        const oneDay = 24 * 60 * 60 * 1000;

        if (startDay === dueDay) {
          withSchedule.push({
            ...element,
            displayDate: startDay,
            isStartDate: true,
            isDueDate: true,
          });
        } else {
          const minDay = Math.min(startDay, dueDay);
          const maxDay = Math.max(startDay, dueDay);
          const daysCount = Math.round((maxDay - minDay) / oneDay) + 1;

          for (let i = 0; i < daysCount; i++) {
            const currentDay = minDay + i * oneDay;
            withSchedule.push({
              ...element,
              displayDate: currentDay,
              isStartDate: currentDay === startDay,
              isDueDate: currentDay === dueDay,
            });
          }
        }
      } else if (hasStart) {
        withSchedule.push({
          ...element,
          displayDate: getStartOfDay(element.scheduleStartDate!),
          isStartDate: true,
          isDueDate: false,
        });
      } else if (hasDue) {
        withSchedule.push({
          ...element,
          displayDate: getStartOfDay(element.scheduleDueDate!),
          isStartDate: false,
          isDueDate: true,
        });
      }
    });

    return { withSchedule, withoutSchedule };
  }, [character]);

  const filteredScheduledElements = useMemo(() => {
    if (filterStatus === 'all') return scheduledElements.withSchedule;

    const elementIds = new Set(
      character?.elements
        .filter((el) => getElementStatusCategory(el) === filterStatus)
        .map((el) => el.id) || []
    );

    return scheduledElements.withSchedule.filter((el) => elementIds.has(el.id));
  }, [scheduledElements.withSchedule, filterStatus, character]);

  const filteredWithoutSchedule = useMemo(() => {
    if (filterStatus === 'all') return scheduledElements.withoutSchedule;

    return scheduledElements.withoutSchedule.filter(
      (el) => getElementStatusCategory(el) === filterStatus
    );
  }, [scheduledElements.withoutSchedule, filterStatus]);

  const getElementsForDate = useCallback(
    (date: number) => {
      return filteredScheduledElements.filter((el) => isSameDay(el.displayDate, date));
    },
    [filteredScheduledElements]
  );

  const getStatusColor = (element: ScheduledElement) => {
    const status = element.status as string;
    const { isStartDate, isDueDate } = element;
    const isDuring = !isStartDate && !isDueDate;

    if (status === 'completed') {
      return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300';
    }

    if (isDueDate && status !== 'completed') {
      const today = getStartOfDay(Date.now());
      if (element.displayDate < today) {
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      }
      return 'bg-orange-500/20 border-orange-500/50 text-orange-300';
    }

    if (element.needToBuy && isStartDate) {
      return 'bg-amber-500/20 border-amber-500/50 text-amber-300';
    }

    if (status === 'in_progress') {
      return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
    }

    if (isDuring) {
      return 'bg-white/5 border-white/10 text-gray-400';
    }

    return 'bg-white/10 border-white/20 text-gray-300';
  };

  const getStatusIcon = (element: ClothingElement) => {
    const status = element.status as string;
    if (status === 'completed') {
      return <CheckCircle size={12} />;
    }
    if (element.needToBuy && status !== 'completed') {
      return <ShoppingCart size={12} />;
    }
    if (status === 'in_progress') {
      return <Clock size={12} />;
    }
    return <AlertCircle size={12} />;
  };

  const navigatePrev = () => {
    const newDate = new Date(currentAnchor);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentAnchor(newDate.getTime());
  };

  const navigateNext = () => {
    const newDate = new Date(currentAnchor);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentAnchor(newDate.getTime());
  };

  const goToToday = () => {
    setCurrentAnchor(getStartOfDay(Date.now()));
  };

  const handleElementClick = (elementId: string) => {
    setSelectedElement(elementId);
    setShowScheduleCalendar(false);
  };

  const rangeText = useMemo(
    () => formatRangeText(viewMode, weekDates, currentAnchor),
    [viewMode, weekDates, currentAnchor]
  );

  const renderElementCard = (element: ScheduledElement, idx: number, compact: boolean = false) => {
    const { isStartDate, isDueDate } = element;
    const isDuring = !isStartDate && !isDueDate;
    const status = element.status as string;
    const isOverdue = isDueDate && status !== 'completed' && element.displayDate < getStartOfDay(Date.now());

    return (
      <div
        key={`${element.id}-${idx}`}
        onClick={() => handleElementClick(element.id)}
        className={`p-2 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
          isDuring ? 'opacity-70' : ''
        } ${getStatusColor(element)}`}
      >
        <div className="flex items-center gap-1.5">
          {getStatusIcon(element)}
          <span className={`font-medium truncate ${compact ? 'text-xs' : 'text-sm'}`}>
            {element.name || '未命名'}
          </span>
        </div>
        {!compact && (
          <>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs opacity-70">
                {CATEGORY_LABELS[element.category]}
              </span>
              <span className="text-xs opacity-70">
                {STATUS_LABELS[element.status]}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {isStartDate && (
                <span className="text-xs px-1.5 py-0.5 bg-white/10 rounded">
                  开始
                </span>
              )}
              {isDuring && (
                <span className="text-xs px-1.5 py-0.5 bg-white/10 rounded">
                  进行中
                </span>
              )}
              {isDueDate && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    isOverdue
                      ? 'bg-red-500/30 text-red-300'
                      : 'bg-white/10'
                  }`}
                >
                  {isOverdue ? '已逾期' : '截止'}
                </span>
              )}
              {element.needToBuy && (
                <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded">
                  待采购
                </span>
              )}
            </div>
            {element.scheduleReminder && (isStartDate || isDueDate) && (
              <div className="flex items-start gap-1 mt-2 text-xs opacity-80">
                <Bell size={10} className="mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">
                  {element.scheduleReminder}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderWeekView = () => (
    <div className="space-y-4">
      {weekDates.map((date) => {
        const dateObj = new Date(date);
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        const weekday = WEEKDAYS[dateObj.getDay()];
        const elements = getElementsForDate(date);
        const today = isTodayUtil(date);

        return (
          <div key={date} className="bg-white/5 rounded-xl overflow-hidden">
            <div
              className={`px-4 py-2 flex items-center justify-between ${
                today ? 'bg-accent/20 border-b border-accent/30' : 'bg-white/5 border-b border-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    today ? 'text-accent' : 'text-gray-400'
                  }`}
                >
                  {weekday}
                </span>
                <span
                  className={`text-lg font-bold ${
                    today ? 'text-white' : 'text-gray-300'
                  }`}
                >
                  {month}/{day}
                </span>
              </div>
              {elements.length > 0 && (
                <span className="text-xs text-gray-500">
                  {elements.length} 项
                </span>
              )}
            </div>

            <div className="p-3 space-y-2">
              {elements.length === 0 ? (
                <p className="text-xs text-gray-600 text-center py-2">暂无排期</p>
              ) : (
                elements.map((element, idx) => renderElementCard(element, idx, false))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderMonthView = () => {
    const weeks: number[][] = [];
    for (let i = 0; i < monthDates.length; i += 7) {
      weeks.push(monthDates.slice(i, i + 7));
    }

    return (
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-7 gap-px mb-px">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-xs text-gray-500 py-2 font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-px bg-white/5 rounded-xl overflow-hidden">
          {monthDates.map((date) => {
            const elements = getElementsForDate(date);
            const today = isTodayUtil(date);
            const inMonth = isCurrentMonthUtil(date, currentAnchor);

            return (
              <div
                key={date}
                className={`bg-primary-light min-h-[100px] p-1.5 flex flex-col ${
                  !inMonth ? 'opacity-40' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                      today
                        ? 'bg-accent text-white'
                        : inMonth
                        ? 'text-gray-400'
                        : 'text-gray-600'
                    }`}
                  >
                    {new Date(date).getDate()}
                  </span>
                  {elements.length > 0 && (
                    <span className="text-[10px] text-gray-500 pr-1">
                      {elements.length}
                    </span>
                  )}
                </div>
                <div className="space-y-1 overflow-hidden flex-1">
                  {elements.slice(0, 3).map((element, idx) => (
                    <div
                      key={`${element.id}-${idx}`}
                      onClick={() => handleElementClick(element.id)}
                      className={`text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${
                        getStatusColor(element)
                      }`}
                    >
                      {element.name || '未命名'}
                    </div>
                  ))}
                  {elements.length > 3 && (
                    <div className="text-[10px] text-gray-500 px-1.5">
                      +{elements.length - 3} 更多
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!character) {
    return (
      <div className="w-96 bg-primary-light border-l border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <p className="text-gray-400">请选择一个角色</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-primary-light border-l border-white/10 flex flex-col animate-slide-in">
      <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <CalendarIcon size={20} className="text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">制作排期日历</h2>
            <p className="text-xs text-gray-400">{rangeText}</p>
          </div>
        </div>
        <button
          onClick={() => setShowScheduleCalendar(false)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-400" />
        </button>
      </div>

      <div className="p-4 border-b border-white/10 flex items-center justify-between gap-2 flex-shrink-0">
        <button
          onClick={navigatePrev}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-300" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-4 py-1.5 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg text-sm font-medium transition-colors"
          >
            今天
          </button>
        </div>
        <button
          onClick={navigateNext}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronRight size={20} className="text-gray-300" />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'week'
                ? 'bg-accent/20 text-accent'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            周视图
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'month'
                ? 'bg-accent/20 text-accent'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            月视图
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-accent/50"
          >
            {(['all', 'overdue', 'pending', 'in_progress'] as FilterStatus[]).map((status) => (
              <option key={status} value={status}>
                {FILTER_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'week' ? renderWeekView() : renderMonthView()}

        {filteredWithoutSchedule.length > 0 && (
          <div className="mt-6 bg-white/5 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-white/5 border-b border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">未排期元素</span>
                <span className="text-xs text-gray-500">
                  {filteredWithoutSchedule.length} 项
                </span>
              </div>
            </div>
            <div className="p-3 space-y-2">
              {filteredWithoutSchedule.map((element) => (
                <div
                  key={element.id}
                  onClick={() => handleElementClick(element.id)}
                  className="p-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer transition-all hover:bg-white/10 hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle size={12} className="text-gray-500" />
                    <span className="font-medium text-sm text-gray-300 truncate">
                      {element.name || '未命名'}
                    </span>
                    <span className="text-xs text-gray-600 ml-auto">
                      {CATEGORY_LABELS[element.category]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500/50" />
            <span className="text-gray-400">已完成</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-500/50" />
            <span className="text-gray-400">制作中</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-500/50" />
            <span className="text-gray-400">待采购</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-orange-500/50" />
            <span className="text-gray-400">即将截止</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500/50" />
            <span className="text-gray-400">已逾期</span>
          </div>
        </div>
      </div>
    </div>
  );
}
