import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Image as ImageIcon, QrCode, Wallet, Landmark, Download } from 'lucide-react';
import { paymentApi } from '../../../api/services';
import { useNotification } from '../../../contexts/NotificationContext';

interface Payment {
  _id: string;
  project: {
    _id: string;
    projectName?: string;
    title?: string;
    category?: string;
  };
  amount: {
    expected: number;
    received?: number;
  };
  stage?: 'design_fee' | 'ocular_fee' | 'initial' | 'midpoint' | 'final' | 'full' | 'downpayment' | 'progress';
  type?: 'design_fee' | 'ocular_fee' | 'initial' | 'midpoint' | 'final' | 'full' | 'downpayment' | 'progress';
  status: 'pending' | 'submitted' | 'verified' | 'rejected';
  qrCode?: {
    url?: string;
    path?: string;
    uploadedAt?: string;
  };
  qrCodes?: {
    gcash?: {
      url?: string;
      path?: string;
    };
    bank?: {
      url?: string;
      path?: string;
    };
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
  rejection?: {
    reason?: string;
  };
  dueDate?: string;
  createdAt: string;
}

const MyPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'bank'>('gcash');
  const [uploading, setUploading] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { notify } = useNotification();

  const GCASH_QR = '/Gcash_QR.png';
  const BANK_QR = '/Bank_QR.png';

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentApi.getMine();
      setPayments(response.data?.payments || []);
    } catch (error) {
      console.error('Failed to load payments:', error);
      notify({ type: 'error', title: 'Error', message: 'Could not load payments' });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async (file: File) => {
    if (!selectedPayment) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('proof', file);
      // Include paymentMethod - use 'bank_transfer' instead of 'bank' to match backend enum
      formData.append('paymentMethod', paymentMethod === 'bank' ? 'bank_transfer' : paymentMethod);
      await paymentApi.uploadProof(selectedPayment._id, formData);
      notify({ type: 'success', title: 'Success', message: 'Proof uploaded! We will verify it shortly.' });
      fetchPayments();
      setShowUploadModal(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Upload failed:', error);
      notify({ type: 'error', title: 'Error', message: 'Failed to upload proof. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const getPaymentStage = (type: string): { label: string; percentage: number; order: number; isFee: boolean } => {
    const stages: Record<string, { label: string; percentage: number; order: number; isFee: boolean }> = {
      design_fee: { label: 'Design Fee', percentage: 0, order: 0, isFee: true },
      ocular_fee: { label: 'Ocular Visit Fee', percentage: 0, order: 0.1, isFee: true },
      initial: { label: 'Initial Payment', percentage: 30, order: 1, isFee: false },
      downpayment: { label: 'Initial Payment', percentage: 30, order: 1, isFee: false },
      midpoint: { label: 'Midpoint Payment', percentage: 40, order: 2, isFee: false },
      progress: { label: 'Midpoint Payment', percentage: 40, order: 2, isFee: false },
      final: { label: 'Final Payment', percentage: 30, order: 3, isFee: false },
      full: { label: 'Full Payment', percentage: 100, order: 1, isFee: false },
    };
    return stages[type] || { label: type, percentage: 0, order: 0, isFee: false };
  };

  const resolvePaymentStage = (payment: Payment) => payment.stage || payment.type || 'unknown';

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'verified':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending': 
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pending Payment',
      submitted: 'Pending Cashier Approval',
      verified: 'Verified',
      rejected: 'Invalid - Resubmit',
    };
    return labels[status] || status;
  };


  // Group by project
  const projectGroups = payments.reduce((acc, payment) => {
    const projectId = payment.project?._id || 'unknown';
    const projectName = payment.project?.projectName || payment.project?.title || 'Project';
    
    if (!acc[projectId]) {
      acc[projectId] = {
        name: projectName,
        category: payment.project?.category,
        payments: [],
      };
    }
    acc[projectId].payments.push(payment);
    return acc;
  }, {} as Record<string, { name: string; category?: string; payments: Payment[] }>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payments</h1>
        <p className="text-slate-500 mt-1 text-sm">Track and manage your project transactions</p>
      </div>

      {/* Empty State */}
      {payments.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-slate-900 mb-1">No payments yet</h3>
          <p className="text-sm text-slate-500 mb-4">
            Payments will appear here when you have an active project.
          </p>
          <Link
            to="/dashboard/customer/projects"
            className="inline-flex items-center text-slate-900 font-semibold text-sm hover:underline"
          >
            Go to Projects →
          </Link>
        </div>
      )}

      {/* Project Group */}
      {Object.entries(projectGroups).map(([projectId, group]) => {
        const sortedPayments = group.payments.sort((a, b) => 
          getPaymentStage(resolvePaymentStage(a)).order - getPaymentStage(resolvePaymentStage(b)).order
        );
        const nonFeePayments = group.payments.filter(
          (p) => !getPaymentStage(resolvePaymentStage(p)).isFee
        );
        const totalPaid = nonFeePayments
          .filter(p => p.status === 'verified')
          .reduce((sum, p) => sum + p.amount.expected, 0);
        const totalAmount = nonFeePayments.reduce((sum, p) => sum + p.amount.expected, 0);
        const progressPercentage = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

        return (
          <div key={projectId} className="space-y-4">
             {/* Project Header Block */}
             <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex-1">
                   <h2 className="text-lg font-bold text-slate-900">{group.name}</h2>
                   <p className="text-xs text-slate-500 capitalize">{group.category?.replace(/_/g, ' ') || 'Project Payment'}</p>
                   
                   {/* Mini Progress */}
                   <div className="mt-3 flex items-center gap-3">
                      <div className="h-1.5 w-full max-w-[200px] bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-slate-900 rounded-full transition-all" style={{ width: `${progressPercentage}%` }} />
                      </div>
                      <span className="text-xs font-medium text-slate-700">{Math.round(progressPercentage)}% Paid</span>
                   </div>
                </div>
                <div className="text-left sm:text-right">
                   <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Balance</p>
                   <p className="text-xl font-bold text-slate-900">₱{(totalAmount - totalPaid).toLocaleString()}</p>
                </div>
             </div>

             {/* Payments List */}
             <div className="grid gap-3">
                {sortedPayments.map((payment) => {
                   const stage = getPaymentStage(resolvePaymentStage(payment));
                   const isActionNeeded = payment.status === 'pending' || payment.status === 'rejected';

                   return (
                      <div 
                        key={payment._id}
                        className={`group bg-white rounded-xl border p-5 transition-all hover:shadow-sm flex flex-col md:flex-row md:items-center gap-5 ${
                           isActionNeeded ? 'border-l-4 border-l-slate-900 border-y-slate-200 border-r-slate-200' : 'border-slate-200'
                        }`}
                      >
                         {/* Circle Percentage */}
                         <div className="hidden md:flex flex-shrink-0 w-12 h-12 rounded-full border-2 border-slate-100 items-center justify-center">
                            {stage.isFee ? (
                              <span className="text-[10px] font-bold text-slate-600">Fee</span>
                            ) : (
                              <span className="text-xs font-bold text-slate-700">{stage.percentage}%</span>
                            )}
                         </div>

                         {/* Info */}
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                               <h3 className="font-semibold text-slate-900">{stage.label}</h3>
                               <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusStyle(payment.status)}`}>
                                 {getStatusLabel(payment.status)}
                               </span>
                            </div>
                            <p className="text-sm text-slate-500">
                              {stage.isFee ? 'Service Fee' : `Step ${stage.order} of 3`}
                            </p>
                            
                             {payment.status === 'rejected' && (payment.rejectionReason || payment.rejection?.reason) && (
                               <p className="mt-2 text-xs text-red-600 font-medium">
                                 Action Required: {payment.rejectionReason || payment.rejection?.reason}
                               </p>
                            )}
                         </div>

                         {/* Amount & Actions */}
                         <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-50">
                            <div className="text-left md:text-right">
                               <p className="font-bold text-slate-900">₱{payment.amount.expected.toLocaleString()}</p>
                               <p className="text-xs text-slate-400">Amount Due</p>
                            </div>
                            
                            {isActionNeeded && (
                               <button
                                 onClick={() => {
                                    setSelectedPayment(payment);
                                    setReceiptFile(null);
                                    setShowQRModal(true);
                                 }}
                                 className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
                               >
                                 Pay Now
                               </button>
                            )}

                            {payment.status === 'verified' && (
                               <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                               </div>
                            )}
                         </div>
                      </div>
                   );
                })}
             </div>
          </div>
        );
      })}

      {/* Upload Proof Modal */}
      {showUploadModal && selectedPayment && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowUploadModal(false)} />
           <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Upload Receipt</h3>
                  <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
               </div>
               
               <div className="p-6 space-y-4">
                  <div className="text-center p-5 bg-slate-50 rounded-xl border border-slate-100">
                     <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Amount Due</p>
                     <p className="text-3xl font-bold text-slate-900 mt-1">₱{selectedPayment.amount.expected.toLocaleString()}</p>
                  </div>

                  <input
                     ref={fileInputRef}
                     type="file"
                     accept="image/*"
                     className="hidden"
                     onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadProof(file);
                     }}
                  />

                  <button 
                     onClick={() => fileInputRef.current?.click()}
                     disabled={uploading}
                     className="w-full h-32 border-2 border-dashed border-slate-200 rounded-xl hover:border-slate-900 hover:bg-slate-50 transition-all flex flex-col items-center justify-center group"
                  >
                     {uploading ? (
                        <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                     ) : (
                        <>
                           <svg className="w-6 h-6 text-slate-300 group-hover:text-slate-900 mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                           <span className="text-sm font-medium text-slate-500 group-hover:text-slate-900">Click to upload receipt</span>
                        </>
                     )}
                  </button>
               </div>
           </div>
        </div>,
        document.body
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedPayment && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowQRModal(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-slate-900 text-lg leading-tight">Complete Your Payment</h3>
                <p className="text-slate-500 text-sm">Follow the steps below to settle your balance</p>
              </div>
              <button 
                onClick={() => setShowQRModal(false)} 
                className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-8">
              {/* Step 1: Select Method */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">1</div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">Select Payment Method</h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('gcash')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 group ${
                      paymentMethod === 'gcash' 
                        ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-100' 
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${paymentMethod === 'gcash' ? 'bg-blue-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'}`}>
                      <Wallet size={24} />
                    </div>
                    <span className={`text-sm font-bold ${paymentMethod === 'gcash' ? 'text-blue-700' : 'text-slate-500'}`}>GCash</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('bank')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 group ${
                      paymentMethod === 'bank' 
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-100' 
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${paymentMethod === 'bank' ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'}`}>
                      <Landmark size={24} />
                    </div>
                    <span className={`text-sm font-bold ${paymentMethod === 'bank' ? 'text-emerald-700' : 'text-slate-500'}`}>Bank Transfer</span>
                  </button>
                </div>
              </section>

              {/* Step 2: Pay & Scan */}
              <section className="space-y-4">
                 <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">2</div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">Scan & Pay Exact Amount</h4>
                </div>

                <div className="bg-slate-900 rounded-2xl p-6 text-center space-y-4 shadow-xl">
                  <div className="inline-block p-4 bg-white rounded-2xl relative group">
                    <img 
                      src={paymentMethod === 'gcash' ? GCASH_QR : BANK_QR} 
                      alt="QR Code" 
                      className="w-48 h-48 object-contain"
                    />
                    <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl cursor-pointer">
                       <a href={paymentMethod === 'gcash' ? GCASH_QR : BANK_QR} download className="flex flex-col items-center gap-2 text-slate-900 font-bold text-xs">
                          <Download size={24} />
                          Save QR
                       </a>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em]">Amount Due</p>
                    <p className="text-3xl font-black text-white leading-none">₱{selectedPayment.amount.expected.toLocaleString()}</p>
                  </div>

                  <p className="text-slate-400 text-xs italic">Scan code above using your {paymentMethod === 'gcash' ? 'GCash app' : 'Bank app'}</p>
                </div>
              </section>

              {/* Step 3: Proof */}
              <section className="space-y-4 pb-4">
                 <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">3</div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">Submit Proof of Payment</h4>
                </div>
                
                <div 
                  className={`relative border-2 border-dashed rounded-2xl p-6 transition-all group ${
                    receiptFile 
                      ? 'border-emerald-200 bg-emerald-50/30' 
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 ${
                      receiptFile ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border border-slate-100'
                    }`}>
                      {receiptFile ? (
                        receiptFile.type === 'application/pdf' ? <FileText size={24} /> : <ImageIcon size={24} />
                      ) : (
                        <Upload size={24} />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {receiptFile ? (
                        <>
                          <p className="text-sm font-bold text-slate-900 truncate">{receiptFile.name}</p>
                          <p className="text-xs text-emerald-600 font-semibold">{(receiptFile.size / 1024 / 1024).toFixed(2)}MB • Ready for verification</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-slate-700">Upload Transaction Receipt</p>
                          <p className="text-xs text-slate-400">JPG, PNG or PDF (Max 10MB)</p>
                        </>
                      )}
                    </div>

                    {receiptFile && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setReceiptFile(null);
                        }}
                        className="relative z-20 p-2 hover:bg-white rounded-lg text-slate-400 hover:text-red-500 transition-all shadow-sm"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {!receiptFile && (
                  <div className="flex items-center gap-2 px-1 text-amber-600 animate-pulse">
                    <AlertCircle size={14} />
                    <p className="text-xs font-bold uppercase tracking-wide">Receipt required</p>
                  </div>
                )}
              </section>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-white rounded-b-2xl shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    if (receiptFile) handleUploadProof(receiptFile);
                  }}
                  disabled={!receiptFile || uploading}
                  className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-xl shadow-slate-200 flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  {uploading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      <span className="text-lg">Confirm Payment</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-slate-400 font-medium px-4">
                  By clicking confirm, you agree that your payment proof will be subject to manual verification by our cashier.
                </p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MyPayments;
