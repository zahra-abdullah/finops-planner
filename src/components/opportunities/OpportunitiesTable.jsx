import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Server, HardDrive, Database, Box, Eye, TrendingUp, Activity } from "lucide-react";

const serviceIcons = {
  EC2: Server,
  EBS: HardDrive,
  RDS: Database,
  S3: Box,
};

const typeLabels = {
  EC2_RIGHTSIZE: "Rightsize Instance",
  EC2_OFFHOURS: "Off-Hours Schedule",
  EBS_UNUSED: "Unused Volume",
  S3_LIFECYCLE: "Lifecycle Policy",
  RDS_OFFHOURS: "Off-Hours Schedule",
};

const riskColors = {
  LOW: "bg-green-100 text-green-800 border-green-200",
  MEDIUM: "bg-amber-100 text-amber-800 border-amber-200",
};

const envColors = {
  DEV: "bg-blue-100 text-blue-800 border-blue-200",
  TEST: "bg-purple-100 text-purple-800 border-purple-200",
};

export default function OpportunitiesTable({ opportunities, isLoading, onSelect, onViewDetails }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-200">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
        <Server className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600 font-medium mb-1">No opportunities found</p>
        <p className="text-sm text-slate-500">Try adjusting your filters or add seed data</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="font-semibold text-slate-700">Service</TableHead>
            <TableHead className="font-semibold text-slate-700">Type</TableHead>
            <TableHead className="font-semibold text-slate-700">Resource</TableHead>
            <TableHead className="font-semibold text-slate-700">Key Metrics</TableHead>
            <TableHead className="font-semibold text-slate-700">Environment</TableHead>
            <TableHead className="font-semibold text-slate-700">Risk</TableHead>
            <TableHead className="font-semibold text-slate-700 text-right">Est. Savings/mo</TableHead>
            <TableHead className="font-semibold text-slate-700 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {opportunities.map((opp) => {
            const ServiceIcon = serviceIcons[opp.service] || Server;
            const metrics = opp.metrics || {};
            
            return (
              <TableRow
                key={opp.id}
                className="cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => onSelect?.(opp)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <ServiceIcon className="w-4 h-4 text-slate-600" />
                    </div>
                    <span className="font-medium text-slate-900">{opp.service}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-600">{typeLabels[opp.type] || opp.type}</span>
                </TableCell>
                <TableCell>
                  <div>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 font-mono block mb-1">
                      {opp.resource}
                    </code>
                    {opp.application && (
                      <span className="text-xs text-slate-500">{opp.application}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {metrics.cpu_utilization && (
                      <div className="flex items-center gap-1 text-xs">
                        <Activity className="w-3 h-3 text-blue-500" />
                        <span className="text-slate-600">CPU: {metrics.cpu_utilization.average?.toFixed(1)}%</span>
                      </div>
                    )}
                    {metrics.ebs_metrics?.iops && (
                      <div className="flex items-center gap-1 text-xs">
                        <HardDrive className="w-3 h-3 text-purple-500" />
                        <span className="text-slate-600">IOPS: {metrics.ebs_metrics.iops.total_avg?.toFixed(0)}</span>
                      </div>
                    )}
                    {opp.confidence_score && (
                      <div className="flex items-center gap-1 text-xs">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-slate-600">Confidence: {opp.confidence_score}%</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={envColors[opp.env]}>
                    {opp.env}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={riskColors[opp.risk]}>
                    {opp.risk}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 font-semibold text-green-700">
                    <DollarSign className="w-4 h-4" />
                    {opp.est_savings_usd_month.toFixed(2)}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails?.(opp);
                    }}
                    className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}