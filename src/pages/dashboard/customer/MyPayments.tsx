import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { paymentApi } from '../../../api/services';

interface Payment {
  _id: string;
  project: {
    _id: string;
    projectName?: string;
    title?: string;
    category?: string;
  };
  amount: number;
  type: 'initial' | 'midpoint' | 'final' | 'downpayment' | 'progress';
  status: 'pending' | 'submitted' | 'verified' | 'rejected';
  qrCode?: {
    url?: string;
    uploadedAt?: string;
  };
  proofOfPayment?: {
    url?: string;
    uploadedAt?: string;
  };
  verifiedAt?: string;
  verifiedBy?: {
    firstName?: string;
    lastName?: string;
  };
  rejectionReason?: string;
  dueDate?: string;
  createdAt: string;
}

interface ProjectPaymentSchedule {
  projectId: string;
  projectName: string;
  totalAmount: number;
  payments: {
    downpayment: Payment | null;
    progress: Payment | null;
    final: Payment | null;
  };
}

const MyPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentApi.getMine();
      setPayments(response.data?.payments || []);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async (paymentId: string, file: File) => {
    setUploadingId(paymentId);
    try {
      const formData = new FormData();
      formData.append('proof', file);
      await paymentApi.uploadProof(paymentId, formData);
      setUploadSuccess(paymentId);
      setTimeout(() => setUploadSuccess(null), 3000);
      fetchPayments();
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Failed to upload proof:', error);
      alert('Failed to upload proof of payment. Please try again.');
    } finally {
      setUploadingId(null);
    }
  };

  const openPaymentModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const openQRModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowQRModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      submitted: 'bg-blue-50 text-blue-700 border-blue-200',
      verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'submitted':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'verified':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      initial: 'Initial Payment (30%)',
      downpayment: 'Initial Payment (30%)',
      midpoint: 'Midpoint Payment (40%)',
      progress: 'Midpoint Payment (40%)',
      final: 'Final Payment (30%)',
    };
    return labels[type] || type;
  };

  const getTypeShortLabel = (type: string) => {
    const labels: Record<string, string> = {
      initial: '30% Initial',
      downpayment: '30% Initial',
      midpoint: '40% Midpoint',
      progress: '40% Midpoint',
      final: '30% Final',
    };
    return labels[type] || type;
  };

  const getTypePercentage = (type: string) => {
    const percentages: Record<string, number> = {
      initial: 30,
      downpayment: 30,
      midpoint: 40,
      progress: 40,
      final: 30,
    };
    return percentages[type] || 0;
  };

  const getTypeOrder = (type: string) => {
    const order: Record<string, number> = {
      initial: 1,
      downpayment: 1,
      midpoint: 2,
      progress: 2,
      final: 3,
    };
    return order[type] || 0;
  };

  // Group payments by project
  const groupedPayments = payments.reduce((acc, payment) => {
    const projectId = payment.project?._id || 'unknown';
    if (!acc[projectId]) {
      acc[projectId] = {
        projectName: payment.project?.projectName || payment.project?.title || 'Project',
        category: payment.project?.category,
        payments: [],
      };
    }
    acc[projectId].payments.push(payment);
    return acc;
  }, {} as Record<string, { projectName: string; category?: string; payments: Payment[] }>);

  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'rejected');
  const submittedPayments = payments.filter(p => p.status === 'submitted');
  const completedPayments = payments.filter(p => p.status === 'verified');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading your payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">My Payments</h1>
        <p className="text-slate-500 mt-1 text-sm md:text-base">Manage payments and upload proof of payment</p>
      </div>

      {/* Payment Schedule Info - Mobile Optimized */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 md:p-6 text-white">
        <h3 className="font-semibold mb-4 text-sm md:text-base">Payment Schedule (30-40-30)</h3>
        <div className="flex items-center justify-between gap-2">
          {/* Step 1 */}
          <div className="flex-1 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="font-bold text-sm md:text-lg">30%</span>
            </div>
            <p className="text-xs md:text-sm text-slate-300">Initial</p>
            <p className="text-[10px] md:text-xs text-slate-400 mt-0.5 hidden sm:block">Start fabrication</p>
          </div>
          
          {/* Arrow */}
          <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          
          {/* Step 2 */}
          <div className="flex-1 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="font-bold text-sm md:text-lg">40%</span>
            </div>
            <p className="text-xs md:text-sm text-slate-300">Midpoint</p>
            <p className="text-[10px] md:text-xs text-slate-400 mt-0.5 hidden sm:block">Fabrication done</p>
          </div>
          
          {/* Arrow */}
          <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          
          {/* Step 3 */}
          <div className="flex-1 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="font-bold text-sm md:text-lg">30%</span>
            </div>
            <p className="text-xs md:text-sm text-slate-300">Final</p>
            <p className="text-[10px] md:text-xs text-slate-400 mt-0.5 hidden sm:block">Release product</p>
          </div>
        </div>
      </div>

      {/* Action Required - Pending Payments */}
      {pendingPayments.length > 0 && (
        <div>
          <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            Action Required
          </h2>
          <div className="space-y-3 md:space-y-4">
            {pendingPayments.map((payment) => (
              <div
                key={payment._id}
                className={`bg-white rounded-2xl border overflow-hidden ${
                  payment.status === 'rejected' 
                    ? 'border-red-200 ring-2 ring-red-100' 
                    : 'border-amber-200 ring-2 ring-amber-100'
                }`}
              >
                {/* Status Banner */}
                <div className={`px-4 py-2 flex items-center gap-2 ${
                  payment.status === 'rejected' ? 'bg-red-600' : 'bg-amber-500'
                } text-white`}>
                  {getStatusIcon(payment.status)}
                  <span className="text-sm font-medium">
                    {payment.status === 'rejected' ? 'Payment Rejected - Please Resubmit' : 'Payment Required'}
                  </span>
                </div>

                <div className="p-4 md:p-6">
                  {/* Project Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm md:text-base">
                        {payment.project?.projectName || payment.project?.title || 'Project Payment'}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-500 mt-0.5">{getTypeLabel(payment.type)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl md:text-2xl font-bold text-slate-900">
                        ₱{payment.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">{getTypePercentage(payment.type)}% of total</p>
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {payment.status === 'rejected' && payment.rejectionReason && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                      <p className="text-xs font-medium text-red-800 mb-1">Reason for rejection:</p>
                      <p className="text-sm text-red-700">{payment.rejectionReason}</p>
                    </div>
                  )}

                  {/* QR Code Section */}
                  {payment.qrCode?.url && (
                    <div className="mb-4">
                      <button
                        onClick={() => openQRModal(payment)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
                            <img 
                              src={payment.qrCode.url} 
                              alt="QR Code" 
                              className="w-10 h-10 object-contain"
                            />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-slate-900">Scan QR Code</p>
                            <p className="text-xs text-slate-500">GCash / Bank Transfer</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Payment Methods (if no QR code) */}
                  {!payment.qrCode?.url && (
                    <div className="mb-4 p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs font-medium text-slate-700 mb-3">Payment Methods</p>
                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <div className="bg-white rounded-lg p-2.5 md:p-3 border border-slate-200">
                          <p className="text-[10px] md:text-xs text-slate-500 mb-0.5">GCash</p>
                          <p className="font-medium text-slate-900 text-xs md:text-sm">0917-XXX-XXXX</p>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 md:p-3 border border-slate-200">
                          <p className="text-[10px] md:text-xs text-slate-500 mb-0.5">BDO</p>
                          <p className="font-medium text-slate-900 text-xs md:text-sm">XXXX-XXXX</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  <button
                    onClick={() => openPaymentModal(payment)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload Proof of Payment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submitted Payments - Awaiting Verification */}
      {submittedPayments.length > 0 && (
        <div>
          <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
            Awaiting Verification
          </h2>
          <div className="space-y-3">
            {submittedPayments.map((payment) => (
              <div
                key={payment._id}
                className="bg-white rounded-2xl border border-blue-100 p-4 md:p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm md:text-base">
                        {payment.project?.projectName || 'Project Payment'}
                      </p>
                      <p className="text-xs md:text-sm text-slate-500">{getTypeShortLabel(payment.type)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">₱{payment.amount.toLocaleString()}</p>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      Verifying...
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History by Project */}
      {payments.length > 0 && (
        <div>
          <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4">Payment History</h2>
          <div className="space-y-4">
            {Object.entries(groupedPayments).map(([projectId, group]) => (
              <div key={projectId} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                {/* Project Header */}
                <div className="px-4 md:px-6 py-3 md:py-4 bg-slate-50 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900 text-sm md:text-base">{group.projectName}</h3>
                  {group.category && (
                    <p className="text-xs text-slate-500 capitalize">{group.category.replace(/_/g, ' ')}</p>
                  )}
                </div>
                
                {/* Payment Progress */}
                <div className="p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3].map((step) => {
                      const stepPayment = group.payments.find(p => getTypeOrder(p.type) === step);
                      const isCompleted = stepPayment?.status === 'verified';
                      const isPending = stepPayment && stepPayment.status !== 'verified';
                      
                      return (
                        <React.Fragment key={step}>
                          <div className={`flex-1 h-2 rounded-full ${
                            isCompleted 
                              ? 'bg-emerald-500' 
                              : isPending 
                                ? 'bg-amber-300' 
                                : 'bg-slate-200'
                          }`} />
                          {step < 3 && <div className="w-1" />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                  
                  {/* Payment Items */}
                  <div className="space-y-2">
                    {group.payments
                      .sort((a, b) => getTypeOrder(a.type) - getTypeOrder(b.type))
                      .map((payment) => (
                        <div
                          key={payment._id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              payment.status === 'verified'
                                ? 'bg-emerald-100 text-emerald-600'
                                : payment.status === 'submitted'
                                  ? 'bg-blue-100 text-blue-600'
                                  : payment.status === 'rejected'
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-slate-200 text-slate-500'
                            }`}>
                              {getStatusIcon(payment.status)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{getTypeShortLabel(payment.type)}</p>
                              <p className="text-xs text-slate-500">
                                {payment.status === 'verified' && payment.verifiedAt
                                  ? `Verified ${formatDate(payment.verifiedAt)}`
                                  : payment.status.charAt(0).toUpperCase() + payment.status.slice(1)
                                }
                              </p>
                            </div>
                          </div>
                          <p className={`font-semibold ${
                            payment.status === 'verified' ? 'text-emerald-600' : 'text-slate-900'
                          }`}>
                            ₱{payment.amount.toLocaleString()}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {payments.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 md:p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No payments yet</h3>
          <p className="text-slate-500 mb-6 text-sm md:text-base">
            Payments will appear once your project design is approved.
          </p>
          <Link
            to="/dashboard/customer/projects"
            className="inline-flex items-center text-slate-900 font-medium hover:underline text-sm md:text-base"
          >
            View your projects →
          </Link>
        </div>
      )}

      {/* Summary Stats - Mobile Optimized */}
      {payments.length > 0 && (
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 p-3 md:p-6">
            <p className="text-[10px] md:text-sm text-slate-500 mb-0.5 md:mb-1">Pending</p>
            <p className="text-base md:text-2xl font-bold text-amber-600">
              ₱{(pendingPayments.reduce((sum, p) => sum + p.amount, 0) + 
                 submittedPayments.reduce((sum, p) => sum + p.amount, 0)).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 p-3 md:p-6">
            <p className="text-[10px] md:text-sm text-slate-500 mb-0.5 md:mb-1">Paid</p>
            <p className="text-base md:text-2xl font-bold text-emerald-600">
              ₱{completedPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 p-3 md:p-6">
            <p className="text-[10px] md:text-sm text-slate-500 mb-0.5 md:mb-1">Progress</p>
            <p className="text-base md:text-2xl font-bold text-slate-900">
              {completedPayments.length}/{payments.length}
            </p>
          </div>
        </div>
      )}

      {/* Payment Upload Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPaymentModal(false)} />
          <div className="relative bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Upload Payment Proof</h2>
                <p className="text-sm text-slate-500">{getTypeLabel(selectedPayment.type)}</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 md:p-6">
              {/* Amount */}
              <div className="text-center mb-6 py-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Amount to pay</p>
                <p className="text-3xl font-bold text-slate-900">₱{selectedPayment.amount.toLocaleString()}</p>
              </div>

              {/* QR Code if available */}
              {selectedPayment.qrCode?.url && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-slate-700 mb-3 text-center">Scan to Pay</p>
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
                      <img 
                        src={selectedPayment.qrCode.url} 
                        alt="Payment QR Code" 
                        className="w-48 h-48 object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Area */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">Upload Receipt/Screenshot</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadProof(selectedPayment._id, file);
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingId === selectedPayment._id}
                  className="w-full flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  {uploadingId === selectedPayment._id ? (
                    <>
                      <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                      <span className="text-sm font-medium text-slate-700">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-700">Tap to select image</p>
                        <p className="text-xs text-slate-500">JPG, PNG up to 5MB</p>
                      </div>
                    </>
                  )}
                </button>
              </div>

              {/* Tips */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-800">
                  <strong>Tips:</strong> Make sure the receipt shows the amount, date, and reference number clearly.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedPayment?.qrCode?.url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowQRModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Scan to Pay</h3>
              <p className="text-sm text-slate-500 mb-4">₱{selectedPayment.amount.toLocaleString()}</p>
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-white rounded-xl border-2 border-slate-200">
                  <img 
                    src={selectedPayment.qrCode.url} 
                    alt="Payment QR Code" 
                    className="w-56 h-56 object-contain"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500">
                After payment, upload your receipt/screenshot as proof
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {uploadSuccess && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">Proof uploaded successfully!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPayments;
