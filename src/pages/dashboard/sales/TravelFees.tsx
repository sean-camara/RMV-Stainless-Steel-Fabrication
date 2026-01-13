import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ClipboardList, Coins, MapPin, RefreshCcw, User } from 'lucide-react';
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
  StatusBadge,
  Modal,
  Input,
  Textarea,
  PageLoader,
} from '../../../components/ui';
import { Appointment } from '../../../types';

const TravelFees: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [collectAmount, setCollectAmount] = useState('');
  const [collectNotes, setCollectNotes] = useState('');
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
      console.error('Failed to load appointments', error);
      toast.error(error?.response?.data?.message || 'Failed to load travel fees');
      notify({ type: 'error', title: 'Travel fees unavailable', message: 'Could not load assigned fees' });
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (!apt.travelFee?.isRequired || apt.travelFee.status === 'not_required') return false;
      if (search) {
        const needle = search.toLowerCase();
        const name = `${apt.customer?.firstName || apt.customer?.profile?.firstName || ''} ${
          apt.customer?.lastName || apt.customer?.profile?.lastName || ''
        }`.toLowerCase();
        const city = (apt.siteAddress?.city || '').toLowerCase();
        if (!name.includes(needle) && !city.includes(needle)) return false;
      }
      return true;
    });
  }, [appointments, search]);

  const stats = useMemo(() => {
    const base = { pending: 0, collected: 0, verified: 0 } as Record<string, number>;
    filteredAppointments.forEach((apt) => {
      const status = apt.travelFee?.status || 'pending';
      base[status] = (base[status] || 0) + 1;
    });
    return base;
  }, [filteredAppointments]);

  const openCollectModal = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setCollectAmount(String(apt.travelFee?.amount || 350));
    setCollectNotes(apt.travelFee?.notes || '');
    setShowCollectModal(true);
  };

  const handleCollect = async () => {
    if (!selectedAppointment) return;
    if (!collectAmount || Number(collectAmount) <= 0) {
      toast.error('Enter the collected amount');
      return;
    }

    setProcessing(true);
    try {
      await appointmentApi.collectTravelFee(selectedAppointment._id, {
        collectedAmount: Number(collectAmount),
        notes: collectNotes,
      });
      toast.success('Travel fee marked as collected');
      notify({ type: 'success', title: 'Travel fee collected', message: renderCustomer(selectedAppointment) });
      setShowCollectModal(false);
      setCollectNotes('');
      fetchAppointments();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to record collection');
      notify({ type: 'error', title: 'Collection failed', message: error?.response?.data?.message || 'Unable to save collection' });
    } finally {
      setProcessing(false);
    }
  };

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
    <div className="space-y-6 md:space-y-8 min-w-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Sales • Collections</p>
          <h1 className="text-2xl font-bold text-slate-900">Travel Fee Collection</h1>
          <p className="text-slate-600 mt-1">Collect on-site travel fees for your ocular visits</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="border-slate-300 text-slate-800 hover:bg-slate-100 shadow-sm"
            onClick={fetchAppointments}
            icon={<RefreshCcw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          <Input
            placeholder="Search by customer or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<User className="w-4 h-4" />}
            variant="light"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <Card variant="light" className="min-w-0">
          <CardContent className="py-4">
            <p className="text-sm text-amber-600">Pending Collection</p>
            <p className="text-2xl font-bold text-slate-900">{stats.pending || 0}</p>
          </CardContent>
        </Card>
        <Card variant="light" className="min-w-0">
          <CardContent className="py-4">
            <p className="text-sm text-cyan-600">Collected</p>
            <p className="text-2xl font-bold text-slate-900">{stats.collected || 0}</p>
          </CardContent>
        </Card>
        <Card variant="light" className="min-w-0">
          <CardContent className="py-4">
            <p className="text-sm text-emerald-600">Verified</p>
            <p className="text-2xl font-bold text-slate-900">{stats.verified || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card variant="light" className="min-w-0">
        <CardHeader variant="light">
          <CardTitle variant="light" className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-cyan-500" />
            My Travel Fees
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table variant="light">
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
                  message="No travel fees assigned"
                  icon={<Coins className="w-10 h-10 text-slate-400" />}
                />
              ) : (
                filteredAppointments.map((apt) => {
                  const status = apt.travelFee?.status || 'pending';
                  return (
                    <TableRow key={apt._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-slate-900 font-semibold">{renderCustomer(apt)}</p>
                            <p className="text-xs text-slate-500">{apt.customer?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-slate-900 font-medium">{format(new Date(apt.scheduledDate), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-slate-500">{format(new Date(apt.scheduledDate), 'h:mm a')}</p>
                      </TableCell>
                      <TableCell>
                        <div className="text-slate-700 text-sm flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>
                            {apt.siteAddress?.city || '—'}{apt.siteAddress?.province ? `, ${apt.siteAddress?.province}` : ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-slate-900 font-semibold">
                          ₱{(apt.travelFee?.amount || 0).toLocaleString()}
                        </p>
                        {apt.travelFee?.notes && (
                          <p className="text-xs text-slate-500 truncate max-w-[180px]">{apt.travelFee.notes}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {status === 'pending' ? (
                          <Button
                            size="sm"
                            onClick={() => openCollectModal(apt)}
                            className="bg-slate-900 hover:bg-slate-800 focus:ring-slate-500 text-white"
                          >
                            Collect Fee
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" disabled>
                            {status === 'collected' ? 'Collected' : 'Verified'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Collect Modal */}
      <Modal
        isOpen={showCollectModal}
        onClose={() => { setShowCollectModal(false); setSelectedAppointment(null); }}
        title="Collect Travel Fee"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
              <p className="text-sm text-slate-900 font-medium">{renderCustomer(selectedAppointment)}</p>
              <p className="text-xs text-slate-500">
                {selectedAppointment.siteAddress?.city} {selectedAppointment.siteAddress?.province && `, ${selectedAppointment.siteAddress.province}`}
              </p>
              <p className="text-slate-900 font-semibold mt-2">
                Suggested: ₱{(selectedAppointment.travelFee?.amount || 350).toLocaleString()}
              </p>
            </div>
            <Input
              label="Collected amount (₱)"
              type="number"
              value={collectAmount}
              onChange={(e) => setCollectAmount(e.target.value)}
              required
            />
            <Textarea
              label="Notes (optional)"
              rows={3}
              value={collectNotes}
              onChange={(e) => setCollectNotes(e.target.value)}
              placeholder="Add any on-site notes (receipt, etc.)"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowCollectModal(false)}>Cancel</Button>
              <Button
                onClick={handleCollect}
                loading={processing}
                className="bg-slate-900 hover:bg-slate-800 focus:ring-slate-500 text-white"
              >
                Mark Collected
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TravelFees;
