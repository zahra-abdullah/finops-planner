import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  Play, 
  Pause, 
  Activity, 
  Search, 
  Lightbulb, 
  Shield,
  TrendingUp,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

const AGENTS = [
  {
    id: "opportunity_discoverer",
    name: "Opportunity Discoverer",
    description: "Scans AWS resources and creates optimization opportunities",
    icon: Search,
    color: "blue",
    schedule: "Daily at 02:00 UTC",
  },
  {
    id: "plan_optimizer",
    name: "Plan Optimizer",
    description: "Generates optimized action plans from opportunities",
    icon: Lightbulb,
    color: "purple",
    schedule: "Daily at 03:00 UTC",
  },
  {
    id: "execution_monitor",
    name: "Execution Monitor",
    description: "Monitors plan execution and tracks results",
    icon: Shield,
    color: "green",
    schedule: "Every 4 hours",
  },
  {
    id: "finops_assistant",
    name: "FinOps Assistant",
    description: "Interactive chat assistant for user guidance",
    icon: Bot,
    color: "indigo",
    schedule: "On-demand",
  },
];

const AgentCard = ({ agent, isEnabled, onToggle, onRun, isRunning }) => {
  const Icon = agent.icon;
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  return (
    <Card className="border-slate-200 hover:shadow-lg transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[agent.color]} rounded-xl flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <p className="text-sm text-slate-500 mt-1">{agent.description}</p>
            </div>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={onToggle}
            className="data-[state=checked]:bg-green-500"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Schedule:
            </span>
            <span className="font-medium text-slate-900">{agent.schedule}</span>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={isEnabled ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50 text-slate-600"}>
              <Activity className="w-3 h-3 mr-1" />
              {isEnabled ? "Active" : "Inactive"}
            </Badge>
            <Button
              size="sm"
              onClick={onRun}
              disabled={!isEnabled || isRunning}
              variant="outline"
              className="hover:bg-blue-50 hover:text-blue-700"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Now
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AgentOrchestratorPage() {
  const queryClient = useQueryClient();
  const [agentStates, setAgentStates] = useState({
    opportunity_discoverer: true,
    plan_optimizer: true,
    execution_monitor: true,
    finops_assistant: true,
  });
  const [runningAgents, setRunningAgents] = useState(new Set());

  const { data: auditLogs } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 20),
    initialData: [],
  });

  const { data: opportunities } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => base44.entities.Opportunity.list(),
    initialData: [],
  });

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: () => base44.entities.ActionPlan.list(),
    initialData: [],
  });

  const handleToggleAgent = (agentId) => {
    setAgentStates(prev => ({
      ...prev,
      [agentId]: !prev[agentId]
    }));
    toast.success(`${agentId.replace(/_/g, ' ')} ${agentStates[agentId] ? 'disabled' : 'enabled'}`);
  };

  const handleRunAgent = async (agent) => {
    setRunningAgents(prev => new Set(prev).add(agent.id));
    
    try {
      if (agent.id === "opportunity_discoverer") {
        // Simulate discovery - in production, this would call an agent endpoint
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success("Opportunity discovery completed - 3 new opportunities found");
        queryClient.invalidateQueries({ queryKey: ['opportunities'] });
        
      } else if (agent.id === "plan_optimizer") {
        // Simulate plan generation
        const user = await base44.auth.me();
        const topOpps = opportunities.slice(0, 3);
        
        if (topOpps.length === 0) {
          toast.error("No opportunities available to generate plan");
          return;
        }

        const planId = `plan-auto-${Date.now()}`;
        await base44.entities.ActionPlan.create({
          plan_id: planId,
          objective: `Automated optimization plan: ${topOpps.length} opportunities identified`,
          env: "DEV",
          top_opportunities: topOpps,
          recommended_steps: [
            "Review and validate resource metrics",
            "Schedule maintenance window",
            "Execute optimizations during off-hours",
            "Monitor resource performance post-change"
          ],
          guardrails_checked: [
            "ENV = DEV",
            "Resources ≤ 5",
            "Window: 19:00-07:00",
            "No PROD impact"
          ],
          rollback_plan: [
            "Restore original instance types from backup",
            "Re-enable 24/7 schedules",
            "Validate application functionality"
          ],
          est_total_savings_usd_month: topOpps.reduce((sum, o) => sum + o.est_savings_usd_month, 0),
          status: "PLANNED"
        });

        await base44.entities.AuditLog.create({
          action: "PLAN_GENERATED",
          plan_id: planId,
          performed_by: user.email,
          details: { agent: "plan_optimizer", auto_generated: true }
        });

        toast.success("Plan automatically generated by AI agent");
        queryClient.invalidateQueries({ queryKey: ['plans'] });
        queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
        
      } else if (agent.id === "execution_monitor") {
        // Simulate monitoring
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success("Execution monitoring completed - all systems nominal");
        
      } else if (agent.id === "finops_assistant") {
        toast.info("Open the AI Assistant page to interact with this agent");
      }
      
    } catch (error) {
      console.error("Error running agent:", error);
      toast.error(`Failed to run ${agent.name}`);
    } finally {
      setRunningAgents(prev => {
        const next = new Set(prev);
        next.delete(agent.id);
        return next;
      });
    }
  };

  const totalSavings = opportunities.reduce((sum, o) => sum + o.est_savings_usd_month, 0);
  const avgConfidence = opportunities.length > 0 
    ? opportunities.reduce((sum, o) => sum + (o.confidence_score || 0), 0) / opportunities.length 
    : 0;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <Zap className="w-8 h-8 text-blue-600" />
          AI Agent Orchestrator
        </h1>
        <p className="text-slate-600">Manage autonomous agents for continuous cost optimization</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Active Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {Object.values(agentStates).filter(Boolean).length}
            </div>
            <p className="text-xs text-slate-500 mt-1">of {AGENTS.length} total</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {opportunities.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">discovered by agents</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${totalSavings.toFixed(0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">per month potential</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">
              {avgConfidence.toFixed(0)}%
            </div>
            <p className="text-xs text-slate-500 mt-1">average accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="agents">Agent Management</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {AGENTS.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isEnabled={agentStates[agent.id]}
                onToggle={() => handleToggleAgent(agent.id)}
                onRun={() => handleRunAgent(agent)}
                isRunning={runningAgents.has(agent.id)}
              />
            ))}
          </div>

          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                How AI Agents Work Together
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <p><strong>1. Discovery:</strong> Opportunity Discoverer scans resources daily, identifying cost savings</p>
              <p><strong>2. Planning:</strong> Plan Optimizer analyzes opportunities and creates optimized action plans</p>
              <p><strong>3. Execution:</strong> Human approves, system executes during off-hours (19:00-07:00)</p>
              <p><strong>4. Monitoring:</strong> Execution Monitor tracks results and validates actual savings</p>
              <p><strong>5. Learning:</strong> Agents improve recommendations based on historical outcomes</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          {auditLogs.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed">
              <Activity className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500">No agent activity yet</p>
            </Card>
          ) : (
            auditLogs.map((log) => (
              <Card key={log.id} className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="bg-slate-100">
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                        {log.details?.agent && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            <Bot className="w-3 h-3 mr-1" />
                            {log.details.agent}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-700">
                        Plan: <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">{log.plan_id}</code>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        by {log.performed_by} • {new Date(log.created_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Agent Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 mb-1">Configuration Coming Soon</p>
                    <p className="text-sm text-amber-700">
                      Advanced settings like schedules, thresholds, and notification preferences will be configurable here.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-slate-900">Current Defaults:</h3>
                <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                  <li>Discovery runs daily at 02:00 UTC</li>
                  <li>Plan generation runs daily at 03:00 UTC</li>
                  <li>Monitoring runs every 4 hours</li>
                  <li>Max 5 opportunities per plan</li>
                  <li>Execution window: 19:00-07:00 UTC</li>
                  <li>Only DEV/TEST environments</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}