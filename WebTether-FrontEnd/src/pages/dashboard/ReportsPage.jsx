import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Plus, XCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { useToast } from "../../components/ui/use-toast";

const mockReports = [
  {
    id: 1,
    validator: "validator123",
    website: "https://example.com",
    reason: "False reporting of website status",
    status: "pending",
    date: "2023-05-15",
  },
  {
    id: 2,
    validator: "webchecker42",
    website: "https://test.org",
    reason: "Manipulating ping data",
    status: "resolved",
    date: "2023-05-10",
  },
  {
    id: 3,
    validator: "pingmaster",
    website: "https://demo.net",
    reason: "Multiple false reports",
    status: "rejected",
    date: "2023-05-05",
  },
];

export default function ReportsPage() {
  const [reports, setReports] = useState(mockReports);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [newReport, setNewReport] = useState({
    validator: "",
    website: "",
    reason: "",
  });
  const { toast } = useToast();

  const createReport = () => {
    if (!newReport.validator || !newReport.website || !newReport.reason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to submit a report.",
        variant: "destructive",
      });
      return;
    }

    const report = {
      id: reports.length + 1,
      validator: newReport.validator,
      website: newReport.website,
      reason: newReport.reason,
      status: "pending",
      date: new Date().toISOString().split("T")[0],
    };

    setReports([report, ...reports]);
    setNewReport({ validator: "", website: "", reason: "" });
    setIsCreatingReport(false);

    toast({
      title: "Report Submitted",
      description: "Your report has been submitted and will be reviewed by our team.",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "resolved":
        return <Badge className="bg-green-500">Resolved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "resolved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <Dialog open={isCreatingReport} onOpenChange={setIsCreatingReport}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Validator</DialogTitle>
            </DialogHeader>
            <Label>Validator</Label>
            <Input
              value={newReport.validator}
              onChange={(e) => setNewReport({ ...newReport, validator: e.target.value })}
            />
            <Label>Website</Label>
            <Input
              value={newReport.website}
              onChange={(e) => setNewReport({ ...newReport, website: e.target.value })}
            />
            <Label>Reason</Label>
            <Textarea
              value={newReport.reason}
              onChange={(e) => setNewReport({ ...newReport, reason: e.target.value })}
            />
            <DialogFooter>
              <Button onClick={createReport}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{report.website}</span>
                {getStatusIcon(report.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Validator:</strong> {report.validator}</p>
              <p><strong>Reason:</strong> {report.reason}</p>
              <p><strong>Date:</strong> {report.date}</p>
            </CardContent>
            <div className="p-4">{getStatusBadge(report.status)}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
