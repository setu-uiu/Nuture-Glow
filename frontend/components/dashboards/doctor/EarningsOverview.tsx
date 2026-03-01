import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, CreditCard } from 'lucide-react';
import type { DoctorEarnings } from '../../../types/dashboard';

interface EarningsOverviewProps {
  earnings: DoctorEarnings;
}

const EarningsOverview: React.FC<EarningsOverviewProps> = ({ earnings }) => {
  const safeNumber = (value?: number | string | null) => {
    if (value === null || value === undefined || value === '') return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const totalEarnings = safeNumber(earnings.totalEarnings);
  const thisMonth = safeNumber(earnings.thisMonth);
  const lastMonth = safeNumber(earnings.lastMonth);
  const pendingPayments = safeNumber(earnings.pendingPayments);

  const monthChange = thisMonth !== null && lastMonth !== null ? thisMonth - lastMonth : null;
  const monthChangePercent =
    monthChange !== null && lastMonth && lastMonth > 0
      ? ((monthChange / lastMonth) * 100).toFixed(1)
      : null;
  const isPositive = monthChange !== null ? monthChange >= 0 : true;

  const formatCurrency = (value?: number | string | null) => {
    if (value === null || value === undefined || value === '') return '--';
    const numeric = Number(value);
    return Number.isFinite(numeric) ? `BDT ${numeric.toLocaleString()}` : '--';
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return '--';
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '--';
    return `${date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })} at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 backdrop-blur-sm rounded-2xl p-6 border border-teal-200/40 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center shadow-md">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-teal-600" />
          </div>
          <p className="text-xs text-teal-700 font-medium uppercase mb-1">Total Earnings</p>
          <p className="text-3xl font-bold text-teal-900">{formatCurrency(totalEarnings)}</p>
          <p className="text-xs text-teal-600 mt-2">All time</p>
        </div>

        {/* This Month */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/40 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </div>
          <p className="text-xs text-blue-700 font-medium uppercase mb-1">This Month</p>
          <p className="text-3xl font-bold text-blue-900">{formatCurrency(thisMonth)}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isPositive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {monthChangePercent === null ? '--' : `${isPositive ? '+' : ''}${monthChangePercent}%`}
            </span>
            <span className="text-xs text-blue-600">vs last month</span>
          </div>
        </div>

        {/* Consultations */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/40 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-xs text-purple-700 font-medium uppercase mb-1">Consultations</p>
          <p className="text-3xl font-bold text-purple-900">{earnings.consultationCount}</p>
          <p className="text-xs text-purple-600 mt-2">Completed</p>
        </div>

        {/* Pending Payments */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/40 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center shadow-md">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-xs text-amber-700 font-medium uppercase mb-1">Pending</p>
          <p className="text-3xl font-bold text-amber-900">{formatCurrency(pendingPayments)}</p>
          <p className="text-xs text-amber-600 mt-2">Being processed</p>
        </div>
      </div>

      {/* Earnings History */}
      <div className="bg-gradient-to-b from-white/80 via-white/70 to-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Earnings</h2>
        
        {earnings.earningsHistory.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No earnings history yet</p>
            <p className="text-sm text-gray-400 mt-1">Complete consultations to start earning</p>
          </div>
        ) : (
          <div className="space-y-2">
            {earnings.earningsHistory.map((earning, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-gray-200/40 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>

                  {/* Info */}
                  <div>
                    <p className="font-bold text-gray-900">Consultation Payment</p>
                    <p className="text-xs text-gray-600">
                      {formatDateTime(earning.date)}
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className="text-lg font-bold text-teal-600">+ {formatCurrency(earning.amount)}</p>
                  <p className="text-xs text-gray-500">
                    ID: {earning.consultationId ? earning.consultationId.substring(0, 8) : '--'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Month Comparison */}
      <div className="bg-gradient-to-b from-white/80 via-white/70 to-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Month Comparison</h2>
        
        <div className="space-y-4">
          {/* This Month Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">This Month</span>
              <span className="text-sm font-bold text-teal-600">{formatCurrency(thisMonth)}</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-500"
                style={{ 
                  width: `${totalEarnings ? Math.min((Number(thisMonth) / totalEarnings) * 100, 100) : 0}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Last Month Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Last Month</span>
              <span className="text-sm font-bold text-blue-600">{formatCurrency(lastMonth)}</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ 
                  width: `${totalEarnings ? Math.min((Number(lastMonth) / totalEarnings) * 100, 100) : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Change Indicator */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPositive ? (
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-700">Monthly Change</p>
                <p className="text-xs text-gray-600">Compared to last month</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {monthChange === null ? '--' : `${isPositive ? '+ ' : ''}${formatCurrency(Math.abs(monthChange))}`}
              </p>
              <p className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {monthChangePercent === null ? '--' : `${isPositive ? '+' : ''}${monthChangePercent}%`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsOverview;
