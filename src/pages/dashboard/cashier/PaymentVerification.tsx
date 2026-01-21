import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Clock,
  Filter,
  Search,
  DollarSign,
  FileText,
  ExternalLink,
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
  Input,
  Textarea,
  Select,
  PageLoader,
  Pagination,
} from '../../../components/ui';
import { Payment } from '../../../types';
import toast from 'react-hot-toast';

const PaymentVerification: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { notify } = useNotification();

  useEffect(() => {
    fetchPayments();
  }, [currentPage, statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentApi.getAll({
        page: currentPage,
        limit: 10,
        status: statusFilter || undefined,
      });
      setPayments(response.data.payments || []);
      setTotalPages(Math.ceil((response.data.total || 0) / 10));
    } catch (error) {
      toast.error('Failed to load payments');
      notify({ type: 'error', title: 'Payments unavailable', message: 'Could not load payments list' });
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
      notify({ type: 'success', title: 'Payment verified', message: `${selectedPayment.customerId?.firstName || 'Customer'} • ${getPaymentStageLabel(selectedPayment.stage)}` });
      setShowDetails(false);
      setVerificationNotes('');
      fetchPayments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to verify payment');
      notify({ type: 'error', title: 'Verification failed', message: error.response?.data?.message || 'Unable to verify payment' });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment) return;

    if (!verificationNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      await paymentApi.reject(selectedPayment._id, verificationNotes);
      toast.success('Payment rejected');
      notify({ type: 'warning', title: 'Payment rejected', message: `${selectedPayment.customerId?.firstName || 'Customer'} • ${getPaymentStageLabel(selectedPayment.stage)}` });
      setShowDetails(false);
      setVerificationNotes('');
      fetchPayments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject payment');
      notify({ type: 'error', title: 'Rejection failed', message: error.response?.data?.message || 'Unable to reject payment' });
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentStageLabel = (stage: string): string => {
    const labels: Record<string, string> = {
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

  // Stats
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const todayVerified = payments.filter(
    (p) =>
      p.status === 'verified' &&
      p.verifiedAt &&
      format(new Date(p.verifiedAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );
  const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount?.expected || 0), 0);

  if (loading) {
    return <PageLoader text="Loading payments..." />;
  }

  return (
    <div className="space-y-8 relative">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-amber-50/50 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -z-10 w-64 h-64 bg-slate-100/50 rounded-full blur-3xl" />

      {/* Header */}
      <div className="hero-fade-up">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Payment Verification</h1>
        <p className="text-slate-500 mt-2 font-light">Review and verify customer payment proofs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 hero-fade-up" style={{ animationDelay: '0.1s' }}>
        <Card className="bg-white/70 backdrop-blur-sm border-white shadow-sm hover:shadow-md transition-all">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pendingPayments.length}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Pending Review</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white shadow-sm hover:shadow-md transition-all">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                ₱{totalPendingAmount.toLocaleString()}
              </p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Pending Amount</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white shadow-sm hover:shadow-md transition-all">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{todayVerified.length}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Verified Today</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white shadow-sm hover:shadow-md transition-all">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{payments.length}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Payments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white/70 backdrop-blur-sm border-white shadow-sm hero-fade-up" style={{ animationDelay: '0.2s' }}>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by project, customer, or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4 text-slate-400" />}
                className="bg-white border-slate-200 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'verified', label: 'Verified' },
                  { value: 'rejected', label: 'Rejected' },
                ]}
                className="bg-white border-slate-200 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="bg-white/70 backdrop-blur-sm border-white shadow-sm hero-fade-up" style={{ animationDelay: '0.3s' }}>
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Filter className="w-5 h-5 text-amber-500" />
            Payments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-b border-slate-100">
                <TableHead className="text-slate-500 font-semibold">Customer & Project</TableHead>
                <TableHead className="text-slate-500 font-semibold">Stage</TableHead>
                <TableHead className="text-slate-500 font-semibold">Amount</TableHead>
                <TableHead className="text-slate-500 font-semibold">Reference</TableHead>
                <TableHead className="text-slate-500 font-semibold">Status</TableHead>
                <TableHead className="text-right text-slate-500 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableEmpty
                  colSpan={6}
                  message="No payments found"
                  icon={<CreditCard className="w-12 h-12 text-slate-300" />}
                />
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {payment.customerId?.firstName} {payment.customerId?.lastName}
                          </p>
                          <p className="text-sm text-slate-500">
                            {payment.projectId?.projectName || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-600 font-medium">
                        {getPaymentStageLabel(payment.stage)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-slate-900">
                        ₱{(payment.amount?.expected || 0).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-slate-500">
                        {payment.referenceNumber || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowDetails(true);
                        }}
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Payment Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedPayment(null);
          setVerificationNotes('');
        }}
        title="Payment Review"
        size="lg"
      >
        {selectedPayment && (
          <div className="space-y-6">
            {/* Customer & Project Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-400" />
                  Customer
                </h4>
                <p className="text-white">
                  {selectedPayment.customerId?.firstName}{' '}
                  {selectedPayment.customerId?.lastName}
                </p>
                <p className="text-sm text-slate-400">
                  {selectedPayment.customerId?.email}
                </p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-3">Project</h4>
                <p className="text-white">{selectedPayment.projectId?.projectName || 'N/A'}</p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-slate-400">Payment Stage</label>
                <p className="text-white font-medium">
                  {getPaymentStageLabel(selectedPayment.stage)}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Amount</label>
                <p className="text-xl font-bold text-cyan-400">
                  ₱{selectedPayment.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Reference Number</label>
                <p className="text-white">{selectedPayment.referenceNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Status</label>
                <div className="mt-1">
                  <StatusBadge status={selectedPayment.status} />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400">Submitted</label>
                <p className="text-white">
                  {format(new Date(selectedPayment.createdAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>

            {/* Payment Proof */}
            {selectedPayment.proofUrl && (
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Payment Proof
                </h4>
                <div className="flex items-center justify-between">
                  <p className="text-slate-300">Uploaded receipt/screenshot</p>
                  <a
                    href={selectedPayment.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-cyan-400 hover:underline"
                  >
                    View Proof <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                {/* Preview if image */}
                <div className="mt-4 bg-slate-800 rounded-lg p-4 flex items-center justify-center min-h-[200px]">
                  <img
                    src={selectedPayment.proofUrl}
                    alt="Payment proof"
                    className="max-h-[300px] rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Customer Notes */}
            {selectedPayment.notes && (
              <div>
                <label className="text-sm text-slate-400">Customer Notes</label>
                <p className="text-white mt-1 bg-slate-700/50 p-3 rounded-lg">
                  {selectedPayment.notes}
                </p>
              </div>
            )}

            {/* Verification Notes */}
            {selectedPayment.status === 'pending' && (
              <Textarea
                label="Verification Notes"
                placeholder="Add notes (required for rejection)..."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={3}
              />
            )}

            {/* Previous Verification Notes */}
            {selectedPayment.verificationNotes && (
              <div>
                <label className="text-sm text-slate-400">Verification Notes</label>
                <p className="text-white mt-1 bg-slate-700/50 p-3 rounded-lg">
                  {selectedPayment.verificationNotes}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {selectedPayment.status === 'pending' && (
              <div className="flex gap-3 justify-end border-t border-slate-700 pt-4">
                <Button
                  variant="danger"
                  onClick={handleRejectPayment}
                  loading={processing}
                  icon={<XCircle className="w-4 h-4" />}
                >
                  Reject
                </Button>
                <Button
                  onClick={handleVerifyPayment}
                  loading={processing}
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  Verify Payment
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentVerification;
