import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingDown, Activity, HardDrive, Network, Clock, AlertCircle, CheckCircle, Lightbulb } from "lucide-react";
import { format } from "date-fns";

const MetricCard = ({ title, value, unit, icon: Icon, color = "blue" }) => (
  <Card className="border-slate-200">
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-1">{title}</p>
          <p className={`text-2xl font-bold text-${color}-700`}>
            {value}{unit && <span className="text-sm ml-1">{unit}</span>}
          </p>
        </div>
        {Icon && (
          <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
            <Icon className={`w-5 h-5 text-${color}-600`} />
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const IdlePeriodsList = ({ idlePeriods }) => {
  if (!idlePeriods || idlePeriods.length === 0) {
    return <p className="text-sm text-slate-500">No significant idle periods detected</p>;
  }

  const totalIdleHours = idlePeriods.reduce((sum, p) => sum + p.duration_hours, 0);

  return (
    <div>
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm font-medium text-amber-900">
          Total Idle Time: <strong>{totalIdleHours.toFixed(1)} hours</strong>
        </p>
        <p className="text-xs text-amber-700 mt-1">
          Resource was underutilized during these periods
        </p>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {idlePeriods.map((period, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {format(new Date(period.start), "MMM d, h:mm a")} → {format(new Date(period.end), "h:mm a")}
                </p>
                <p className="text-xs text-slate-500">{period.duration_hours.toFixed(1)} hours</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AttachmentHistory = ({ history }) => {
  if (!history || history.length === 0) {
    return <p className="text-sm text-slate-500">No attachment history available</p>;
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {history.map((attachment, idx) => (
        <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <code className="text-xs bg-white px-2 py-1 rounded border border-slate-300 font-mono text-slate-700">
              {attachment.instance_id}
            </code>
            {!attachment.detached_at && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Currently Detached
              </Badge>
            )}
          </div>
          <div className="text-xs text-slate-600">
            <p>Attached: {format(new Date(attachment.attached_at), "MMM d, yyyy h:mm a")}</p>
            {attachment.detached_at && (
              <p>Detached: {format(new Date(attachment.detached_at), "MMM d, yyyy h:mm a")}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function OpportunityDetailsModal({ opportunity, open, onClose }) {
  if (!opportunity) return null;

  const metrics = opportunity.metrics || {};
  const cpuData = metrics.cpu_utilization?.time_series || [];
  const memoryData = metrics.memory_utilization?.time_series || [];
  const ebsMetrics = metrics.ebs_metrics || {};

  const combinedUtilization = cpuData.map((cpu, idx) => ({
    timestamp: format(new Date(cpu.timestamp), "MMM d HH:mm"),
    cpu: cpu.value,
    memory: memoryData[idx]?.value || 0,
  }));

  const confidenceColor = (opportunity.confidence_score || 0) >= 80 ? "green" : 
                         (opportunity.confidence_score || 0) >= 60 ? "amber" : "red";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900 mb-2">
                {opportunity.application || opportunity.resource}
              </DialogTitle>
              <DialogDescription>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                    {opportunity.service}
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
                    {opportunity.type.replace(/_/g, ' ')}
                  </Badge>
                  <Badge variant="outline" className="bg-slate-50 text-slate-800 border-slate-200">
                    {opportunity.env}
                  </Badge>
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                    {opportunity.resource}
                  </code>
                </div>
              </DialogDescription>
            </div>
            {opportunity.confidence_score && (
              <div className={`text-center px-4 py-2 bg-${confidenceColor}-50 border border-${confidenceColor}-200 rounded-lg`}>
                <p className="text-xs text-slate-600 mb-1">Confidence</p>
                <p className={`text-2xl font-bold text-${confidenceColor}-700`}>
                  {opportunity.confidence_score}%
                </p>
              </div>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="recommendation">Recommendation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Monthly Savings"
                value={`$${opportunity.est_savings_usd_month.toFixed(2)}`}
                icon={TrendingDown}
                color="green"
              />
              <MetricCard
                title="Risk Level"
                value={opportunity.risk}
                icon={opportunity.risk === "LOW" ? CheckCircle : AlertCircle}
                color={opportunity.risk === "LOW" ? "green" : "amber"}
              />
              {metrics.analysis_period_days && (
                <MetricCard
                  title="Analysis Period"
                  value={metrics.analysis_period_days}
                  unit="days"
                  icon={Clock}
                  color="blue"
                />
              )}
              {metrics.cost_breakdown?.total_current_monthly && (
                <MetricCard
                  title="Current Cost"
                  value={`$${metrics.cost_breakdown.total_current_monthly.toFixed(2)}`}
                  unit="/mo"
                  icon={Activity}
                  color="slate"
                />
              )}
            </div>

            {/* Resource Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resource Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Application</p>
                    <p className="text-sm font-medium text-slate-900">{opportunity.application}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Owner</p>
                    <p className="text-sm font-medium text-slate-900">{opportunity.owner}</p>
                  </div>
                </div>
                {opportunity.details && Object.keys(opportunity.details).length > 0 && (
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">Additional Details</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(opportunity.details).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-slate-600">{key.replace(/_/g, ' ')}:</span>{' '}
                          <span className="font-medium text-slate-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            {metrics.cost_breakdown && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.cost_breakdown.compute_cost > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Compute</span>
                        <span className="text-sm font-semibold">${metrics.cost_breakdown.compute_cost.toFixed(2)}/mo</span>
                      </div>
                    )}
                    {metrics.cost_breakdown.storage_cost > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Storage</span>
                        <span className="text-sm font-semibold">${metrics.cost_breakdown.storage_cost.toFixed(2)}/mo</span>
                      </div>
                    )}
                    {metrics.cost_breakdown.network_cost > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Network</span>
                        <span className="text-sm font-semibold">${metrics.cost_breakdown.network_cost.toFixed(2)}/mo</span>
                      </div>
                    )}
                    <div className="pt-3 border-t-2 border-slate-300 flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-900">Current Total</span>
                      <span className="text-lg font-bold text-slate-900">
                        ${metrics.cost_breakdown.total_current_monthly.toFixed(2)}/mo
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg border border-green-200">
                      <span className="text-sm font-semibold text-green-900">After Optimization</span>
                      <span className="text-lg font-bold text-green-700">
                        ${metrics.cost_breakdown.total_optimized_monthly.toFixed(2)}/mo
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6 mt-6">
            {/* CPU & Memory Utilization Chart */}
            {combinedUtilization.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resource Utilization Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={combinedUtilization}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="timestamp" 
                        tick={{ fontSize: 12 }}
                        stroke="#64748b"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke="#64748b"
                        label={{ value: 'Utilization %', angle: -90, position: 'insideLeft', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="cpu" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3}
                        name="CPU %"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="memory" 
                        stroke="#8b5cf6" 
                        fill="#8b5cf6" 
                        fillOpacity={0.3}
                        name="Memory %"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {metrics.cpu_utilization && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-600 mb-2 font-medium">CPU Statistics</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-blue-800">Average:</span>
                            <strong>{metrics.cpu_utilization.average?.toFixed(1)}%</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-800">P95:</span>
                            <strong>{metrics.cpu_utilization.p95?.toFixed(1)}%</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-800">P99:</span>
                            <strong>{metrics.cpu_utilization.p99?.toFixed(1)}%</strong>
                          </div>
                        </div>
                      </div>
                    )}
                    {metrics.memory_utilization && (
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-xs text-purple-600 mb-2 font-medium">Memory Statistics</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-purple-800">Average:</span>
                            <strong>{metrics.memory_utilization.average?.toFixed(1)}%</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-800">P95:</span>
                            <strong>{metrics.memory_utilization.p95?.toFixed(1)}%</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-800">P99:</span>
                            <strong>{metrics.memory_utilization.p99?.toFixed(1)}%</strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Network Traffic */}
            {metrics.network_traffic && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Network className="w-5 h-5" />
                    Network Traffic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-600 mb-2">Inbound</p>
                      <p className="text-lg font-bold text-slate-900">
                        {metrics.network_traffic.average_in_mbps?.toFixed(2)} Mbps
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Peak: {metrics.network_traffic.peak_in_mbps?.toFixed(2)} Mbps
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-600 mb-2">Outbound</p>
                      <p className="text-lg font-bold text-slate-900">
                        {metrics.network_traffic.average_out_mbps?.toFixed(2)} Mbps
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Peak: {metrics.network_traffic.peak_out_mbps?.toFixed(2)} Mbps
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* EBS Metrics */}
            {ebsMetrics.iops && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HardDrive className="w-5 h-5" />
                    EBS Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-3">IOPS</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                        <p className="text-xs text-green-600 mb-1">Read</p>
                        <p className="text-lg font-bold text-green-900">{ebsMetrics.iops.read_avg?.toFixed(0)}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
                        <p className="text-xs text-blue-600 mb-1">Write</p>
                        <p className="text-lg font-bold text-blue-900">{ebsMetrics.iops.write_avg?.toFixed(0)}</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
                        <p className="text-xs text-purple-600 mb-1">Total</p>
                        <p className="text-lg font-bold text-purple-900">{ebsMetrics.iops.total_avg?.toFixed(0)}</p>
                      </div>
                    </div>
                  </div>
                  {ebsMetrics.throughput && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-3">Throughput</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <p className="text-xs text-slate-600 mb-1">Read</p>
                          <p className="text-lg font-bold text-slate-900">
                            {ebsMetrics.throughput.read_mbps?.toFixed(2)} MB/s
                          </p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <p className="text-xs text-slate-600 mb-1">Write</p>
                          <p className="text-lg font-bold text-slate-900">
                            {ebsMetrics.throughput.write_mbps?.toFixed(2)} MB/s
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {ebsMetrics.last_io_timestamp && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs text-amber-600 mb-1">Last I/O Activity</p>
                      <p className="text-sm font-medium text-amber-900">
                        {format(new Date(ebsMetrics.last_io_timestamp), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6 mt-6">
            {/* Idle Periods */}
            {metrics.idle_periods && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Idle Periods Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <IdlePeriodsList idlePeriods={metrics.idle_periods} />
                </CardContent>
              </Card>
            )}

            {/* Attachment History (for EBS) */}
            {ebsMetrics.attachment_history && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Attachment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <AttachmentHistory history={ebsMetrics.attachment_history} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recommendation" className="space-y-6 mt-6">
            {opportunity.recommendation_details && (
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                    <Lightbulb className="w-5 h-5" />
                    AI-Generated Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-2">Recommended Action</p>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {opportunity.recommendation_details.action}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-2">Reasoning</p>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {opportunity.recommendation_details.reasoning}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-2">Impact Analysis</p>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {opportunity.recommendation_details.impact_analysis}
                    </p>
                  </div>
                  {opportunity.recommendation_details.alternative_options && (
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-2">Alternative Options</p>
                      <ul className="space-y-1">
                        {opportunity.recommendation_details.alternative_options.map((option, idx) => (
                          <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>{option}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}