import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import PlanCard from "../components/plans/PlanCard";

export default function PlansPage() {
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => base44.entities.ActionPlan.list('-created_date'),
    initialData: [],
  });

  const handleApprove = async (plan) => {
    setIsProcessing(true);
    try {
      const user = await base44.auth.me();
      
      // Update plan
      await base44.entities.ActionPlan.update(plan.id, {
        status: "APPROVED",
        approved_by: user.email,
        approved_at: new Date().toISOString()
      });

      // Create audit log
      await base44.entities.AuditLog.create({
        action: "PLAN_APPROVED",
        plan_id: plan.plan_id,
        performed_by: user.email,
        timestamp: new Date().toISOString(),
        details: {
          plan_objective: plan.objective
        }
      });

      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      toast.success("Plan approved successfully!");
    } catch (error) {
      console.error("Error approving plan:", error);
      toast.error("Failed to approve plan");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecute = async (plan) => {
    setIsProcessing(true);
    try {
      const user = await base44.auth.me();

      // Simulate execution (no real AWS calls)
      const executionDetails = {
        simulated: true,
        eventbridge_rule: {
          name: `finops-offhours-${plan.plan_id}`,
          schedule: "cron(0 19 ? * MON-FRI *)",
          targets: plan.top_opportunities?.map(opp => ({
            resource: opp.resource,
            action: opp.type.includes("OFFHOURS") ? "stop" : "modify",
            service: opp.service
          }))
        },
        resources_affected: plan.top_opportunities?.length || 0,
        execution_window: "19:00-07:00 UTC"
      };

      // Update plan
      await base44.entities.ActionPlan.update(plan.id, {
        status: "EXECUTED",
        executed_at: new Date().toISOString(),
        execution_details: executionDetails
      });

      // Create audit log
      await base44.entities.AuditLog.create({
        action: "PLAN_EXECUTED",
        plan_id: plan.plan_id,
        performed_by: user.email,
        timestamp: new Date().toISOString(),
        details: executionDetails
      });

      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      toast.success("Plan executed successfully (simulated)!");
    } catch (error) {
      console.error("Error executing plan:", error);
      toast.error("Failed to execute plan");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-48" />
          <div className="h-64 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Action Plans</h1>
        <Card className="p-12 text-center border-2 border-dashed border-slate-300">
          <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Plans Yet</h3>
          <p className="text-slate-500">
            Generate your first action plan from the Overview page to get started
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Action Plans</h1>
        <p className="text-slate-600">Review and approve cost optimization plans</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Plans List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="font-semibold text-slate-700 mb-3">All Plans ({plans.length})</h2>
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md border-2 ${
                selectedPlan?.id === plan.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
              }`}
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-slate-900 text-sm line-clamp-2">
                  {plan.objective}
                </h3>
                <Badge variant="outline" className="ml-2 text-xs whitespace-nowrap">
                  {plan.status}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                {format(new Date(plan.created_date), "MMM d, yyyy")}
              </div>
              <div className="mt-2 text-sm font-semibold text-green-700">
                ${plan.est_total_savings_usd_month.toFixed(2)}/mo
              </div>
            </Card>
          ))}
        </div>

        {/* Plan Details */}
        <div className="lg:col-span-2">
          {selectedPlan ? (
            <PlanCard
              plan={selectedPlan}
              onApprove={handleApprove}
              onExecute={handleExecute}
              isProcessing={isProcessing}
            />
          ) : (
            <Card className="p-12 text-center border-2 border-dashed border-slate-300">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500">Select a plan to view details</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}