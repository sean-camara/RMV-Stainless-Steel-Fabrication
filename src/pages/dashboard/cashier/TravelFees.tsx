import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ClipboardCheck, CreditCard, MapPin, RefreshCcw, ShieldCheck, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentApi } from '../../../api/services';
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
  Textarea,
  Select,
  StatusBadge,
  PageLoader,
} from '../../../components/ui';
import { Appointment } from '../../../types';

const CashierTravelFees: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [filterStatus, setFilterStatus] = useState('pending');
  const [search, setSearch] = useState('');

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showSetModal, setShowSetModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [feeAmount, setFeeAmount] = useState('350');
  const [isRequired, setIsRequired] = useState(true);
  const [notes, setNotes] = useState('');
  const [verifyNotes, setVerifyNotes] = useState('');
  const { notify } = useNotification();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentApi.getAll({ limit: 100 });
      const data = (response as any)?.data || response;
      const list: Appointment[] = (data.appointments || []).filter(
        (apt: Appointment) => apt.appointmentType === 'ocular_visit'
      );
      setAppointments(list);
    } catch (error: any) {
      console.error('Failed to load travel fees', error);
      toast.error(error?.response?.data?.message || 'Failed to load travel fees');
    } finally {
      setLoading(false);
    }
  };

  const openSetModal = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setFeeAmount(String(apt.travelFee?.amount || 350));
    setIsRequired(apt.travelFee?.isRequired !== false);
    setNotes(apt.travelFee?.notes || '');
    setShowSetModal(true);
  };

  const openVerifyModal = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setVerifyNotes('');
    setShowVerifyModal(true);
  };

  const handleSetTravelFee = async () => {
    if (!selectedAppointment) return;

    if (isRequired && (!feeAmount || Number(feeAmount) <= 0)) {
      toast.error('Enter a valid travel fee amount');
      return;
    }

    setProcessing(true);
    try {
      await appointmentApi.setTravelFee(selectedAppointment._id, {
        amount: Number(feeAmount) || 0,
        isRequired,
        notes,
      });
      toast.success(isRequired ? 'Travel fee saved' : 'Marked as not required');
      notify({ type: 'success', title: 'Travel fee updated', message: isRequired ? 'Pending collection' : 'Not required' });
      setShowSetModal(false);
      setNotes('');
      fetchAppointments();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save travel fee');
      notify({ type: 'error', title: 'Travel fee error', message: error?.response?.data?.message || 'Unable to save travel fee' });
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyTravelFee = async () => {
    if (!selectedAppointment) return;

    setProcessing(true);
    try {
      await appointmentApi.verifyTravelFee(selectedAppointment._id, { notes: verifyNotes });
      toast.success('Travel fee verified');
      notify({ type: 'success', title: 'Travel fee verified', message: renderCustomer(selectedAppointment) });
      setShowVerifyModal(false);
      setVerifyNotes('');
      fetchAppointments();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to verify travel fee');
      notify({ type: 'error', title: 'Verification failed', message: error?.response?.data?.message || 'Please try again' });
    } finally {
      setProcessing(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const status = apt.travelFee?.status || 'not_required';
      if (filterStatus !== 'all' && status !== filterStatus) return false;

      if (search) {
        const needle = search.toLowerCase();
        const name = `${apt.customer?.firstName || apt.customer?.profile?.firstName || ''} ${
          apt.customer?.lastName || apt.customer?.profile?.lastName || ''
        }`.toLowerCase();
        const address = `${apt.siteAddress?.city || ''} ${apt.siteAddress?.province || ''}`.toLowerCase();
        if (!name.includes(needle) && !address.includes(needle)) return false;
      }
      return true;
    });
  }, [appointments, filterStatus, search]);

  const stats = useMemo(() => {
    const base = { pending: 0, collected: 0, verified: 0, not_required: 0 } as Record<string, number>;
    appointments.forEach((apt) => {
      const key = apt.travelFee?.status || 'not_required';
      base[key] = (base[key] || 0) + 1;
    });
    return base;
  }, [appointments]);

  const renderCustomer = (apt?: Appointment | null) => {
    if (!apt) return 'Customer';
    const first = apt.customer?.firstName || apt.customer?.profile?.firstName || 'Customer';
    const last = apt.customer?.lastName || apt.customer?.profile?.lastName || '';
    return `${first} ${last}`.trim();
  };

  if (loading) {
    return <PageLoader text="Loading travel fees..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Travel Fees</h1>
          <p className="text-slate-400 mt-1">Set, update, and verify travel fees for ocular visits</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={fetchAppointments} icon={<RefreshCcw className="w-4 h-4" />}>Refresh</Button>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'pending', label: 'Pending collection' },
              { value: 'collected', label: 'Awaiting verification' },
              { value: 'verified', label: 'Verified' },
              { value: 'not_required', label: 'Not required' },
            ]}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="py-4">
            <p className="text-sm text-yellow-200">Pending Collection</p>
            <p className="text-2xl font-bold text-white">{stats.pending || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="py-4">
            <p className="text-sm text-cyan-200">Awaiting Verification</p>
            <p className="text-2xl font-bold text-white">{stats.collected || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="py-4">
            <p className="text-sm text-green-200">Verified</p>
            <p className="text-2xl font-bold text-white">{stats.verified || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-500/10 border-slate-500/30">
          <CardContent className="py-4">
            <p className="text-sm text-slate-200">Not Required</p>
            <p className="text-2xl font-bold text-white">{stats.not_required || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search by customer or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<User className="w-4 h-4" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-cyan-400" />
            Travel Fee Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableEmpty
                  colSpan={6}
                  message="No travel fees found"
                  icon={<CreditCard className="w-10 h-10 text-slate-500" />}
                />
              ) : (
                filteredAppointments.map((apt) => {
                  const status = apt.travelFee?.status || 'not_required';
                  const feeAmountDisplay = apt.travelFee?.isRequired === false
                    ? 'Not required'
                    : apt.travelFee?.amount
                      ? `₱${apt.travelFee.amount.toLocaleString()}`
                      : '—';
                  return (
                    <TableRow key={apt._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-300" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{renderCustomer(apt)}</p>
                            <p className="text-xs text-slate-400">{apt.customer?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-white font-medium">{format(new Date(apt.scheduledDate), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-slate-400">{format(new Date(apt.scheduledDate), 'h:mm a')}</p>
                      </TableCell>
                      <TableCell>
                        <div className="text-slate-300 text-sm flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>
                            {apt.siteAddress?.city || '—'}{apt.siteAddress?.province ? `, ${apt.siteAddress?.province}` : ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-white font-semibold">{feeAmountDisplay}</p>
                        {apt.travelFee?.notes && (
                          <p className="text-xs text-slate-400 truncate max-w-[180px]">{apt.travelFee.notes}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openSetModal(apt)}
                            icon={<ShieldCheck className="w-4 h-4" />}
                          >
                            {status === 'not_required' ? 'Set fee' : 'Update'}
                          </Button>
                          {status === 'collected' && (
                            <Button
                              size="sm"
                              onClick={() => openVerifyModal(apt)}
                              icon={<ClipboardCheck className="w-4 h-4" />}
                            >
                              Verify
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Set/Update Modal */}
      <Modal
        isOpen={showSetModal}
        onClose={() => { setShowSetModal(false); setSelectedAppointment(null); }}
        title="Set Travel Fee"
      >
        <div className="space-y-4">
          <div className="bg-slate-700/40 border border-slate-600 rounded-lg p-3">
            <p className="text-sm text-slate-300">{renderCustomer(selectedAppointment)}</p>
            <p className="text-xs text-slate-400">
              {selectedAppointment?.siteAddress?.city} {selectedAppointment?.siteAddress?.province && `, ${selectedAppointment.siteAddress.province}`}
            </p>
          </div>
          <div className="flex items-center justify-between bg-slate-700/40 border border-slate-600 rounded-lg p-3">
            <div>
              <p className="text-sm text-white font-medium">Require travel fee?</p>
              <p className="text-xs text-slate-400">Toggle off if within NCR or waived</p>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-slate-200">
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="w-5 h-5"
              />
              {isRequired ? 'Required' : 'Not required'}
            </label>
          </div>
          <Input
            label="Travel fee amount (₱)"
            type="number"
            value={feeAmount}
            onChange={(e) => setFeeAmount(e.target.value)}
            disabled={!isRequired}
            required={isRequired}
            helperText={!isRequired ? 'Amount disabled because fee is not required' : ''}
          />
          <Textarea
            label="Notes (optional)"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any details about the fee..."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowSetModal(false)}>Cancel</Button>
            <Button onClick={handleSetTravelFee} loading={processing}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Verify Modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => { setShowVerifyModal(false); setSelectedAppointment(null); }}
        title="Verify Travel Fee"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="bg-slate-700/40 border border-slate-600 rounded-lg p-3">
              <p className="text-sm text-slate-300">{renderCustomer(selectedAppointment)}</p>
              <p className="text-xs text-slate-400 mb-2">
                {selectedAppointment.siteAddress?.city} {selectedAppointment.siteAddress?.province && `, ${selectedAppointment.siteAddress.province}`}
              </p>
              <p className="text-white font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                Collected: ₱{selectedAppointment.travelFee?.amount?.toLocaleString() || '0'}
              </p>
              {selectedAppointment.travelFee?.collectedAt && (
                <p className="text-xs text-slate-400 mt-1">
                  Collected on {format(new Date(selectedAppointment.travelFee.collectedAt), 'MMM d, yyyy h:mma')}
                </p>
              )}
            </div>
            <Textarea
              label="Verification notes"
              rows={3}
              value={verifyNotes}
              onChange={(e) => setVerifyNotes(e.target.value)}
              placeholder="Add any verification notes..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowVerifyModal(false)}>Cancel</Button>
              <Button onClick={handleVerifyTravelFee} loading={processing}>
                Verify
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CashierTravelFees;
