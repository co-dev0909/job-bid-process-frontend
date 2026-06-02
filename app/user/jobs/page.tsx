/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SystemInitializingOverlay from "@/components/loading";

export default function JobsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [companyDuplicateAlerted, setCompanyDuplicateAlerted] = useState(false);
  const [formData, setFormData] = useState({
    jobLink: "",
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    profileId: "",
  });

  // ------------------------
  // Lifecycle
  // ------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    getProfiles();
    getApplications();
  }, []);

  // ------------------------
  // API Calls
  // ------------------------
  const getProfiles = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
      } else {
        console.error("Failed to get profiles");
      }
    } catch (error) {
      console.error(
        "An unexpected error occurred while getting profiles:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddJob = async () => {
    try {
      const token = localStorage.getItem("token");
      if (
        formData.jobLink === "" ||
        formData.jobDescription === "" ||
        selectedProfile === null
      ) {
        toast.warn(
          "Please fill in all required fields (Job Link, Job Description, Profile)."
        );
        return;
      }

      if (isDuplicateCompany) {
        toast.warn(
          "This company already exists for the selected profile. Please use a different company."
        );
        return;
      }

      const jobData = {
        jobLink: formData.jobLink,
        jobTitle: formData.jobTitle,
        companyName: formData.companyName,
        jobDescription: formData.jobDescription,
        profileId: selectedProfile._id,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(jobData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Job created successfully!");
        setFormData({
          jobLink: "",
          jobTitle: "",
          companyName: "",
          jobDescription: "",
          profileId: "",
        });
        setSelectedProfile(null);
        setTimeout(() => {
          router.push("/user/applications");
        }, 300);
      } else {
        toast.error(data.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Error creating job. Please try again.");
    } finally {
    }
  };

  const getApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/applications`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      const data = await res.json();
      if (data.success) {
        setApplications(data.data || []);
      }
    } catch (error) {
      console.error(
        "An unexpected error occurred while getting applications:",
        error
      );
    }
  };

  const normalizedCompany = formData.companyName.trim().toLowerCase();
  const isDuplicateCompany =
    !!selectedProfile &&
    !!normalizedCompany &&
    applications.some(
      (application) =>
        application.profile?._id === selectedProfile._id &&
        application.company?.trim().toLowerCase() === normalizedCompany
    );

  const handleCompanyBlur = () => {
    if (isDuplicateCompany && !companyDuplicateAlerted) {
      toast.warn("This company already exists for the selected profile.");
      setCompanyDuplicateAlerted(true);
    }
  };

  // ------------------------
  // Render
  // ------------------------
  return (
    <div className="dark h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 relative">
      {isLoading && <SystemInitializingOverlay />}
      <div className="flex flex-col h-full mx-auto p-4 relative z-10">
        <Navbar />
        <div className="flex flex-row gap-6 flex-grow">
          <Sidebar />
          <div className="flex w-full h-[calc(100vh-8rem)]">
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm w-full">
              <CardHeader className="border-b border-slate-700/50 pb-3">
                <CardTitle className="text-slate-100 flex items-center">
                  <Users className="mr-2 h-5 w-5 text-cyan-500" />
                  Add Job
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row items-center gap-4">
                    <Label htmlFor="jobLink" className="w-36 text-slate-200">
                      Job Link *
                    </Label>
                    <Input
                      id="jobLink"
                      className="bg-slate-800/50 border-slate-700 text-slate-100"
                      placeholder="Enter job link"
                      value={formData.jobLink}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          jobLink: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-row items-center gap-4">
                    <Label
                      htmlFor="jobTitle"
                      className="w-36 text-slate-200"
                    >
                      Job Title *
                    </Label>
                    <Input
                      id="jobTitle"
                      className="bg-slate-800/50 border-slate-700 text-slate-100"
                      placeholder="Enter job title"
                      value={formData.jobTitle}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          jobTitle: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-row items-center gap-4">
                    <Label
                      htmlFor="companyName"
                      className="w-36 text-slate-200"
                    >
                      Company *
                    </Label>
                    <Input
                      id="companyName"
                      className="bg-slate-800/50 border-slate-700 text-slate-100"
                      placeholder="Enter Company Name"
                      value={formData.companyName}
                      onChange={(e) =>
                        {
                          setCompanyDuplicateAlerted(false);
                          setFormData((prev) => ({
                            ...prev,
                            companyName: e.target.value,
                          }));
                        }
                      }
                      onBlur={handleCompanyBlur}
                      aria-invalid={isDuplicateCompany}
                    />
                  </div>
                  {isDuplicateCompany && (
                    <p className="text-sm text-red-400 pl-40">
                      This company already exists for the selected profile.
                    </p>
                  )}

                  <div className="flex flex-row items-center gap-4">
                    <Label
                      htmlFor="jobDescription"
                      className="w-36 text-slate-200"
                    >
                      Job Description *
                    </Label>
                    <Textarea
                      id="jobDescription"
                      className="bg-slate-800/50 h-[120px] resize-none border-slate-700 text-slate-100"
                      placeholder="Enter job description"
                      value={formData.jobDescription}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          jobDescription: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-row items-center gap-4">
                    <Label className="w-36 text-slate-200">Profile *</Label>
                    <Select
                      value={selectedProfile?._id || ""}
                      onValueChange={(value) => {
                        const profile = profiles.find(
                          (p: any) => p._id === value
                        );
                        setCompanyDuplicateAlerted(false);
                        setSelectedProfile(profile);
                      }}
                    >
                      <SelectTrigger
                        className="w-full text-slate-200"
                        data-autofill="profile-trigger"
                      >
                        <SelectValue placeholder="Select a profile" />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles.length > 0 &&
                          profiles.map((profile: any) => (
                            <SelectItem
                              key={profile._id}
                              value={profile._id}
                              data-profile-name={profile.fullName}
                            >
                              {profile.fullName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleAddJob}
                      disabled={isDuplicateCompany}
                      data-autofill="save-job"
                      className="cursor-pointer w-full sm:w-48"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
