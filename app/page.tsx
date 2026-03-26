'use client'

import { supabase } from '@/lib/supabase';
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  ShieldCheck,
  Upload,
  ClipboardList,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const steps = [
  { id: 1, title: "Strata details from WIP", icon: Building2 },
  { id: 2, title: "Governance statussss", icon: ShieldCheck },
  { id: 3, title: "Core documentsssss", icon: Upload },
  { id: 4, title: "Setup checklistsssss", icon: ClipboardList },
];

const requiredDocs = [
  "Registered bylaws",
  "Recent meeting minutes",
  "Financial records / budget",
  "Insurance documents",
  "Depreciation report (if available)",
  "Strata plan / property information",
];

export default function Home() {
    // Save strata details to Supabase
    const saveStrataDetails = async () => {
      try {
        const payload = {
          strataName: details.strataName,
          unitCount: details.unitCount,
          address: details.address,
          province: details.province,
          contactName: details.contactName,
          contactEmail: details.contactEmail,
          contactPhone: details.contactPhone,
        };

        console.log('Supabase payload:', payload);

        const result = (await supabase
          .from('strata_details')
          .insert([payload])) as unknown;

        console.log('Supabase raw result:', result);

        const { data, error, status, statusText } = (result as {
          data?: any;
          error?: any;
          status?: number | null;
          statusText?: string | null;
        });

        const errorRaw = error || null;
        const errorMessage =
          (error && typeof error === 'object' && Object.keys(error).length > 0
            ? error.message || error.msg || error.details || JSON.stringify(error)
            : null) ||
          (typeof error === 'string' ? error : null) ||
          (status && status >= 400 ? `HTTP ${status} ${statusText || ''}` : null);

        if (errorMessage) {
          console.error('Supabase error triggered:', {
            status,
            statusText,
            error: errorRaw,
            errorMessage,
          });
          throw new Error(`Supabase insert failed: ${errorMessage}`);
        }

        if (!data || (Array.isArray(data) && data.length === 0)) {
          console.warn('Supabase: insert succeeded but returned empty data.', { data, status, statusText });
        }

        return data;
      } catch (err) {
        console.error('Save error:', err);
      }
    };
  const [currentStep, setCurrentStep] = useState(1);

  const [details, setDetails] = useState({
    strataName: "Harbour View Strata",
    unitCount: "8",
    address: "",
    province: "British Columbia",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const [governance, setGovernance] = useState({
    councilFormed: true,
    annualGeneralMeetingHeld: false,
    bylawsAdopted: true,
    bankAccountSetUp: false,
    insuranceActive: true,
    budgetPrepared: false,
    notes: "",
  });

  const governanceFields: Array<{
    key:
      | "councilFormed"
      | "annualGeneralMeetingHeld"
      | "bylawsAdopted"
      | "bankAccountSetUp"
      | "insuranceActive"
      | "budgetPrepared";
    label: string;
  }> = [
    { key: "councilFormed", label: "Council members identified" },
    { key: "annualGeneralMeetingHeld", label: "AGM completed" },
    { key: "bylawsAdopted", label: "Bylaws formally adopted" },
    { key: "bankAccountSetUp", label: "Strata bank account active" },
    { key: "insuranceActive", label: "Insurance currently in place" },
    { key: "budgetPrepared", label: "Operating budget prepared" },
  ];

  const [uploadedDocs, setUploadedDocs] = useState<string[]>([
    "Registered bylaws",
    "Insurance documents",
  ]);

  const completion = useMemo(() => (currentStep / steps.length) * 100, [currentStep]);

  const checklist = useMemo(() => {
    const items = [
      {
        label: "Confirm strata profile and contact details",
        done: !!details.strataName && !!details.unitCount,
      },
      {
        label: "Verify council members and governance roles",
        done: governance.councilFormed,
      },
      {
        label: "Hold or schedule annual general meeting",
        done: governance.annualGeneralMeetingHeld,
      },
      {
        label: "Ensure bylaws are adopted and stored digitally",
        done: governance.bylawsAdopted && uploadedDocs.includes("Registered bylaws"),
      },
      {
        label: "Set up strata bank account",
        done: governance.bankAccountSetUp,
      },
      {
        label: "Prepare current operating budget",
        done: governance.budgetPrepared,
      },
      {
        label: "Upload core governance and property documents",
        done: uploadedDocs.length >= 4,
      },
      {
        label: "Review insurance coverage and renewal dates",
        done: governance.insuranceActive && uploadedDocs.includes("Insurance documents"),
      },
    ];

    return items;
  }, [details, governance, uploadedDocs]);

  const completedCount = checklist.filter((item) => item.done).length;

  const nextStep = () => {
    if (currentStep === 1) {
      saveStrataDetails();
    }
    setCurrentStep((s) => Math.min(steps.length, s + 1));
  };
  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  const toggleGov = (
    key:
      | "councilFormed"
      | "annualGeneralMeetingHeld"
      | "bylawsAdopted"
      | "bankAccountSetUp"
      | "insuranceActive"
      | "budgetPrepared"
  ) => {
    setGovernance((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleDoc = (doc: string) => {
    setUploadedDocs((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
    );
  };

  const StepIcon = steps[currentStep - 1].icon;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-900 p-2 text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Strata setup</CardTitle>
                <CardDescription>Onboarding for a self-managed strata</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                <span>Progress</span>
                <span>{Math.round(completion)}%</span>
              </div>
              <Progress value={completion} className="h-2" />
            </div>

            <div className="space-y-3">
              {steps.map((step) => {
                const Icon = step.icon;
                const active = step.id === currentStep;
                const complete = step.id < currentStep;

                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                      active
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`rounded-xl p-2 ${
                        active ? "bg-white/15" : complete ? "bg-emerald-50" : "bg-slate-100"
                      }`}
                    >
                      {complete ? (
                        <CheckCircle2
                          className={`h-4 w-4 ${active ? "text-white" : "text-emerald-600"}`}
                        />
                      ) : (
                        <Icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-700"}`} />
                      )}
                    </div>

                    <div>
                      <div className="text-xs opacity-70">Step {step.id}</div>
                      <div className="font-medium">{step.title}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="mb-1 flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4" />
                Recommended for small strata
              </div>
              Keep the flow simple: establish governance, centralize documents, then generate an
              actionable setup checklist.
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-2xl bg-slate-100 p-2">
                  <StepIcon className="h-5 w-5 text-slate-800" />
                </div>
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  Step {currentStep} of {steps.length}
                </Badge>
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {steps[currentStep - 1].title}
              </h1>

              <p className="mt-1 text-sm text-slate-600">
                Build a clean operational foundation for your self-managed strata.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <div className="text-slate-500">Checklist readiness</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">
                {completedCount}/{checklist.length}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardContent className="p-6 md:p-8">
                  {currentStep === 1 && (
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Strata name</Label>
                        <Input
                          value={details.strataName}
                          onChange={(e) =>
                            setDetails({ ...details, strataName: e.target.value })
                          }
                          placeholder="Enter strata name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Number of units</Label>
                        <Input
                          value={details.unitCount}
                          onChange={(e) =>
                            setDetails({ ...details, unitCount: e.target.value })
                          }
                          placeholder="e.g. 6"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Property address</Label>
                        <Input
                          value={details.address}
                          onChange={(e) =>
                            setDetails({ ...details, address: e.target.value })
                          }
                          placeholder="Enter strata address"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Province</Label>
                        <Input
                          value={details.province}
                          onChange={(e) =>
                            setDetails({ ...details, province: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Primary contact</Label>
                        <Input
                          value={details.contactName}
                          onChange={(e) =>
                            setDetails({ ...details, contactName: e.target.value })
                          }
                          placeholder="Council contact name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Contact phone</Label>
                        <Input
                          value={details.contactPhone}
                          onChange={(e) =>
                            setDetails({ ...details, contactPhone: e.target.value })
                          }
                          placeholder="e.g. (555) 123-4567"
                          type="tel"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Contact email</Label>
                        <Input
                          value={details.contactEmail}
                          onChange={(e) =>
                            setDetails({ ...details, contactEmail: e.target.value })
                          }
                          placeholder="name@email.com"
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        {governanceFields.map(({ key, label }) => (
                          <label
                            key={key}
                            className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 hover:bg-slate-50"
                          >
                            <Checkbox
                              checked={governance[key]}
                              onCheckedChange={() => toggleGov(key)}
                            />
                            <span className="text-sm font-medium text-slate-800">{label}</span>
                          </label>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                          value={governance.notes}
                          onChange={(e) =>
                            setGovernance({ ...governance, notes: e.target.value })
                          }
                          placeholder="Anything missing, uncertain, or needing follow-up?"
                          className="min-h-[120px]"
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                        <Upload className="mx-auto mb-3 h-8 w-8 text-slate-500" />
                        <h3 className="text-lg font-medium text-slate-900">
                          Upload core documents
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          Connect the documents your strata already has so the system can organize
                          and answer governance questions accurately.
                        </p>
                        <Button className="mt-4 rounded-xl">Select files</Button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        {requiredDocs.map((doc) => {
                          const checked = uploadedDocs.includes(doc);

                          return (
                            <label
                              key={doc}
                              className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 hover:bg-slate-50"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggleDoc(doc)}
                              />
                              <div className="flex items-center gap-2 text-sm text-slate-800">
                                <FileText className="h-4 w-4 text-slate-500" />
                                {doc}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="rounded-2xl bg-slate-900 p-5 text-white">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="text-sm text-slate-300">Generated setup checklist</div>
                            <div className="mt-1 text-xl font-semibold">
                              {details.strataName || "Your strata"}
                            </div>
                          </div>

                          <Badge className="rounded-full bg-white/10 px-3 py-1 text-white hover:bg-white/10">
                            {completedCount} completed · {checklist.length - completedCount}{" "}
                            remaining
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {checklist.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4"
                          >
                            {item.done ? (
                              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                            ) : (
                              <div className="mt-0.5 h-5 w-5 rounded-full border-2 border-slate-300" />
                            )}

                            <div className="flex-1">
                              <div className="font-medium text-slate-900">{item.label}</div>
                              <div className="mt-1 text-sm text-slate-600">
                                {item.done
                                  ? "Already covered based on current onboarding inputs."
                                  : "Recommended next action for the strata to complete setup."}
                              </div>
                            </div>

                            <Badge
                              variant={item.done ? "secondary" : "outline"}
                              className="rounded-full"
                            >
                              {item.done ? "Done" : "Pending"}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="grid gap-4 md:grid-cols-3">
                        <Card className="rounded-2xl border-slate-200 shadow-none">
                          <CardContent className="p-4">
                            <div className="text-sm text-slate-500">Documents uploaded</div>
                            <div className="mt-1 text-2xl font-semibold text-slate-900">
                              {uploadedDocs.length}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="rounded-2xl border-slate-200 shadow-none">
                          <CardContent className="p-4">
                            <div className="text-sm text-slate-500">Governance complete</div>
                            <div className="mt-1 text-2xl font-semibold text-slate-900">
                              {
                                [
                                  governance.councilFormed,
                                  governance.annualGeneralMeetingHeld,
                                  governance.bylawsAdopted,
                                  governance.bankAccountSetUp,
                                  governance.insuranceActive,
                                  governance.budgetPrepared,
                                ].filter(Boolean).length
                              }
                              /6
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="rounded-2xl border-slate-200 shadow-none">
                          <CardContent className="p-4">
                            <div className="text-sm text-slate-500">Readiness score</div>
                            <div className="mt-1 text-2xl font-semibold text-slate-900">
                              {Math.round((completedCount / checklist.length) * 100)}%
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < steps.length ? (
              <Button className="rounded-xl" onClick={nextStep}>
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button className="rounded-xl">Save onboarding</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}