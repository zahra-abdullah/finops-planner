import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, CheckCircle, FileText, Play, RotateCcw } from "lucide-react";
import { format } from "date-fns";

const actionIcons = {
  PLAN_GENERATED: FileText,
  PLAN_APPROVED: CheckCircle,
  PLAN_EXECUTED: Play,
  PLAN_ROLLED_BACK: RotateCcw,
};

const actionColors = {
  PLAN_GENERATED: "bg-blue-100 text-blue-800 border-blue-200",
  PLAN_APPROVED: "bg-green-100 text-green-800 border-green-200",
  PLAN_EXECUTED: "bg-purple-100 text-purple-800 border-purple-200",
  PLAN_ROLLED_BACK: "bg-red-100 text-red-800 border-red-200",
};

export default function AuditLogPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date'),
    initialData: [],
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <History className="w-8 h-8 text-blue-600" />
          Audit Log
        </h1>
        <p className="text-slate-600">Complete history of all actions and approvals</p>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 rounded" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed border-slate-300">
          <History className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Audit Logs</h3>
          <p className="text-slate-500">Activity will appear here once plans are created and actions are taken</p>
        </Card>
      ) : (
        <Card className="shadow-sm border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="font-semibold text-slate-700">Action</TableHead>
                <TableHead className="font-semibold text-slate-700">Plan ID</TableHead>
                <TableHead className="font-semibold text-slate-700">Performed By</TableHead>
                <TableHead className="font-semibold text-slate-700">Timestamp</TableHead>
                <TableHead className="font-semibold text-slate-700">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const ActionIcon = actionIcons[log.action] || History;
                return (
                  <TableRow key={log.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                          <ActionIcon className="w-4 h-4 text-slate-600" />
                        </div>
                        <Badge variant="outline" className={actionColors[log.action]}>
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-700">
                        {log.plan_id}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-700">{log.performed_by}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {format(new Date(log.created_date), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </TableCell>
                    <TableCell>
                      {log.details && (
                        <div className="text-xs text-slate-500">
                          {Object.entries(log.details).slice(0, 2).map(([key, value]) => (
                            <div key={key}>
                              <strong>{key}:</strong> {String(value)}
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}