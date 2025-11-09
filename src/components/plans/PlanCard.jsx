import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, AlertTriangle, DollarSign, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  PLANNED: "bg-blue-100 text-blue-800 border-blue-200",
  APPROVED: "bg-green-100 text-green-800 border-green-200",
  EXECUTED: "bg-purple-100 text-purple-800 border-purple-200",
  ROLLED_BACK: "bg-red-100 text-red-800 border-red-200",
};

export default function PlanCard({ plan, onApprove, onExecute, isProcessing }) {
  return (
    <Card className="shadow-lg border-slate-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 mb-2">
              {plan.objective}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              <span>Created {format(new Date(plan.created_date), "MMM d, yyyy 'at' h:mm a")}</span>
            </div>
          </div>
          <Badge variant="outline" className={statusColors[plan.status]}>
            {plan.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Savings Summary */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-800">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">Estimated Monthly Savings</span>
            </div>
            <div className="text-2xl font-bold text-green-700 flex items-center gap-1">
              <DollarSign className="w-6 h-6" />
              {plan.est_total_savings_usd_month.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Top Opportunities */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Top Opportunities ({plan.top_opportunities?.length || 0})
          </h3>
          <div className="space-y-2">
            {plan.top_opportunities?.map((opp, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {opp.service}
                    </Badge>
                    <span className="text-sm font-medium text-slate-700">{opp.type?.replace(/_/g, ' ')}</span>
                  </div>
                  <code className="text-xs text-slate-600 font-mono">{opp.resource}</code>
                </div>
                <div className="text-sm font-semibold text-green-700">
                  ${opp.est_savings_usd_month?.toFixed(2)}/mo
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Steps */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            Recommended Steps
          </h3>
          <ol className="space-y-2">
            {plan.recommended_steps?.map((step, idx) => (
              <li key={idx} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-xs">
                  {idx + 1}
                </span>
                <span className="text-slate-700 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Guardrails */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" />
            Safety Guardrails
          </h3>
          <div className="flex flex-wrap gap-2">
            {plan.guardrails_checked?.map((guardrail, idx) => (
              <Badge key={idx} variant="outline" className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                {guardrail}
              </Badge>
            ))}
          </div>
        </div>

        {/* Rollback Plan */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            Rollback Plan
          </h3>
          <ol className="space-y-2">
            {plan.rollback_plan?.map((step, idx) => (
              <li key={idx} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-semibold text-xs">
                  {idx + 1}
                </span>
                <span className="text-slate-700 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Approval/Execution Info */}
        {plan.approved_by && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Approved by:</strong> {plan.approved_by}
            </p>
            {plan.approved_at && (
              <p className="text-xs text-blue-600 mt-1">
                {format(new Date(plan.approved_at), "MMM d, yyyy 'at' h:mm a")}
              </p>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-slate-50 border-t border-slate-200 p-4 flex gap-3">
        {plan.status === "PLANNED" && (
          <Button
            onClick={() => onApprove?.(plan)}
            disabled={isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve Plan
          </Button>
        )}
        {plan.status === "APPROVED" && plan.env !== "PROD" && (
          <Button
            onClick={() => onExecute?.(plan)}
            disabled={isProcessing}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          >
            <Clock className="w-4 h-4 mr-2" />
            Execute (Simulate)
          </Button>
        )}
        {plan.status === "EXECUTED" && (
          <div className="flex-1 text-center py-2 text-sm text-purple-700 font-medium">
            Plan executed successfully
          </div>
        )}
      </CardFooter>
    </Card>
  );
}