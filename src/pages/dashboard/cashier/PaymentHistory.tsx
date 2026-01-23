import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  CreditCard,
  Eye,
  User,
  Filter,
  Search,
  FileText,
  ExternalLink,
  CheckCircle,
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
  Select,
  PageLoader,
  Pagination,
  Input,
} from '../../../components/ui';
import { Payment } from '../../../types';
import toast from 'react-hot-toast';

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
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
      const list = response?.data?.data?.payments || response?.data?.payments || [];
      const total = response?.data?.data?.pagination?.total || response?.data?.total || list.length;
      setPayments(list);
      setTotalPages(Math.ceil(total / 10));
    } catch (error) {
      toast.error('Failed to load payment history');
      notify({ type: 'error', title: 'Error', message: 'Could not load payment history' });
    } finally {
      setLoading(false);
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
      full: 'Full Payment (100%)',
    };
    return labels[stage] || stage;
  };

  // Client-side search if API doesn't support search param yet, or redundant filtering
  // Ideally API handles search, but for now filtering fetched page
  // Note: Searching on paged data CLIENT side is bad UX (only searches current page), 
  // but if API doesn't have ?search=... we might have to live with it or fetch all.
  // The original file used client-side filtering on the fetched list.
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

  if (loading) {
    return <PageLoader text="Loading history..." />;
  }

  return (
    <div className="space-y-8 relative">
       <div className="hero-fade-up">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Payment History
        </h1>
        <p className="text-slate-500 mt-2 font-light">
          Complete log of all verified, pending, and rejected transactions
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-white/70 backdrop-blur-sm border-white shadow-sm hero-fade-up overflow-visible">
        <CardContent className="py-4 overflow-visible">
          <div className="flex flex-col md:flex-row gap-4 justify-between overflow-visible">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4 text-slate-400" />}
                className="bg-white border-slate-200"
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
                  { value: 'submitted', label: 'Pending Review' },
                  { value: 'verified', label: 'Verified' },
                  { value: 'rejected', label: 'Rejected' },
                ]}
                variant="light"
                className="bg-white border-slate-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white/70 backdrop-blur-sm border-white shadow-sm hero-fade-up" variant="light">
        <CardHeader className="border-b border-slate-100" variant="light">
          <CardTitle className="flex items-center gap-2 text-slate-900" variant="light">
            <Filter className="w-5 h-5 text-slate-400" /> Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table variant="light">
            <TableHeader>
              <TableRow className="border-b border-slate-100">
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableEmpty message="No records found" colSpan={6} />
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <TableCell className="text-slate-600">
                       {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">
                        {payment.customerId?.firstName} {payment.customerId?.lastName}
                      </div>
                      <div className="text-xs text-slate-500">{payment.projectId?.projectName}</div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {getPaymentStageLabel(payment.stage)}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">
                      ₱{(payment.amount?.expected || 0).toLocaleString()}
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
                        className="text-slate-500 hover:text-slate-700"
                      >
                        <Eye className="w-4 h-4" />
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

      {/* Detail Modal (Read Only) */}
      <Modal
        isOpen={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedPayment(null);
        }}
        title="Transaction Details"
        size="lg"
      >
        {selectedPayment && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-100">
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Amount</p>
               <p className="text-4xl font-black text-slate-900 tracking-tight">₱{selectedPayment.amount.expected.toLocaleString()}</p>
               <div className="mt-4 flex justify-center">
                  <StatusBadge status={selectedPayment.status} />
               </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
               <div className="space-y-4">
                  <h4 className="border-b border-slate-100 pb-2 text-slate-900 font-bold text-sm uppercase tracking-wide">Customer Info</h4>
                  <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                     <span className="text-slate-500 font-medium">Name:</span>
                     <span className="text-slate-900 font-semibold">{selectedPayment.customerId?.firstName} {selectedPayment.customerId?.lastName}</span>
                     <span className="text-slate-500 font-medium">Project:</span>
                     <span className="text-slate-900 font-semibold">{selectedPayment.projectId?.projectName}</span>
                  </div>
               </div>
               <div className="space-y-4">
                  <h4 className="border-b border-slate-100 pb-2 text-slate-900 font-bold text-sm uppercase tracking-wide">Payment Info</h4>
                   <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                     <span className="text-slate-500 font-medium">Stage:</span>
                     <span className="text-slate-900">{getPaymentStageLabel(selectedPayment.stage)}</span>
                     <span className="text-slate-500 font-medium">Ref No:</span>
                     <span className="text-slate-900 font-mono bg-slate-50 px-2 rounded">{selectedPayment.referenceNumber || 'N/A'}</span>
                     <span className="text-slate-500 font-medium">Submitted:</span>
                     <span className="text-slate-900">{format(new Date(selectedPayment.createdAt), 'MMM d, yyyy')}</span>
                     {selectedPayment.verifiedAt && (
                        <>
                           <span className="text-slate-500 font-medium">Verified:</span>
                           <span className="text-emerald-600 font-bold">{format(new Date(selectedPayment.verifiedAt), 'MMM d, yyyy')}</span>
                        </>
                     )}
                  </div>
               </div>
            </div>
            
            {selectedPayment.proofUrl && (
               <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-slate-900 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                     <FileText className="w-4 h-4 text-slate-400"/> Payment Proof
                  </h4>
                  <div className="flex items-center gap-3">
                     <a 
                       href={selectedPayment.proofUrl} 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="text-white hover:text-white/90 flex items-center gap-2 text-sm bg-slate-900 hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow font-medium"
                     >
                        Open Receipt <ExternalLink className="w-3 h-3"/>
                     </a>
                  </div>
               </div>
            )}

            <div className="flex justify-end pt-4">
               <Button onClick={() => setShowDetails(false)} variant="outline" className="border-slate-200">Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentHistory;
