import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Video, Phone, Clock, FileText, ChevronDown } from 'lucide-react';
import { DoctorDashboardService } from '../../../services/dashboardService';
import type { Consultation } from '../../../types/dashboard';
import { useDebounce } from '../../../hooks/useDebounce';

const ConsultationList: React.FC = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadConsultations();
  }, [statusFilter, page]);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      const response = await DoctorDashboardService.getConsultations({
        status: statusFilter === 'all' ? undefined : statusFilter,
        page
      });
      setConsultations(response.items);
    } catch (error) {
      console.error('Failed to load consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConsultations = consultations.filter(c =>
    (c.patientName || '').toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return '--';
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '--';
    return date.toLocaleDateString();
  };

  const formatTime = (value?: string | null) => {
    if (!value) return '--';
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '--';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (value?: number | string | null) => {
    if (value === null || value === undefined || value === '') return '--';
    const numeric = Number(value);
    return Number.isFinite(numeric) ? `BDT ${numeric.toLocaleString()}` : '--';
  };

  const formatDuration = (value?: number | string | null) => {
    if (value === null || value === undefined || value === '') return '--';
    const numeric = Number(value);
    return Number.isFinite(numeric) ? `${numeric} min` : '--';
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-gradient-to-b from-white/80 via-white/70 to-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/40 bg-white/80 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200/40 bg-white/80 hover:bg-gray-50 transition-all text-sm font-medium"
          >
            <Filter size={18} />
            Filters
            <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200/40">
            <p className="text-sm font-medium text-gray-700 mb-3">Status</p>
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'scheduled', 'in-progress', 'completed', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Consultations List */}
      <div className="bg-gradient-to-b from-white/80 via-white/70 to-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/40 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Consultation History</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading consultations...</p>
          </div>
        ) : filteredConsultations.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No consultations found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConsultations.map(consultation => {
              const displayName = consultation.patientName || 'Unknown patient';
              const patientInitial = displayName ? displayName.charAt(0).toUpperCase() : '?';
              const statusLabel = consultation.status || 'unknown';
              const typeLabel = consultation.type || 'Unknown';
              const gestationValue =
                consultation.gestationalWeek === null ||
                consultation.gestationalWeek === undefined
                  ? null
                  : Number(consultation.gestationalWeek);

              return (
                <div
                  key={consultation.id}
                  className="p-4 rounded-xl border border-gray-200/40 bg-white/80 hover:shadow-md transition-all cursor-pointer"
                >
                <div className="flex items-center justify-between">
                  {/* Left Section */}
                  <div className="flex items-center gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                      {patientInitial}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-1">{displayName}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(consultation.scheduledAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatTime(consultation.scheduledAt)}
                        </span>
                        <span className="text-teal-600 font-medium">
                          {Number.isFinite(gestationValue) ? `${gestationValue} weeks` : '--'}
                        </span>
                        <span className="flex items-center gap-1">
                          {consultation.type === 'video' ? <Video size={12} /> : consultation.type === 'phone' ? <Phone size={12} /> : <FileText size={12} />}
                          {typeLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex items-center gap-3">
                    {/* Fee */}
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(consultation.fee)}</p>
                      <p className="text-xs text-gray-500">{formatDuration(consultation.duration)}</p>
                    </div>

                    {/* Status */}
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border ${getStatusColor(statusLabel)}`}>
                      {statusLabel}
                    </div>

                    {/* Prescription Badge */}
                    {consultation.prescriptionId && (
                      <div className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-medium flex items-center gap-1">
                        <FileText size={12} />
                        Rx
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes Preview */}
                {consultation.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200/40">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Notes:</span> {consultation.notes.substring(0, 100)}
                      {consultation.notes.length > 100 && '...'}
                    </p>
                  </div>
                )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationList;
