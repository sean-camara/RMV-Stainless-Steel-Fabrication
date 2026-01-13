import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableEmpty, Button } from '../../../components/ui';

const SalesAppointments: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 sm:gap-6 pt-1">
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-wide text-slate-400">Sales • Appointments</p>
          <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-slate-600">Schedule, track, and manage customer appointments.</p>
        </div>
        <div className="flex gap-2">
          <Button
            as={Link}
            to="/dashboard/sales/travel-fees"
            className="bg-slate-900 hover:bg-slate-800 focus:ring-slate-500 text-white"
          >
            Travel Fees
          </Button>
          <Button
            as={Link}
            to="/dashboard/sales/projects"
            variant="outline"
            className="border-slate-300 text-slate-800 hover:bg-slate-100"
          >
            Projects
          </Button>
        </div>
      </div>

      <Card variant="light">
        <CardHeader variant="light">
          <CardTitle variant="light">Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table variant="light">
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableEmpty
                colSpan={5}
                message="No appointments yet"
                icon={
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">Note</p>
        <p className="mt-1">This view is ready for wiring to the sales appointments data source. Let me know which fields/actions you want and I will hook it up.</p>
      </div>
    </div>
  );
};

export default SalesAppointments;
