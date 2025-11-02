'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Shield, AlertTriangle, CheckCircle, XCircle, Scan, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import NavigationButtons from '@/components/NavigationButtons';

interface FraudAlert {
  id: string;
  expenseId: string | null;
  alertType: string;
  severity: string;
  description: string;
  riskScore: number;
  status: string;
  createdAt: string;
  expense?: {
    amount: number;
    merchant: string | null;
    category: string;
    date: string;
  };
}

interface ScanResult {
  totalAnalyzed: number;
  suspiciousCount: number;
  averageRiskScore: number;
  suspiciousExpenses: any[];
}

export default function FraudDetectionPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [statusFilter, setStatusFilter] = useState('PENDING');

  useEffect(() => {
    if (isSignedIn) {
      fetchAlerts();
    }
  }, [isSignedIn, statusFilter]);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`/api/fraud/alerts?status=${statusFilter}`);
      const alertsData = response.data?.data || response.data || [];
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error fetching fraud alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const runFraudScan = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const response = await axios.post('/api/fraud/scan', { days: 30 });
      const result = response.data?.data || response.data || {};
      setScanResult(result);
      await fetchAlerts(); // Refresh alerts after scan
    } catch (error) {
      console.error('Error running fraud scan:', error);
      alert('Failed to run fraud scan');
    } finally {
      setScanning(false);
    }
  };

  const resolveAlert = async (alertId: string, isConfirmed: boolean) => {
    try {
      await axios.post(`/api/fraud/alerts/${alertId}/resolve`, {
        resolution: isConfirmed ? 'Confirmed as fraudulent' : 'Marked as false positive',
        isConfirmed,
      });
      await fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
      alert('Failed to resolve alert');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'CONFIRMED': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'FALSE_POSITIVE': return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <NavigationButtons />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Fraud Detection</h1>
                <p className="text-gray-600">AI-powered transaction monitoring and fraud alerts</p>
              </div>
            </div>
            <button
              onClick={runFraudScan}
              disabled={scanning}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition flex items-center gap-2 disabled:opacity-50"
            >
              <Scan className={`w-5 h-5 ${scanning ? 'animate-spin' : ''}`} />
              {scanning ? 'Scanning...' : 'Run Fraud Scan'}
            </button>
          </div>
        </div>

        {/* Scan Results */}
        {scanResult && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-cyan-600" />
              Scan Results (Last 30 Days)
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Transactions Analyzed</p>
                <p className="text-3xl font-bold text-gray-900">{scanResult.totalAnalyzed}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Suspicious Found</p>
                <p className="text-3xl font-bold text-red-600">{scanResult.suspiciousCount}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Average Risk Score</p>
                <p className="text-3xl font-bold text-yellow-600">{scanResult.averageRiskScore.toFixed(1)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex gap-2">
            {['PENDING', 'CONFIRMED', 'FALSE_POSITIVE', 'ALL'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status === 'ALL' ? '' : status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  (statusFilter === status || (statusFilter === '' && status === 'ALL'))
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Shield className="w-24 h-24 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Alerts Found</h3>
            <p className="text-gray-600 mb-6">All your transactions look good! No suspicious activity detected.</p>
            <button
              onClick={runFraudScan}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition"
            >
              Run Fraud Scan
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border-2 ${
                  alert.severity === 'CRITICAL' ? 'border-red-300' : 
                  alert.severity === 'HIGH' ? 'border-orange-300' : 
                  alert.severity === 'MEDIUM' ? 'border-yellow-300' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(alert.status)}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{alert.alertType.replace(/_/g, ' ')}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            Risk Score: {alert.riskScore}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{alert.description}</p>

                    {alert.expense && (
                      <div className="p-4 bg-gray-50 rounded-lg mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Transaction Details</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">Amount</p>
                            <p className="font-bold text-gray-900">₹{alert.expense.amount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Merchant</p>
                            <p className="font-semibold text-gray-900">{alert.expense.merchant || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Category</p>
                            <p className="font-semibold text-gray-900">{alert.expense.category}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Date</p>
                            <p className="font-semibold text-gray-900">
                              {format(new Date(alert.expense.date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      Detected {format(new Date(alert.createdAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>

                  {alert.status === 'PENDING' && (
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => resolveAlert(alert.id, true)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                      >
                        Confirm Fraud
                      </button>
                      <button
                        onClick={() => resolveAlert(alert.id, false)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
                      >
                        Mark Safe
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
