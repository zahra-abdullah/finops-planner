
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap,
  Target,
  Rocket,
  TrendingUp,
  Shield,
  Bot,
  Brain,
  LineChart,
  CheckCircle,
  DollarSign,
  Clock,
  Activity,
  Search,
  Lightbulb,
  Eye,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Server,
  BarChart3,
  Users,
  Award,
  ArrowRight,
  LayoutDashboard,
  FileText,
  History
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const FeatureCard = ({ icon: Icon, title, description, color = "blue" }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  return (
    <Card className="border-slate-200 hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-6">
        <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses[color]} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="font-bold text-lg text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
};

const StatCard = ({ icon: Icon, value, label, color = "blue" }) => {
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
  };

  return (
    <div className="text-center p-6 bg-white rounded-xl border-2 border-slate-200 hover:shadow-lg transition-all">
      <Icon className={`w-8 h-8 ${colorClasses[color]} mx-auto mb-3`} />
      <div className="text-4xl font-bold text-slate-900 mb-1">{value}</div>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
};

const TimelineStep = ({ number, title, description, isLast }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
        {number}
      </div>
      {!isLast && <div className="w-1 flex-1 bg-gradient-to-b from-blue-500 to-indigo-600 my-2" />}
    </div>
    <div className="flex-1 pb-8">
      <h4 className="font-bold text-slate-900 mb-2">{title}</h4>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

export default function PresentationPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

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

  const totalSavings = opportunities.reduce((sum, o) => sum + o.est_savings_usd_month, 0);
  const avgConfidence = opportunities.length > 0
    ? opportunities.reduce((sum, o) => sum + (o.confidence_score || 0), 0) / opportunities.length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="text-center mb-12">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 px-4 py-2 text-sm">
              <Award className="w-4 h-4 mr-2 inline" />
              Hackathon Project 2025
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Agentic FinOps Planner
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              AI-Powered AWS Cost Optimization with Autonomous Agents, Deep Metrics Analysis, and Production-Safe Execution
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate(createPageUrl("Overview"))}
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl px-8 py-6 text-lg"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Try Live Demo
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setActiveTab("demo")}
                className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
              >
                <Eye className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
            <StatCard icon={DollarSign} value={`$${totalSavings.toFixed(0)}`} label="Monthly Savings" color="green" />
            <StatCard icon={Activity} value={opportunities.length} label="Opportunities Found" color="purple" />
            <StatCard icon={Bot} value="4" label="AI Agents" color="blue" />
            <StatCard icon={CheckCircle} value={`${avgConfidence.toFixed(0)}%`} label="Avg Confidence" color="orange" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-12 bg-white shadow-lg h-auto p-2">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3">
              Overview
            </TabsTrigger>
            <TabsTrigger value="problem" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3">
              Problem
            </TabsTrigger>
            <TabsTrigger value="solution" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3">
              Solution
            </TabsTrigger>
            <TabsTrigger value="architecture" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3">
              Architecture
            </TabsTrigger>
            <TabsTrigger value="demo" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3">
              Demo
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Transform Cloud Cost Management with AI
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                An intelligent platform that autonomously discovers, plans, and executes AWS cost optimizations while maintaining production safety and compliance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={Search}
                title="Autonomous Discovery"
                description="AI agents continuously scan AWS resources, analyzing 30+ days of metrics to identify optimization opportunities automatically."
                color="blue"
              />
              <FeatureCard
                icon={Brain}
                title="Smart Planning"
                description="Generates optimized action plans with ROI analysis, grouping related changes and ensuring safety guardrails."
                color="purple"
              />
              <FeatureCard
                icon={Shield}
                title="Production-Safe"
                description="All operations scoped to DEV/TEST only, with mandatory rollback plans and human approval workflows."
                color="green"
              />
              <FeatureCard
                icon={LineChart}
                title="Deep Metrics Analysis"
                description="CPU, memory, IOPS, network traffic with p95/p99 analysis and time-series visualization for data-driven decisions."
                color="orange"
              />
              <FeatureCard
                icon={MessageSquare}
                title="Conversational AI"
                description="Chat with your FinOps expert to understand opportunities, generate plans, and get AWS best practices."
                color="indigo"
              />
              <FeatureCard
                icon={Activity}
                title="Execution Monitoring"
                description="Tracks actual vs. estimated savings, validates results, and triggers automatic rollbacks if needed."
                color="blue"
              />
            </div>
          </TabsContent>

          {/* Problem Tab */}
          <TabsContent value="problem" className="space-y-8">
            <Card className="border-2 border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2 text-red-900">
                  <Target className="w-6 h-6" />
                  The Cloud Cost Crisis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-red-900 mb-3 text-lg">Key Challenges:</h3>
                    <ul className="space-y-3">
                      {[
                        "32% average cloud waste in enterprise organizations",
                        "Manual analysis takes 40+ hours per month",
                        "Risk of impacting production systems",
                        "Lack of data-driven insights for decisions",
                        "No automated discovery or execution",
                        "Poor visibility into actual resource utilization"
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-red-800">
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-red-900 mb-3 text-lg">Impact:</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-lg border border-red-200">
                        <div className="text-3xl font-bold text-red-700 mb-1">$1.2M+</div>
                        <p className="text-sm text-red-800">Average annual waste per company</p>
                      </div>
                      <div className="p-4 bg-white rounded-lg border border-red-200">
                        <div className="text-3xl font-bold text-red-700 mb-1">160hrs</div>
                        <p className="text-sm text-red-800">Engineering time per month on manual analysis</p>
                      </div>
                      <div className="p-4 bg-white rounded-lg border border-red-200">
                        <div className="text-3xl font-bold text-red-700 mb-1">70%</div>
                        <p className="text-sm text-red-800">Of optimizations never executed due to risk</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Solution Tab */}
          <TabsContent value="solution" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Our Multi-Agent AI Solution
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Four specialized AI agents working together to automate the entire cost optimization lifecycle
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-lg">Opportunity Discoverer</div>
                      <div className="text-sm font-normal text-slate-600">Autonomous Agent</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                      <span>Analyzes 30+ days of resource metrics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                      <span>Identifies EC2 rightsizing, off-hours scheduling, EBS cleanup</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                      <span>Calculates confidence scores (75-95%)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                      <span>Creates detailed recommendations with reasoning</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-lg">Plan Optimizer</div>
                      <div className="text-sm font-normal text-slate-600">Autonomous Agent</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                      <span>Groups related optimizations by ROI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                      <span>Generates execution strategies (max 5 resources)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                      <span>Enforces safety guardrails (no PROD, off-hours window)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                      <span>Creates detailed rollback procedures</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-lg">Execution Monitor</div>
                      <div className="text-sm font-normal text-slate-600">Autonomous Agent</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Validates guardrails before execution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Monitors resource health post-execution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Tracks actual vs. estimated savings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Triggers automatic rollback if anomalies detected</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-lg">FinOps Assistant</div>
                      <div className="text-sm font-normal text-slate-600">Interactive Agent</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5" />
                      <span>Natural language Q&A about opportunities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5" />
                      <span>Explains complex metrics and recommendations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5" />
                      <span>Generates custom plans on-demand</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5" />
                      <span>Provides AWS best practices guidance</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Workflow */}
            <Card className="border-2 border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl">Automated Workflow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-2xl mx-auto">
                  <TimelineStep
                    number="1"
                    title="Discovery (02:00 UTC Daily)"
                    description="Opportunity Discoverer scans all DEV/TEST resources, analyzes metrics, and creates optimization opportunities with confidence scores."
                  />
                  <TimelineStep
                    number="2"
                    title="Planning (03:00 UTC Daily)"
                    description="Plan Optimizer analyzes opportunities by ROI, groups related changes, and generates action plans with guardrails and rollback procedures."
                  />
                  <TimelineStep
                    number="3"
                    title="Human Approval (Business Hours)"
                    description="Engineering team reviews plan details, metrics, and recommendations before approving execution."
                  />
                  <TimelineStep
                    number="4"
                    title="Execution (19:00-07:00 Off-Hours)"
                    description="System executes approved changes during maintenance window. All operations are simulated in this MVP (no actual AWS modifications)."
                  />
                  <TimelineStep
                    number="5"
                    title="Monitoring (Continuous)"
                    description="Execution Monitor tracks results, validates savings, detects anomalies, and triggers rollback if needed."
                    isLast
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Architecture Tab */}
          <TabsContent value="architecture" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Technical Architecture
              </h2>
              <p className="text-lg text-slate-600">
                Built on modern, scalable technologies for production deployment
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="border-2 border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-600" />
                    Tech Stack
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Frontend</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">React</Badge>
                      <Badge variant="outline">TypeScript</Badge>
                      <Badge variant="outline">Tailwind CSS</Badge>
                      <Badge variant="outline">shadcn/ui</Badge>
                      <Badge variant="outline">Recharts</Badge>
                      <Badge variant="outline">React Query</Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Backend & AI</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Base44 Platform</Badge>
                      <Badge variant="outline">OpenAI GPT-4</Badge>
                      <Badge variant="outline">LangFlow</Badge>
                      <Badge variant="outline">AI Agents SDK</Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Data & Storage</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">JSON Schema Entities</Badge>
                      <Badge variant="outline">Time-Series Metrics</Badge>
                      <Badge variant="outline">Audit Logs</Badge>
                      <Badge variant="outline">Real-time Sync</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Deep Metrics Analysis</h4>
                        <p className="text-xs text-slate-600">CPU/Memory with p95/p99, IOPS, throughput, network traffic, idle periods</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <LineChart className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Time-Series Visualization</h4>
                        <p className="text-xs text-slate-600">Interactive charts showing utilization trends over 30-day periods</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Safety Guardrails</h4>
                        <p className="text-xs text-slate-600">Environment validation, resource limits, off-hours windows, rollback automation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Activity className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Real-time Collaboration</h4>
                        <p className="text-xs text-slate-600">Multi-agent coordination, live chat, instant notifications</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">File Upload & AI Extraction</h4>
                        <p className="text-xs text-slate-600">Upload CSV/JSON/Excel, AI extracts and creates opportunities automatically</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-xl text-blue-900">Innovation Highlights</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">🤖 Multi-Agent System</h4>
                  <p className="text-sm text-blue-800">
                    Four specialized AI agents working autonomously with coordination and learning capabilities
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">📊 Data-Driven Insights</h4>
                  <p className="text-sm text-blue-800">
                    p95/p99 percentile analysis, confidence scoring, ROI calculations, trend detection
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">🛡️ Production Safety</h4>
                  <p className="text-sm text-blue-800">
                    Multi-layer guardrails, automatic rollback, comprehensive audit trails, human approval gates
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Demo Tab */}
          <TabsContent value="demo" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                See It In Action
              </h2>
              <p className="text-lg text-slate-600">
                Explore the live application or watch feature demonstrations
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-2 border-blue-200 hover:shadow-xl transition-all cursor-pointer group"
                    onClick={() => navigate(createPageUrl("Overview"))}>
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <LayoutDashboard className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Opportunities Dashboard</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    View all discovered opportunities with filters, metrics preview, and savings potential
                  </p>
                  <div className="flex items-center text-blue-600 font-medium text-sm">
                    Try it now <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 hover:shadow-xl transition-all cursor-pointer group"
                    onClick={() => navigate(createPageUrl("Plans"))}>
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Action Plans</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Review AI-generated plans with detailed steps, guardrails, and rollback procedures
                  </p>
                  <div className="flex items-center text-purple-600 font-medium text-sm">
                    View plans <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-indigo-200 hover:shadow-xl transition-all cursor-pointer group"
                    onClick={() => navigate(createPageUrl("Assistant"))}>
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">AI Assistant</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Chat with the FinOps expert to understand opportunities and generate custom plans
                  </p>
                  <div className="flex items-center text-indigo-600 font-medium text-sm">
                    Start chatting <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 hover:shadow-xl transition-all cursor-pointer group"
                    onClick={() => navigate(createPageUrl("AgentOrchestrator"))}>
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">AI Agents</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Manage autonomous agents, view their activity, and trigger on-demand execution
                  </p>
                  <div className="flex items-center text-green-600 font-medium text-sm">
                    Manage agents <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-200 hover:shadow-xl transition-all cursor-pointer group"
                    onClick={() => navigate(createPageUrl("Overview"))}>
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Detailed Metrics</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Click "Details" on any opportunity to see charts, idle periods, and AI recommendations
                  </p>
                  <div className="flex items-center text-orange-600 font-medium text-sm">
                    View metrics <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-slate-200 hover:shadow-xl transition-all cursor-pointer group"
                    onClick={() => navigate(createPageUrl("AuditLog"))}>
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <History className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Audit Trail</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Complete history of all actions, approvals, and executions for compliance
                  </p>
                  <div className="flex items-center text-slate-600 font-medium text-sm">
                    View audit log <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Stats */}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="text-2xl text-green-900 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  Live System Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-700 mb-1">{opportunities.length}</div>
                    <p className="text-sm text-green-800">Opportunities Discovered</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-700 mb-1">${totalSavings.toFixed(0)}</div>
                    <p className="text-sm text-green-800">Potential Monthly Savings</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-700 mb-1">{plans.length}</div>
                    <p className="text-sm text-green-800">Action Plans Generated</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-700 mb-1">{avgConfidence.toFixed(0)}%</div>
                    <p className="text-sm text-green-800">Average Confidence Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Cloud Costs?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start discovering opportunities and generating AI-powered action plans in minutes
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate(createPageUrl("Overview"))}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Launch Demo
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate(createPageUrl("Assistant"))}
              className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Chat with AI
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
