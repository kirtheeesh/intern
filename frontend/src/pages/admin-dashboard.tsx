import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  useGetRegistrationStats, 
  useListRegistrations, 
  useUpdateRegistration, 
  useAdminLogout,
  useAdminMe,
  getGetRegistrationStatsQueryKey,
  getListRegistrationsQueryKey
} from "../api";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, CheckCircle, XCircle, Clock, Search, LogOut, Download, Phone, Mail, FileText, Image as ImageIcon, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedRegId, setSelectedRegId] = useState<number | null>(null);

  // ALL hooks must be called unconditionally before any returns
  const { data: auth, isLoading: authLoading, isError: authError } = useAdminMe();

  const queryParams: Record<string, string> = {};
  if (search) queryParams.search = search;
  if (selectedStatus !== "all") queryParams.status = selectedStatus;

  const { data: stats, isLoading: statsLoading } = useGetRegistrationStats({
    query: { enabled: auth?.authenticated === true },
  });

  const { data: registrations, isLoading: listLoading } = useListRegistrations(queryParams, {
    query: { enabled: auth?.authenticated === true },
  });

  const logoutMutation = useAdminLogout({
    mutation: {
      onSuccess: () => {
        setLocation("/admin/login");
      },
    },
  });

  // Use effect for redirect — never call setLocation during render
  useEffect(() => {
    if (!authLoading && (authError || (auth && !auth.authenticated))) {
      setLocation("/admin/login");
    }
  }, [authLoading, authError, auth, setLocation]);

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logoutMutation.mutate();
    }
  };

  const handleExport = () => {
    let url = "/api/registrations/export";
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (selectedStatus !== "all") params.append("status", selectedStatus);
    if (params.toString()) url += `?${params.toString()}`;
    window.open(url, "_blank");
  };

  const selectedRegistration = registrations?.find((r) => r.id === selectedRegId);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authError || (auth && !auth.authenticated)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold text-sm">A</div>
            <h1 className="font-bold text-xl text-foreground">Aimstorm Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="w-5 h-5 text-slate-500 hover:text-slate-900" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Registrations</p>
                <h3 className="text-3xl font-bold">{statsLoading ? "—" : stats?.total ?? 0}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">New</p>
                <h3 className="text-3xl font-bold">{statsLoading ? "—" : stats?.newCount ?? 0}</h3>
              </div>
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Selected</p>
                <h3 className="text-3xl font-bold">{statsLoading ? "—" : stats?.selectedCount ?? 0}</h3>
              </div>
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Rejected</p>
                <h3 className="text-3xl font-bold">{statsLoading ? "—" : stats?.rejectedCount ?? 0}</h3>
              </div>
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <CardTitle>Registrations</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search name, email, phone..."
                    className="pl-9 w-full sm:w-[250px]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="selected">Selected</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {listLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              </div>
            ) : !registrations || registrations.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No registrations found matching your criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Reg #</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Education</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((reg) => (
                      <TableRow key={reg.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-mono text-xs text-slate-500">
                          {reg.registrationNumber}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900">{reg.fullName}</div>
                          <div className="text-xs text-slate-500">{reg.gender}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <a
                              href={`tel:+91${reg.mobileNumber}`}
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Phone className="w-3 h-3" /> +91 {reg.mobileNumber}
                            </a>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {reg.emailId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className="text-sm truncate max-w-[200px]"
                            title={reg.college ?? ""}
                          >
                            {reg.college || "-"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {reg.degree} {reg.yearOfStudy ? `(${reg.yearOfStudy})` : ""}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={reg.status} />
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {format(new Date(reg.submittedAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRegId(reg.id)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Detail Modal */}
      {selectedRegistration && (
        <ApplicantDetailModal
          registration={selectedRegistration}
          isOpen={!!selectedRegId}
          onClose={() => setSelectedRegId(null)}
          onUpdated={() => {
            queryClient.invalidateQueries({ queryKey: getListRegistrationsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetRegistrationStatsQueryKey() });
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "bg-amber-100 text-amber-800",
    contacted: "bg-blue-100 text-blue-800",
    selected: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  const cls = map[status.toLowerCase()] ?? "bg-slate-100 text-slate-800";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}

function ApplicantDetailModal({
  registration,
  isOpen,
  onClose,
  onUpdated,
}: {
  registration: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { toast } = useToast();
  const [status, setStatus] = useState(registration.status);
  const [notes, setNotes] = useState(registration.notes ?? "");

  const updateMutation = useUpdateRegistration({
    mutation: {
      onSuccess: () => {
        toast({ title: "Updated successfully" });
        onUpdated();
      },
      onError: () => {
        toast({ title: "Update failed", variant: "destructive" });
      },
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ id: registration.id, data: { status, notes } });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-border bg-slate-50">
          <div className="flex justify-between items-start pr-6">
            <div>
              <DialogTitle className="text-2xl font-bold">{registration.fullName}</DialogTitle>
              <DialogDescription className="text-slate-500 font-mono mt-1">
                Ref: {registration.registrationNumber} • Applied on{" "}
                {format(new Date(registration.submittedAt), "PPP")}
              </DialogDescription>
            </div>
            <StatusBadge status={registration.status} />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="md:col-span-2 space-y-8">
            <section>
              <h3 className="text-lg font-bold border-b pb-2 mb-4">Contact Info</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block">Email</span>
                  <a
                    href={`mailto:${registration.emailId}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {registration.emailId}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block">Phone</span>
                  <a
                    href={`tel:+91${registration.mobileNumber}`}
                    className="font-medium text-primary hover:underline"
                  >
                    +91 {registration.mobileNumber}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block">DOB / Gender</span>
                  <span className="font-medium">
                    {registration.dateOfBirth} • {registration.gender}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Location</span>
                  <span className="font-medium">{registration.address || "-"}</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold border-b pb-2 mb-4">Education</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2">
                  <span className="text-slate-500 block">College</span>
                  <span className="font-medium">{registration.college || "-"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Degree / Year</span>
                  <span className="font-medium">
                    {registration.degree || "-"} • {registration.yearOfStudy || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Department</span>
                  <span className="font-medium">{registration.department || "-"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">University</span>
                  <span className="font-medium">{registration.university || "-"}</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold border-b pb-2 mb-4">Application Details</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-slate-500 block mb-1">Why do you want to join?</span>
                  <p className="bg-slate-50 p-3 rounded border text-slate-700 whitespace-pre-wrap">
                    {registration.whyJoin}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block">Areas of Interest</span>
                    <span className="font-medium">{registration.areasOfInterest || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Start own business?</span>
                    <span className="font-medium">{registration.interestedInBusiness || "-"}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block">Current Skills</span>
                  <span className="font-medium">{registration.currentSkills || "-"}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block">Business Knowledge</span>
                    <span className="font-medium">{registration.businessKnowledge || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Availability</span>
                    <span className="font-medium">
                      {registration.canAttendAll === "Yes" ? "All 15 Days" : "Partial"} •{" "}
                      {registration.preferredTimeSlot || "Any time"}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar / Actions */}
          <div className="space-y-6 bg-slate-50 p-5 rounded-xl border border-border h-fit">
            <div>
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Documents
              </h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                  disabled={!registration.resumePath}
                >
                  <a
                    href={
                      registration.resumePath
                        ? `/api/uploads/${registration.resumePath.split("/").pop()}`
                        : "#"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download Resume
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                  disabled={!registration.photoPath}
                >
                  <a
                    href={
                      registration.photoPath
                        ? `/api/uploads/${registration.photoPath.split("/").pop()}`
                        : "#"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    View Photo
                  </a>
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="font-bold mb-3">Admin Actions</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">
                    Update Status
                  </label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="selected">Selected</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">
                    Admin Notes
                  </label>
                  <Textarea
                    placeholder="Internal notes about this applicant..."
                    className="resize-none h-24"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleSave}
                  disabled={
                    updateMutation.isPending ||
                    (status === registration.status && notes === (registration.notes ?? ""))
                  }
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
