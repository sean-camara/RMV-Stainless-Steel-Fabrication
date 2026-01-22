import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  QrCode,
  Upload,
  Search,
  User,
  FileText,
  Trash2
} from 'lucide-react';
import { paymentApi } from '../../../api/services';
import { useNotification } from '../../../contexts/NotificationContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  Modal,
  Input,
  PageLoader,
  Badge
} from '../../../components/ui';
import { Payment } from '../../../types';
import toast from 'react-hot-toast';

const QRManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // File states
  const [gcashFile, setGcashFile] = useState<File | null>(null);
  const [bankFile, setBankFile] = useState<File | null>(null);

  const { notify } = useNotification();

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    setLoading(true);
    try {
      // We want payments that are 'pending' (not submitted/verified) so we can attach QRs before they pay
      const response = await paymentApi.getAll({ status: 'pending', limit: 100 });
      const list = response?.data?.data?.payments || response?.data?.payments || [];
      setPayments(list);
    } catch (error) {
      toast.error('Failed to load pending transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedPayment) return;
    if (!gcashFile && !bankFile) {
       toast.error('Please select at least one QR code to upload');
       return;
    }

    setProcessing(true);
    try {
       if (gcashFile) {
          const formData = new FormData();
          formData.append('file', gcashFile);
          formData.append('type', 'gcash');
          await paymentApi.uploadQR(selectedPayment._id, formData);
       }
       if (bankFile) {
          const formData = new FormData();
          formData.append('file', bankFile);
          formData.append('type', 'bank');
          await paymentApi.uploadQR(selectedPayment._id, formData);
       }

       toast.success('QR Codes uploaded successfully');
       notify({ type: 'success', title: 'Preparation Complete', message: 'You have attached payment QR codes to the transaction.' });
       setShowUploadModal(false);
       setGcashFile(null);
       setBankFile(null);
       fetchPendingPayments();
    } catch (error: any) {
       toast.error('Failed to upload QR codes');
    } finally {
       setProcessing(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      payment.projectId?.projectName?.toLowerCase().includes(search) ||
      payment.customerId?.firstName?.toLowerCase().includes(search) ||
      payment.customerId?.lastName?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return <PageLoader text="Loading transaction queue..." />;
  }

  return (
    <div className="space-y-8 relative">
       <div className="hero-fade-up">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          QR Code Setup
        </h1>
        <p className="text-slate-500 mt-2 font-light">
          Attach GCash and Bank QR codes to pending transactions so customers can pay.
        </p>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-white shadow-sm hero-fade-up">
         <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between" variant="light">
            <CardTitle className="text-slate-900 flex items-center gap-2">
               <QrCode className="w-5 h-5 text-purple-500" /> Pending Setup
            </CardTitle>
            <div className="w-full max-w-xs">
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4 text-slate-400" />}
                className="bg-white border-slate-200"
              />
            </div>
         </CardHeader>
         <CardContent className="p-0">
            <Table variant="light">
               <TableHeader>
                  <TableRow className="border-b border-slate-100">
                     <TableHead>Customer</TableHead>
                     <TableHead>Project</TableHead>
                     <TableHead>Amount Due</TableHead>
                     <TableHead>Current QR Status</TableHead>
                     <TableHead className="text-right">Action</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {filteredPayments.length === 0 ? (
                     <TableEmpty message="No transactions waiting for setup" colSpan={5} />
                  ) : (
                     filteredPayments.map((p) => {
                        const hasGcash = p.qrCodes?.gcash || p.qrCode;
                        const hasBank = p.qrCodes?.bank;
                        return (
                           <TableRow key={p._id} className="border-b border-slate-100 hover:bg-slate-50">
                              <TableCell className="font-medium text-slate-900">
                                 {p.customerId?.firstName} {p.customerId?.lastName}
                              </TableCell>
                              <TableCell className="text-slate-600">
                                 {p.projectId?.projectName}
                                 <div className="text-xs text-slate-400">{p.stage.replace('_', ' ')}</div>
                              </TableCell>
                              <TableCell className="font-bold text-slate-900">
                                 ₱{(p.amount?.expected || 0).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                 <div className="flex gap-2">
                                    {hasGcash ? <Badge variant="success">GCash Ready</Badge> : <Badge variant="warning">No GCash</Badge>}
                                    {hasBank ? <Badge variant="success">Bank Ready</Badge> : <Badge variant="warning">No Bank</Badge>}
                                 </div>
                              </TableCell>
                              <TableCell className="text-right">
                                 <Button 
                                    size="sm"
                                    onClick={() => {
                                       setSelectedPayment(p);
                                       setShowUploadModal(true);
                                    }}
                                    className="bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200"
                                 >
                                    <Upload className="w-4 h-4 mr-2" /> Upload QR
                                 </Button>
                              </TableCell>
                           </TableRow>
                        );
                     })
                  )}
               </TableBody>
            </Table>
         </CardContent>
      </Card>

      <Modal
         isOpen={showUploadModal}
         onClose={() => {
            setShowUploadModal(false);
            setGcashFile(null);
            setBankFile(null);
         }}
         title="Upload Payment QR Codes"
      >
         <div className="space-y-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
               <p className="text-slate-900 font-bold text-sm uppercase tracking-wide">Target Transaction</p>
               <div className="text-slate-500 text-sm mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer</span>
                     <span className="font-semibold text-slate-900">{selectedPayment?.customerId?.firstName} {selectedPayment?.customerId?.lastName}</span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount Due</span>
                     <span className="font-semibold text-slate-900">₱{selectedPayment?.amount?.expected?.toLocaleString()}</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl p-6 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-center group cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex justify-center mb-3">
                     <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <QrCode className="w-6 h-6 text-blue-600" />
                     </div>
                  </div>
                  <h3 className="relative z-10 text-slate-900 font-bold mb-1">GCash QR</h3>
                  <p className="relative z-10 text-xs text-slate-500 mb-4 font-medium">Upload GCash QR Image</p>
                  <label className="block relative z-10">
                     <span className="sr-only">Choose file</span>
                     <input 
                        type="file" 
                        accept="image/*"
                        className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-xs file:font-bold
                        file:bg-blue-600 file:text-white
                        hover:file:bg-blue-700 cursor-pointer"
                        onChange={(e) => setGcashFile(e.target.files ? e.target.files[0] : null)}
                     />
                  </label>
                  {gcashFile && <p className="relative z-10 mt-2 text-xs font-bold text-emerald-600 flex items-center justify-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> {gcashFile.name}</p>}
               </div>

               <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl p-6 hover:border-amber-400 hover:bg-amber-50/30 transition-all text-center group cursor-pointer relative overflow-hidden">
                   <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="relative z-10 flex justify-center mb-3">
                     <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <QrCode className="w-6 h-6 text-amber-600" />
                     </div>
                  </div>
                  <h3 className="relative z-10 text-slate-900 font-bold mb-1">Bank QR</h3>
                  <p className="relative z-10 text-xs text-slate-500 mb-4 font-medium">Upload Bank QR Image</p>
                  <label className="block relative z-10">
                     <span className="sr-only">Choose file</span>
                     <input 
                        type="file" 
                        accept="image/*"
                        className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-xs file:font-bold
                        file:bg-amber-500 file:text-white
                        hover:file:bg-amber-600 cursor-pointer"
                        onChange={(e) => setBankFile(e.target.files ? e.target.files[0] : null)}
                     />
                  </label>
                  {bankFile && <p className="relative z-10 mt-2 text-xs font-bold text-emerald-600 flex items-center justify-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> {bankFile.name}</p>}
               </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 gap-3">
               <Button variant="ghost" onClick={() => setShowUploadModal(false)} className="text-slate-500 hover:text-slate-700 hover:bg-slate-50">Cancel</Button>
               <Button onClick={handleUpload} loading={processing} disabled={!gcashFile && !bankFile} className="bg-slate-900 text-white hover:bg-slate-800">
                  Upload & Activate
               </Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default QRManagement;
