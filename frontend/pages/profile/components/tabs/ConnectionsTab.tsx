import React, { useState } from 'react';
import { Link, Smartphone, Activity, ChevronRight, Plus, Trash2, Watch, Thermometer, Heart, Droplets, Scale, X } from 'lucide-react';
import { useTranslations } from '../../../../i18n/I18nContext';
import type { Hospital, ConnectedDevice, DeviceType } from '../../../../types';

interface ConnectionsTabProps {
  hospitals: Hospital[];
  devices: ConnectedDevice[];
  onAddDevice: (name: string, type: DeviceType) => Promise<void>;
  onRemoveDevice: (deviceId: string) => Promise<void>;
}

const DEVICE_TYPE_ICONS: Record<DeviceType, React.ElementType> = {
  smartphone: Smartphone,
  smartwatch: Watch,
  bloodPressure: Heart,
  glucometer: Droplets,
  thermometer: Thermometer,
  scale: Scale,
  other: Activity,
};

const ConnectionsTab: React.FC<ConnectionsTabProps> = ({
  hospitals,
  devices,
  onAddDevice,
  onRemoveDevice,
}) => {
  const { t } = useTranslations();
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<DeviceType>('smartphone');
  const [isAdding, setIsAdding] = useState(false);

  const deviceTypes: DeviceType[] = [
    'smartphone', 'smartwatch', 'bloodPressure', 'glucometer', 'thermometer', 'scale', 'other'
  ];

  const handleAddDevice = async () => {
    if (!newDeviceName.trim()) return;
    setIsAdding(true);
    try {
      await onAddDevice(newDeviceName.trim(), newDeviceType);
      setNewDeviceName('');
      setNewDeviceType('smartphone');
      setShowAddDevice(false);
    } finally {
      setIsAdding(false);
    }
  };

  const formatSyncTime = (iso: string | null) => {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(iso).toLocaleDateString();
  };

  return (
    <div className="space-y-8 overflow-x-hidden">
      {/* Connected Hospitals Section */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-amber-50/30 px-8 py-6 border-b border-slate-200">
          <h3 className="text-2xl font-serif text-gray-900 mb-1">
            {t('profile.connections.hospitalsTitle')}
          </h3>
          <p className="text-sm text-gray-500">
            {t('profile.connections.hospitalsSubtitle')}
          </p>
        </div>

        <div className="p-8">
          {hospitals.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {hospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className="py-6 first:pt-0 last:pb-0 flex items-center justify-between hover:bg-amber-50/30 px-4 rounded-lg transition-all group"
                >
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">{hospital.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 font-medium">
                        {hospital.location || hospital.type}
                      </span>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                        Active
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 group-hover:text-amber-600 transition-all" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <Link size={32} className="mx-auto text-slate-300 mb-4" />
              <p className="text-sm font-semibold text-slate-600">
                {t('profile.connections.noHospitals')}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {t('profile.connections.noHospitalsDesc')}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Devices Section */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-purple-50/30 px-8 py-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-serif text-gray-900 mb-1">
              {t('profile.connections.devicesTitle')}
            </h3>
            <p className="text-sm text-gray-500">
              {t('profile.connections.devicesSubtitle')}
            </p>
          </div>
          <button
            onClick={() => setShowAddDevice(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 transition-all shadow-sm"
          >
            <Plus size={16} />
            {t('profile.connections.addDevice')}
          </button>
        </div>

        <div className="p-8">
          {devices.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {devices.map((device) => {
                const DeviceIcon = DEVICE_TYPE_ICONS[device.type] || Activity;
                return (
                  <div
                    key={device.id}
                    className="py-6 first:pt-0 last:pb-0 flex items-center justify-between hover:bg-purple-50/30 px-4 rounded-lg transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-purple-100 text-purple-600 rounded-lg">
                        <DeviceIcon size={20} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-gray-900">{device.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="font-medium">
                            {t(`profile.connections.deviceTypes.${device.type}`)}
                          </span>
                          <span>•</span>
                          <span>
                            {t('profile.connections.lastSync').replace('{time}', formatSyncTime(device.lastSync))}
                          </span>
                          {device.syncedRecords > 0 && (
                            <>
                              <span>•</span>
                              <span>{device.syncedRecords} {t('profile.connections.records').toLowerCase()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveDevice(device.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title={t('profile.connections.removeDevice')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <Smartphone size={32} className="mx-auto text-slate-300 mb-4" />
              <p className="text-sm font-semibold text-slate-600">
                {t('profile.connections.noDevices')}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {t('profile.connections.noDevicesDesc')}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Integration Status Card */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-8 border border-slate-200 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg shadow-lg shadow-blue-600/20 flex-shrink-0">
            <Activity size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-serif font-semibold text-gray-900 mb-2">
              {t('profile.connections.integrationTitle')}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {t('profile.connections.integrationDesc')}
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-all">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  {t('profile.connections.status')}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {hospitals.length > 0 || devices.length > 0 ? '✓ Active' : '—'}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-all">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  {t('profile.connections.lastSyncLabel')}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {devices.length > 0
                    ? formatSyncTime(
                        devices
                          .map(d => d.lastSync)
                          .filter(Boolean)
                          .sort()
                          .reverse()[0] || null
                      )
                    : '—'}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-all">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  {t('profile.connections.records')}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {devices.reduce((sum, d) => sum + (d.syncedRecords || 0), 0)} synced
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add Device Modal */}
      {showAddDevice && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-serif font-semibold text-gray-900">
                {t('profile.connections.addDeviceModal.title')}
              </h3>
              <button
                onClick={() => setShowAddDevice(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('profile.connections.addDeviceModal.name')}
                </label>
                <input
                  type="text"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder={t('profile.connections.addDeviceModal.namePlaceholder')}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('profile.connections.addDeviceModal.type')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {deviceTypes.map((dtype) => {
                    const DIcon = DEVICE_TYPE_ICONS[dtype];
                    return (
                      <button
                        key={dtype}
                        onClick={() => setNewDeviceType(dtype)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          newDeviceType === dtype
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-slate-200 text-gray-600 hover:border-slate-300'
                        }`}
                      >
                        <DIcon size={16} />
                        {t(`profile.connections.deviceTypes.${dtype}`)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={handleAddDevice}
                disabled={!newDeviceName.trim() || isAdding}
                className="w-full py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isAdding ? '...' : t('profile.connections.addDeviceModal.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionsTab;
