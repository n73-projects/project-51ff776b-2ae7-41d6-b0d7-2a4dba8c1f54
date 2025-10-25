import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, addMonths, subMonths, addWeeks } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, StickyNote, TrendingUp, TrendingDown } from 'lucide-react';

// Mock data for trading days
interface TradingDay {
  date: Date;
  pnl: number;
  hasNote: boolean;
  trades: number;
}

// Generate mock trading data
const generateMockData = (month: Date): TradingDay[] => {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });
  
  return days.map(date => ({
    date,
    pnl: Math.random() > 0.4 ? (Math.random() - 0.3) * 1000 : 0, // 60% chance of trading
    hasNote: Math.random() > 0.7, // 30% chance of having a note
    trades: Math.random() > 0.4 ? Math.floor(Math.random() * 8) + 1 : 0,
  }));
};

const TradingCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<TradingDay | null>(null);
  
  const tradingData = generateMockData(currentMonth);
  
  const getDayStyle = (day: TradingDay) => {
    if (day.pnl === 0) return 'bg-gray-100 text-gray-500'; // No trading
    if (day.pnl > 0) return 'bg-green-100 text-green-800 border-green-200'; // Profit
    if (day.pnl < 0) return 'bg-red-100 text-red-800 border-red-200'; // Loss
    return 'bg-gray-50'; // Breakeven
  };
  
  const formatPnL = (pnl: number) => {
    const sign = pnl >= 0 ? '+' : '';
    return `${sign}$${pnl.toFixed(0)}`;
  };
  
  const getMonthlyStats = () => {
    const totalPnL = tradingData.reduce((sum, day) => sum + day.pnl, 0);
    const tradingDays = tradingData.filter(day => day.trades > 0).length;
    const winningDays = tradingData.filter(day => day.pnl > 0).length;
    const losingDays = tradingData.filter(day => day.pnl < 0).length;
    const winRate = tradingDays > 0 ? (winningDays / tradingDays * 100).toFixed(1) : '0.0';
    
    return { totalPnL, tradingDays, winningDays, losingDays, winRate };
  };
  
  const getWeeklyData = () => {
    const weeks: Array<{ start: Date; pnl: number; days: number }> = [];
    let current = startOfWeek(startOfMonth(currentMonth));
    const monthEnd = endOfMonth(currentMonth);
    
    while (current <= monthEnd) {
      const weekEnd = endOfWeek(current);
      const weekData = tradingData.filter(day => 
        day.date >= current && day.date <= weekEnd && day.trades > 0
      );
      
      weeks.push({
        start: current,
        pnl: weekData.reduce((sum, day) => sum + day.pnl, 0),
        days: weekData.length
      });
      
      current = addWeeks(current, 1);
    }
    
    return weeks;
  };
  
  const monthlyStats = getMonthlyStats();
  const weeklyData = getWeeklyData();
  
  // Calendar grid setup
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trading Calendar</h1>
          <p className="text-gray-600 mt-1">Track your trading performance day by day</p>
        </div>
        
        {/* Month Navigation */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[200px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Calendar View
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-200 rounded"></div>
                    <span>Profit</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-200 rounded"></div>
                    <span>Loss</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-200 rounded"></div>
                    <span>No Trading</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map(day => {
                  const dayData = tradingData.find(d => 
                    format(d.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                  );
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isCurrentDay = isToday(day);
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                        relative p-1 min-h-[80px] border border-gray-200 cursor-pointer transition-all hover:shadow-md
                        ${isCurrentMonth ? '' : 'opacity-40'}
                        ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}
                        ${dayData ? getDayStyle(dayData) : 'bg-white'}
                      `}
                      onClick={() => dayData && setSelectedDay(dayData)}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${isCurrentDay ? 'font-bold' : ''}`}>
                            {format(day, 'd')}
                          </span>
                          {dayData?.hasNote && (
                            <StickyNote className="h-3 w-3 text-blue-500" />
                          )}
                        </div>
                        
                        {dayData && dayData.trades > 0 && (
                          <div className="flex-1 flex flex-col justify-center">
                            <div className="text-xs font-semibold">
                              {formatPnL(dayData.pnl)}
                            </div>
                            <div className="text-xs text-gray-600">
                              {dayData.trades} trade{dayData.trades !== 1 ? 's' : ''}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Monthly Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total P&L</span>
                <span className={`font-semibold ${monthlyStats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPnL(monthlyStats.totalPnL)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Trading Days</span>
                <span className="font-semibold">{monthlyStats.tradingDays}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Win Rate</span>
                <span className="font-semibold">{monthlyStats.winRate}%</span>
              </div>
              <div className="flex items-center space-x-4 pt-2">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">{monthlyStats.winningDays}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">{monthlyStats.losingDays}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {weeklyData.map((week, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium">Week {index + 1}</div>
                    <div className="text-xs text-gray-500">{week.days} days</div>
                  </div>
                  <Badge variant={week.pnl >= 0 ? "default" : "destructive"}>
                    {formatPnL(week.pnl)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Selected Day Details */}
          {selectedDay && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(selectedDay.date, 'MMM d, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">P&L</span>
                  <span className={`font-semibold ${selectedDay.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPnL(selectedDay.pnl)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Trades</span>
                  <span className="font-semibold">{selectedDay.trades}</span>
                </div>
                {selectedDay.hasNote && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <StickyNote className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-blue-600">Journal entry available</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingCalendar;