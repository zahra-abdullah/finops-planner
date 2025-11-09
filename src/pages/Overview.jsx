
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, TrendingDown, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

import OpportunitiesTable from "../components/opportunities/OpportunitiesTable";
import OpportunityDetailsModal from "../components/opportunities/OpportunityDetailsModal";
import DataUploadModal from "../components/opportunities/DataUploadModal";
import { Upload } from "lucide-react";

export default function OverviewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [envFilter, setEnvFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => base44.entities.Opportunity.list('-est_savings_usd_month'),
    initialData: [],
  });

  const filteredOpportunities = opportunities.filter(opp => {
    if (envFilter !== "ALL" && opp.env !== envFilter) return false;
    if (riskFilter !== "ALL" && opp.risk !== riskFilter) return false;
    return true;
  });

  const totalSavings = filteredOpportunities.reduce((sum, opp) => sum + opp.est_savings_usd_month, 0);

  const generatePlan = async () => {
    if (filteredOpportunities.length === 0) {
      toast.error("No opportunities available to generate a plan");
      return;
    }

    setIsGenerating(true);
    try {
      const user = await base44.auth.me();
      
      // Take top 5 opportunities
      const topOpps = filteredOpportunities.slice(0, 5);
      
      // Build AI prompt
      const prompt = `You are "Agentic FinOps Planner." Convert cost/use insights into a safe, policy-aware Action Plan.

Rules:
- Never touch PROD. Scope ENV to [DEV, TEST].
- Max 5 resources per plan. Change window: 19:00–07:00.
- Include rollback steps for each proposed action.
- Prefer low-risk, high-savings actions: EC2 off-hours/rightsizing, EBS unused cleanup (snapshot+delete suggestion only), S3 lifecycle to IA, RDS off-hours.
- Return strict JSON exactly in the Action Plan schema. No extra prose.

Opportunities data:
${JSON.stringify(topOpps, null, 2)}

Generate an action plan with:
- objective: Brief summary of what this plan will accomplish
- top_opportunities: Array of the opportunities being addressed (max 5)
- recommended_steps: Array of strings describing each action step
- guardrails_checked: Array of guardrails validated (e.g., "ENV in [DEV, TEST]", "blast-radius<=5", "window=19:00-07:00", "no PROD")
- rollback_plan: Array of strings describing rollback steps
- est_total_savings_usd_month: Sum of all opportunity savings`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            objective: { type: "string" },
            top_opportunities: { 
              type: "array",
              items: { type: "object" }
            },
            recommended_steps: { 
              type: "array",
              items: { type: "string" }
            },
            guardrails_checked: { 
              type: "array",
              items: { type: "string" }
            },
            rollback_plan: { 
              type: "array",
              items: { type: "string" }
            },
            est_total_savings_usd_month: { type: "number" }
          },
          required: ["objective", "recommended_steps", "guardrails_checked", "rollback_plan"]
        }
      });

      // Create plan record
      const planId = `plan-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substr(2, 6)}`;
      const plan = await base44.entities.ActionPlan.create({
        plan_id: planId,
        objective: response.objective,
        env: envFilter !== "ALL" ? envFilter : "DEV",
        top_opportunities: response.top_opportunities || topOpps,
        recommended_steps: response.recommended_steps,
        guardrails_checked: response.guardrails_checked,
        rollback_plan: response.rollback_plan,
        est_total_savings_usd_month: response.est_total_savings_usd_month || totalSavings,
        status: "PLANNED"
      });

      // Create audit log
      await base44.entities.AuditLog.create({
        action: "PLAN_GENERATED",
        plan_id: planId,
        performed_by: user.email,
        timestamp: new Date().toISOString(),
        details: {
          opportunities_count: topOpps.length,
          env_filter: envFilter,
          risk_filter: riskFilter
        }
      });

      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success("Action plan generated successfully!");
      navigate(createPageUrl("Plans"));
    } catch (error) {
      console.error("Error generating plan:", error);
      toast.error("Failed to generate plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewDetails = (opp) => {
    setSelectedOpportunity(opp);
    setDetailsModalOpen(true);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Cost Optimization Opportunities</h1>
            <p className="text-slate-600">AI-powered insights to reduce your AWS spend safely</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setUploadModalOpen(true)}
            className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Total Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {filteredOpportunities.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {opportunities.length} total across all filters
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Potential Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              ${totalSavings.toFixed(2)}
            </div>
            <p className="text-xs text-slate-500 mt-1">per month</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              AI Planner Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={generatePlan}
              disabled={isGenerating || filteredOpportunities.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Plan
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Environment:</span>
              <Select value={envFilter} onValueChange={setEnvFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="DEV">DEV</SelectItem>
                  <SelectItem value="TEST">TEST</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Risk Level:</span>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities Table */}
      <OpportunitiesTable
        opportunities={filteredOpportunities}
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
      />

      {/* Modals */}
      <OpportunityDetailsModal
        opportunity={selectedOpportunity}
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />
      
      <DataUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['opportunities'] })}
      />
    </div>
  );
}
