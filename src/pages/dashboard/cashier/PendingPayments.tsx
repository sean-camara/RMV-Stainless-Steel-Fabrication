import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Clock,
  DollarSign,
  FileText,
  ExternalLink,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import { paymentApi } from '../../../api/services';
import { useNotification } from '../../../contexts/NotificationContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  StatusBadge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  Modal,
  Textarea,
  PageLoader,
  Input,
  Badge
} from '../../../components/ui';
import { Payment } from '../../../types';
import toast from 'react-hot-toast';

const PendingPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { notify } = useNotification();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentApi.getPending();
      // Handle various response structures
      const list = response?.data?.data?.payments || response?.data?.payments || response?.payments || [];
      // Ensure we only show submitted payments (though API should filter this)
      setPayments(list.filter((p: Payment) => p.status === 'submitted'));
    } catch (error) {
      toast.error('Failed to load pending payments');
      notify({ type: 'error', title: 'Error', message: 'Could not load pending payments' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!selectedPayment) return;

    setProcessing(true);
    try {
      await paymentApi.verify(selectedPayment._id, {
        amountReceived: selectedPayment.amount?.expected || 0,
        notes: verificationNotes,
      });
      toast.success('Payment verified successfully');
      notify({ 
        type: 'success', 
        title: 'Payment Verified', 
        message: `${selectedPayment.customerId?.firstName || 'Customer'} • ${getPaymentStageLabel(selectedPayment.stage)}` 
      });
      setShowDetails(false);
      setVerificationNotes('');
      fetchPayments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to verify payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment) return;

    if (!verificationNotes.trim()) {
      toast.error('Please provide a reason for rejection in the notes');
      return;
    }

    setProcessing(true);
    try {
      await paymentApi.reject(selectedPayment._id, verificationNotes);
      toast.success('Payment rejected');
      notify({ 
        type: 'warning', 
        title: 'Payment Rejected', 
        message: `${selectedPayment.customerId?.firstName || 'Customer'} • ${getPaymentStageLabel(selectedPayment.stage)}` 
      });
      setShowDetails(false);
      setVerificationNotes('');
      fetchPayments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject payment');
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentStageLabel = (stage: string): string => {
    const labels: Record<string, string> = {
      design_fee: 'Design Fee',
      ocular_fee: 'Ocular Visit Fee',
      initial: '30% Initial',
      midpoint: '40% Midpoint',
      downpayment: '30% Downpayment',
      progress: '40% Progress',
      final: '30% Final',
    };
    return labels[stage] || stage;
  };

  const filteredPayments = payments.filter((payment) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      payment.projectId?.projectName?.toLowerCase().includes(search) ||
      payment.customerId?.firstName?.toLowerCase().includes(search) ||
      payment.customerId?.lastName?.toLowerCase().includes(search) ||
      payment.referenceNumber?.toLowerCase().includes(search)
    );
  });

  const totalAmount = payments.reduce((sum, p) => sum + (p.amount?.expected || 0), 0);

  if (loading) {
    return <PageLoader text="Loading pending proofs..." />;
  }

  return (
    <div className="space-y-8 relative pb-20">
       {/* Decorative Orbs */}
       <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl opacity-60 pointer-events-none" />
       
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hero-fade-up">
         <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              Pending Payments
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-light">
              Review and verify customer submitted payment proofs
            </p>
         </div>
         <Button 
            variant="outline" 
            onClick={fetchPayments} 
            icon={<RefreshCw className="w-4 h-4" />}
            className="bg-white hover:bg-slate-50 border-slate-200 text-xs uppercase tracking-wider font-semibold"
          >
           Refresh List
         </Button>
      </div>

      {/* Stats Summary - CLEAN MINIMAL DESIGN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 hero-fade-up">
        {/* Card 1: Needs Review */}
        <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
           <div className="flex items-center justify-between">
              <div>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Queue Status</p>
                 <div className="flex items-baseline gap-2">
                   <h3 className="text-3xl font-black text-slate-900">{payments.length}</h3>
                   <span className="text-sm font-medium text-amber-600">waiting</span>
                 </div>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                 <Clock className="w-6 h-6 text-amber-600" />
              </div>
           </div>
        </div>

        {/* Card 2: Total Value */}
        <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
           <div className="flex items-center justify-between">
              <div>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Value</p>
                 <div className="flex items-baseline gap-2">
                   <h3 className="text-3xl font-black text-slate-900">₱{totalAmount.toLocaleString()}</h3>
                   <span className="text-sm font-medium text-slate-400">pending</span>
                 </div>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                 <DollarSign className="w-6 h-6 text-slate-600" />
              </div>
           </div>
        </div>
      </div>

       {/* Search & Table */}
       <Card className="bg-white border-slate-100 shadow-sm hero-fade-up rounded-2xl overflow-hidden" style={{ animationDelay: '0.1s' }}>
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                  <Filter className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                   <h3 className="font-bold text-slate-900 text-sm">Submission Queue</h3>
                </div>
             </div>
             
             <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter queue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-transparent focus:bg-white focus:border-slate-200 rounded-xl text-sm transition-all outline-none"
                />
             </div>
          </div>

          <div className="overflow-x-auto">
            <Table variant="light">
              <TableHeader>
                <TableRow className="bg-slate-50/50 border-b border-slate-100">
                  <TableHead className="pl-6 font-semibold text-slate-400 text-[10px] uppercase tracking-wider">Date Logged</TableHead>
                  <TableHead className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">Customer</TableHead>
                  <TableHead className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">Project</TableHead>
                  <TableHead className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">Amount</TableHead>
                  <TableHead className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">Ref No.</TableHead>
                  <TableHead className="text-right pr-6 font-semibold text-slate-400 text-[10px] uppercase tracking-wider">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={6} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                           <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                              <CheckCircle className="w-8 h-8 text-slate-300" />
                           </div>
                           <p className="font-medium text-slate-900">All caught up!</p>
                           <p className="text-sm mt-1 text-slate-500 font-light">No pending payments found in queue</p>
                        </div>
                     </TableCell>
                   </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => {
                      setSelectedPayment(payment);
                      setShowDetails(true);
                    }}>
                      <TableCell className="pl-6 font-medium text-slate-600 text-xs">
                         {format(new Date(payment.createdAt), 'MMM d, h:mm a')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px] border border-slate-200">
                              {payment.customerId?.firstName?.[0]}{payment.customerId?.lastName?.[0]}
                           </div>
                           <div>
                              <p className="font-semibold text-slate-900 text-sm">
                                {payment.customerId?.firstName} {payment.customerId?.lastName}
                              </p>
                              <p className="text-[10px] text-slate-400">Customer</p>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-slate-900 font-medium text-sm">{payment.projectId?.projectName}</p>
                        <div className="mt-1 inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                           {getPaymentStageLabel(payment.stage)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-slate-900 text-sm">
                          ₱{payment.amount?.expected?.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-slate-400">
                          {payment.referenceNumber || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="inline-flex w-8 h-8 items-center justify-center rounded-lg bg-white border border-slate-100 text-slate-300 shadow-sm group-hover:border-slate-300 group-hover:text-slate-600 transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
       </Card>

      {/* Verification Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedPayment(null);
          setVerificationNotes('');
        }}
        title="Payment Verification"
        size="lg"
      >
        {selectedPayment && (
          <div className="space-y-6">
            {/* Split View: Proof vs Details */}
             <div className="grid md:grid-cols-2 gap-6">
                {/* Proof Section */}
                <div className="space-y-2">
                   <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" /> Payment Proof
                      </h4>
                      {selectedPayment.proofUrl && (
                        <a href={selectedPayment.proofUrl} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1">
                          Open Original <ExternalLink className="w-3 h-3"/>
                        </a>
                     )}
                   </div>
                   
                   <div className="bg-slate-900/50 rounded-xl p-2 flex items-center justify-center min-h-[350px] border border-slate-700 shadow-inner relative overflow-hidden group">
                      {selectedPayment.paymentProof ? (
                         <>
                            <img 
                              src={selectedPayment.proofUrl || `/uploads/${selectedPayment.paymentProof?.filename}`} 
                              alt="Proof" 
                              className="max-h-[400px] w-auto object-contain rounded shadow-lg transition-transform duration-500 group-hover:scale-[1.02]"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Preview';
                              }}
                            />
                         </>
                      ) : (
                         <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                            <AlertCircle className="w-8 h-8 opacity-50" />
                            <span className="text-sm">No proof file available</span>
                         </div>
                      )}
                   </div>
                   <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-700/50 mt-2">
                      <p className="text-xs text-slate-400 font-mono break-all">
                         Ref: {selectedPayment.referenceNumber || 'N/A'}
                      </p>
                   </div>
                </div>

                {/* Details Section */}
                <div className="flex flex-col h-full">
                   <div className="flex-1 space-y-4">
                      <div className="bg-slate-700/30 p-5 rounded-xl border border-slate-700/50 shadow-sm relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10">
                            <DollarSign className="w-24 h-24 text-emerald-400" />
                         </div>
                         <div className="relative z-10">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Amount</p>
                            <p className="text-3xl font-extrabold text-white tracking-tight">₱{selectedPayment.amount?.expected?.toLocaleString()}</p>
                            <div className="mt-4 flex items-center gap-2">
                               <Badge variant="warning">Pending Review</Badge>
                               <span className="text-xs text-slate-400">• Submitted {format(new Date(selectedPayment.createdAt), 'MMM d, h:mm a')}</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50 space-y-4">
                         <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer</span>
                            <span className="text-white font-medium text-sm flex items-center gap-2">
                               <div className="w-5 h-5 rounded-full bg-cyan-900/50 flex items-center justify-center text-[10px] text-cyan-400 border border-cyan-800">
                                  {selectedPayment.customerId?.firstName?.[0]}
                               </div>
                               {selectedPayment.customerId?.firstName} {selectedPayment.customerId?.lastName}
                            </span>
                         </div>
                         <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project</span>
                            <span className="text-white font-medium text-sm">{selectedPayment.projectId?.projectName}</span>
                         </div>
                         <div className="grid grid-cols-[80px_1fr] gap-3 items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stage</span>
                            <span className="text-white font-medium text-sm">{getPaymentStageLabel(selectedPayment.stage || '')}</span>
                         </div>
                         
                         {selectedPayment.notes && (
                            <div className="mt-2 pt-3 border-t border-slate-700/50">
                              <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Customer Note</p>
                              <p className="text-sm text-slate-300 italic">"{selectedPayment.notes}"</p>
                            </div>
                         )}
                      </div>

                      <div className="pt-2">
                         <label className="text-slate-300 text-sm font-medium mb-2 block flex items-center justify-between">
                            Verification Notes
                            <span className="text-[10px] text-slate-500 font-normal uppercase tracking-wider">Internal Use Only</span>
                         </label>
                         <Textarea 
                           value={verificationNotes}
                           onChange={(e) => setVerificationNotes(e.target.value)}
                           placeholder="Add remarks about this transaction (required for rejection)..."
                           className="bg-slate-800 border-slate-600 focus:border-cyan-500 text-white min-h-[80px] text-sm resize-none focus:ring-1 focus:ring-cyan-500"
                         />
                      </div>
                   </div>

                   {/* Footer Actions */}
                   <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-700">
                      <Button variant="ghost" onClick={() => setShowDetails(false)} className="text-slate-400 hover:text-white hover:bg-slate-800">Cancel</Button>
                      <Button 
                         variant="danger" 
                         onClick={handleRejectPayment}
                         loading={processing}
                         className="bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border-rose-500/50"
                       >
                         <XCircle className="w-4 h-4 mr-2" />
                         Reject
                       </Button>
                       <Button 
                         onClick={handleVerifyPayment}
                         loading={processing}
                         className="bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 border-0"
                       >
                         <CheckCircle className="w-4 h-4 mr-2" />
                         Verify Payment
                       </Button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PendingPayments;
