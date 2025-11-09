import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function DataUploadModal({ open, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Extract data using AI
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: await base44.entities.Opportunity.schema()
      });

      if (result.status === "success" && result.output) {
        const opportunities = Array.isArray(result.output) ? result.output : [result.output];
        
        // Create opportunity records
        for (const opp of opportunities) {
          await base44.entities.Opportunity.create(opp);
        }

        const user = await base44.auth.me();
        await base44.entities.AuditLog.create({
          action: "PLAN_GENERATED",
          plan_id: `upload-${Date.now()}`,
          performed_by: user.email,
          details: {
            source: "data_upload",
            file_name: file.name,
            opportunities_created: opportunities.length
          }
        });

        setUploadResult({
          success: true,
          count: opportunities.length
        });
        
        toast.success(`Successfully imported ${opportunities.length} opportunities!`);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      } else {
        throw new Error(result.details || "Failed to extract data");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadResult({
        success: false,
        error: error.message
      });
      toast.error("Failed to process file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Upload className="w-6 h-6 text-blue-600" />
            Upload AWS Resource Data
          </DialogTitle>
          <DialogDescription>
            Upload CSV, JSON, or Excel files with AWS resource metrics. Our AI will automatically extract and create optimization opportunities.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Upload Area */}
          <Card className="border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors">
            <label className="block cursor-pointer p-8 text-center">
              <input
                type="file"
                accept=".csv,.json,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                {file ? (
                  <>
                    <p className="font-medium text-slate-900">{file.name}</p>
                    <p className="text-sm text-slate-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-slate-900">Drop your file here or click to browse</p>
                    <p className="text-sm text-slate-500">
                      Supports CSV, JSON, Excel with EC2, EBS, RDS, S3 metrics
                    </p>
                  </>
                )}
              </div>
            </label>
          </Card>

          {/* Expected Format Info */}
          <Card className="bg-blue-50 border-blue-200 p-4">
            <h4 className="font-medium text-blue-900 mb-2">Expected Data Format:</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Resource ID or name</li>
              <li>Service type (EC2, EBS, RDS, S3)</li>
              <li>Environment (DEV, TEST)</li>
              <li>Utilization metrics (CPU, Memory, IOPS, etc.)</li>
              <li>Cost data (optional)</li>
            </ul>
          </Card>

          {/* Upload Result */}
          {uploadResult && (
            <Card className={uploadResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
              <div className="p-4 flex items-start gap-3">
                {uploadResult.success ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">
                        Success! Created {uploadResult.count} opportunities
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        The AI agent has processed your data and identified cost optimization opportunities.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Upload Failed</p>
                      <p className="text-sm text-red-700 mt-1">{uploadResult.error}</p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Process
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}