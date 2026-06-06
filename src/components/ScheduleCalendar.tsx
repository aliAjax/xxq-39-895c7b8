import { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { ClothingElement, CATEGORY_LABELS, STATUS_LABELS } from '../types';
import { useStore } from '../store/useStore';

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

type DisplayType = 'start' | 'during' | 'end' | 'single';

interface ScheduledElement extends ClothingElement {
  displayDate: number;
  displayType: DisplayType;
}

export function ScheduleCalendar() {
  const {
    characters,
    activeCharacterId,
    setSelectedElement,
    setShowScheduleCalendar,
  } = useStore();

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start.getTime();
  });

  const character = characters.find((c) => c.id === activeCharacterId);

  const weekDates = useMemo(() => {
    const dates: number[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      dates.push(date.getTime());
    }
    return dates;
  }, [currentWeekStart]);

  const getStartOfDay = (timestamp: number) => {
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  };

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
            displayType: 'single',
          });
        } else {
          const minDay = Math.min(startDay, dueDay);
          const maxDay = Math.max(startDay, dueDay);
          const daysCount = Math.round((maxDay - minDay) / oneDay) + 1;

          for (let i = 0; i < daysCount; i++) {
            const currentDay = minDay + i * oneDay;
            let displayType: DisplayType;
            if (i === 0) {
              displayType = startDay < dueDay ? 'start' : 'end';
            } else if (i === daysCount - 1) {
              displayType = startDay < dueDay ? 'end' : 'start';
            } else {
              displayType = 'during';
            }
            withSchedule.push({
              ...element,
              displayDate: currentDay,
              displayType,
            });
          }
        }
      } else if (hasStart) {
        withSchedule.push({
          ...element,
          displayDate: getStartOfDay(element.scheduleStartDate!),
          displayType: 'single',
        });
      } else if (hasDue) {
        withSchedule.push({
          ...element,
          displayDate: getStartOfDay(element.scheduleDueDate!),
          displayType: 'single',
        });
      }
    });

    return { withSchedule, withoutSchedule };
  }, [character]);

  const getElementsForDate = (date: number) => {
    return scheduledElements.withSchedule.filter((el) => el.displayDate === date);
  };

  const getStatusColor = (element: ScheduledElement) => {
    const status = element.status as string;
    const isEndType = element.displayType === 'end' || element.displayType === 'single';
    const isStartType = element.displayType === 'start' || element.displayType === 'single';

    if (status === 'completed') {
      return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300';
    }

    if (isEndType && status !== 'completed') {
      const today = getStartOfDay(Date.now());
      if (element.displayDate < today) {
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      }
      return 'bg-orange-500/20 border-orange-500/50 text-orange-300';
    }

    if (element.needToBuy && isStartType) {
      return 'bg-amber-500/20 border-amber-500/50 text-amber-300';
    }

    if (status === 'in_progress') {
      return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
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

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newStart.getTime());
  };

  const goToToday = () => {
    const now = new Date();
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    setCurrentWeekStart(start.getTime());
  };

  const handleElementClick = (elementId: string) => {
    setSelectedElement(elementId);
    setShowScheduleCalendar(false);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      month: date.getMonth() + 1,
      day: date.getDate(),
      weekday: WEEKDAYS[date.getDay()],
    };
  };

  const isToday = (timestamp: number) => {
    const today = new Date();
    const date = new Date(timestamp);
    return (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate()
    );
  };

  const weekRangeText = useMemo(() => {
    const start = formatDate(weekDates[0]);
    const end = formatDate(weekDates[6]);
    if (start.month === end.month) {
      return `${start.month}月 ${start.day}日 - ${end.day}日`;
    }
    return `${start.month}月 ${start.day}日 - ${end.month}月 ${end.day}日`;
  }, [weekDates]);

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
            <p className="text-xs text-gray-400">{weekRangeText}</p>
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
          onClick={() => navigateWeek('prev')}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-300" />
        </button>
        <button
          onClick={goToToday}
          className="px-4 py-1.5 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg text-sm font-medium transition-colors"
        >
          今天
        </button>
        <button
          onClick={() => navigateWeek('next')}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronRight size={20} className="text-gray-300" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {weekDates.map((date) => {
            const dateInfo = formatDate(date);
            const elements = getElementsForDate(date);
            const today = isToday(date);

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
                      {dateInfo.weekday}
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        today ? 'text-white' : 'text-gray-300'
                      }`}
                    >
                      {dateInfo.month}/{dateInfo.day}
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
                    elements.map((element, idx) => {
                      const isStartType = element.displayType === 'start' || element.displayType === 'single';
                      const isEndType = element.displayType === 'end' || element.displayType === 'single';
                      const status = element.status as string;
                      const isOverdue = isEndType && status !== 'completed' && element.displayDate < getStartOfDay(Date.now());
                      const isDuring = element.displayType === 'during';

                      return (
                        <div
                          key={`${element.id}-${idx}`}
                          onClick={() => handleElementClick(element.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
                            isDuring ? 'opacity-75' : ''
                          } ${getStatusColor(element)}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(element)}
                                <span className="font-medium text-sm truncate">
                                  {element.name || '未命名'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs opacity-70">
                                  {CATEGORY_LABELS[element.category]}
                                </span>
                                <span className="text-xs opacity-70">
                                  {STATUS_LABELS[element.status]}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                {isStartType && (
                                  <span className="text-xs px-1.5 py-0.5 bg-white/10 rounded">
                                    开始
                                  </span>
                                )}
                                {isDuring && (
                                  <span className="text-xs px-1.5 py-0.5 bg-white/10 rounded">
                                    进行中
                                  </span>
                                )}
                                {isEndType && (
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
                              {element.scheduleReminder && (isStartType || isEndType) && (
                                <div className="flex items-start gap-1 mt-2 text-xs opacity-80">
                                  <Bell size={10} className="mt-0.5 flex-shrink-0" />
                                  <span className="line-clamp-2">
                                    {element.scheduleReminder}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {scheduledElements.withoutSchedule.length > 0 && (
          <div className="mt-6 bg-white/5 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-white/5 border-b border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">未排期元素</span>
                <span className="text-xs text-gray-500">
                  {scheduledElements.withoutSchedule.length} 项
                </span>
              </div>
            </div>
            <div className="p-3 space-y-2">
              {scheduledElements.withoutSchedule.map((element) => (
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
