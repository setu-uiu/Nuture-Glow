// System Admin Features Service with Real-time Updates
import { API_BASE } from '../constants';

const TOKEN_KEY = 'ng_auth_token';

const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const systemAdminFeatures = {
  // ============================================================================
  // SYSTEM MESSAGES - Real-time Notifications to All Users
  // ============================================================================
  
  messages: {
    /**
     * Send a system-wide message to users
     * Updates in real-time via WebSocket to all connected dashboards
     */
    send: async (data: {
      title: string;
      content: string;
      severity: 'info' | 'warning' | 'error';
      broadcast_to: 'all_users' | 'specific_role' | 'specific_user';
      target_role?: string;
      target_user_id?: string;
    }) => {
      const response = await fetch(`${API_BASE}/api/admin/system/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to send system message');
      return response.json();
    },

    /**
     * Get all system messages
     */
    getAll: async (limit = 50) => {
      const response = await fetch(`${API_BASE}/api/admin/system/messages?limit=${limit}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },

    /**
     * Delete a system message
     */
    delete: async (messageId: string) => {
      const response = await fetch(`${API_BASE}/api/admin/system/messages/${messageId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete message');
      return response.json();
    }
  },

  // ============================================================================
  // SYSTEM SETTINGS - Platform Configuration
  // ============================================================================

  settings: {
    /**
     * Get all system settings
     */
    getAll: async () => {
      const response = await fetch(`${API_BASE}/api/admin/system/settings`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },

    /**
     * Update system settings
     * Changes broadcast to all users via WebSocket
     */
    update: async (settings: Array<{ key: string; value: string }>) => {
      const response = await fetch(`${API_BASE}/api/admin/system/settings`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ settings })
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },

    /**
     * Get a specific setting
     */
    get: async (key: string) => {
      const response = await fetch(`${API_BASE}/api/admin/system/settings/${key}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch setting');
      return response.json();
    }
  },

  // ============================================================================
  // SYSTEM MONITORING - Real-time Platform Metrics
  // ============================================================================

  monitoring: {
    /**
     * Get system health status
     */
    getHealthStatus: async () => {
      const response = await fetch(`${API_BASE}/api/admin/system/health`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch health status');
      return response.json();
    },

    /**
     * Get system performance metrics
     */
    getMetrics: async (timeRange = '24h') => {
      const response = await fetch(`${API_BASE}/api/admin/system/metrics?timeRange=${timeRange}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },

    /**
     * Get active connections
     */
    getConnections: async () => {
      const response = await fetch(`${API_BASE}/api/admin/system/connections`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch connections');
      return response.json();
    },

    /**
     * Force system maintenance mode
     */
    setMaintenanceMode: async (enabled: boolean, message?: string) => {
      const response = await fetch(`${API_BASE}/api/admin/system/maintenance`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ enabled, message })
      });
      if (!response.ok) throw new Error('Failed to update maintenance mode');
      return response.json();
    }
  },

  // ============================================================================
  // USER MANAGEMENT - Advanced User Controls
  // ============================================================================

  users: {
    /**
     * Suspend a user account (real-time effect)
     */
    suspend: async (userId: string, reason: string, duration?: number) => {
      const response = await fetch(`${API_BASE}/api/admin/system/users/${userId}/suspend`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason, duration })
      });
      if (!response.ok) throw new Error('Failed to suspend user');
      return response.json();
    },

    /**
     * Reactivate a suspended user
     */
    reactivate: async (userId: string) => {
      const response = await fetch(`${API_BASE}/api/admin/system/users/${userId}/reactivate`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to reactivate user');
      return response.json();
    },

    /**
     * Force password reset for a user
     */
    forcePasswordReset: async (userId: string) => {
      const response = await fetch(`${API_BASE}/api/admin/system/users/${userId}/force-password-reset`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to force password reset');
      return response.json();
    },

    /**
     * Change user role
     */
    changeRole: async (userId: string, newRole: string) => {
      const response = await fetch(`${API_BASE}/api/admin/system/users/${userId}/role`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: newRole })
      });
      if (!response.ok) throw new Error('Failed to change user role');
      return response.json();
    },

    /**
     * Get user activity logs
     */
    getActivityLog: async (userId: string, limit = 100) => {
      const response = await fetch(`${API_BASE}/api/admin/system/users/${userId}/activity?limit=${limit}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch activity log');
      return response.json();
    },

    /**
     * Kick user offline (terminate session)
     */
    kickOffline: async (userId: string) => {
      const response = await fetch(`${API_BASE}/api/admin/system/users/${userId}/kick-offline`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to kick user offline');
      return response.json();
    }
  },

  // ============================================================================
  // SECURITY MANAGEMENT
  // ============================================================================

  security: {
    /**
     * Get security events/incidents
     */
    getEvents: async (filter?: { severity?: string; resolved?: boolean }) => {
      const params = new URLSearchParams();
      if (filter?.severity) params.append('severity', filter.severity);
      if (filter?.resolved !== undefined) params.append('resolved', filter.resolved.toString());

      const response = await fetch(`${API_BASE}/api/admin/system/security-events?${params}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch security events');
      return response.json();
    },

    /**
     * Resolve a security incident
     */
    resolveEvent: async (eventId: string, resolution: string) => {
      const response = await fetch(`${API_BASE}/api/admin/system/security-events/${eventId}/resolve`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ resolution })
      });
      if (!response.ok) throw new Error('Failed to resolve security event');
      return response.json();
    },

    /**
     * Get IP blacklist
     */
    getIPBlacklist: async () => {
      const response = await fetch(`${API_BASE}/api/admin/system/security/ip-blacklist`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch IP blacklist');
      return response.json();
    },

    /**
     * Add IP to blacklist
     */
    blockIP: async (ipAddress: string, reason: string) => {
      const response = await fetch(`${API_BASE}/api/admin/system/security/ip-blacklist`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ipAddress, reason })
      });
      if (!response.ok) throw new Error('Failed to block IP');
      return response.json();
    },

    /**
     * Remove IP from blacklist
     */
    unblockIP: async (ipAddress: string) => {
      const response = await fetch(`${API_BASE}/api/admin/system/security/ip-blacklist/${ipAddress}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to unblock IP');
      return response.json();
    }
  },

  // ============================================================================
  // BACKUP & RECOVERY
  // ============================================================================

  backup: {
    /**
     * Create database backup
     */
    create: async (backupName?: string) => {
      const response = await fetch(`${API_BASE}/api/admin/system/backups`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ backupName })
      });
      if (!response.ok) throw new Error('Failed to create backup');
      return response.json();
    },

    /**
     * Get list of backups
     */
    list: async () => {
      const response = await fetch(`${API_BASE}/api/admin/system/backups`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch backups');
      return response.json();
    },

    /**
     * Restore from backup
     */
    restore: async (backupId: string) => {
      const response = await fetch(`${API_BASE}/api/admin/system/backups/${backupId}/restore`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to restore backup');
      return response.json();
    },

    /**
     * Delete backup
     */
    delete: async (backupId: string) => {
      const response = await fetch(`${API_BASE}/api/admin/system/backups/${backupId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete backup');
      return response.json();
    },

    /**
     * Download backup file
     */
    download: async (backupId: string) => {
      const response = await fetch(`${API_BASE}/api/admin/system/backups/${backupId}/download`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to download backup');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${backupId}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    }
  },

  // ============================================================================
  // AUDIT LOGGING
  // ============================================================================

  audit: {
    /**
     * Get admin action logs
     */
    getAdminActions: async (filter?: { adminId?: string; actionType?: string; limit?: number }) => {
      const params = new URLSearchParams();
      if (filter?.adminId) params.append('adminId', filter.adminId);
      if (filter?.actionType) params.append('actionType', filter.actionType);
      if (filter?.limit) params.append('limit', filter.limit.toString());

      const response = await fetch(`${API_BASE}/api/admin/system/audit/admin-actions?${params}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch admin actions');
      return response.json();
    },

    /**
     * Get user action logs
     */
    getUserActions: async (userId: string, limit = 100) => {
      const response = await fetch(`${API_BASE}/api/admin/system/audit/user-actions/${userId}?limit=${limit}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch user actions');
      return response.json();
    },

    /**
     * Export audit logs
     */
    export: async (filter?: { startDate?: string; endDate?: string; format?: 'csv' | 'json' }) => {
      const params = new URLSearchParams();
      if (filter?.startDate) params.append('startDate', filter.startDate);
      if (filter?.endDate) params.append('endDate', filter.endDate);
      if (filter?.format) params.append('format', filter.format);

      const response = await fetch(`${API_BASE}/api/admin/system/audit/export?${params}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to export audit logs');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString()}.${filter?.format || 'json'}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
};
