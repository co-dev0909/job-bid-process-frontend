/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Trash, Users } from "lucide-react";
import { toast } from "react-toastify";

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
import CustomTable from "@/components/custom-table";

export default function JobsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    jobLink: "",
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    profileId: "",
  });

  // ------------------------
  // Table Columns
  // ------------------------
  const columns = [
    {
      header: "NO",
      accessorKey: "no",
      cell: (_row: any, index: number) => (
        <div className="text-center">{index + 1}</div>
      ),
    },
    {
      header: "Job Link",
      accessorKey: "jobLink",
      cell: (row: any) => (
        <div className="max-w-xs truncate text-center" title={row.jobLink}>
          <a href={row.jobLink} target="_blank" rel="noopener noreferrer">
            {row.jobLink}
          </a>
        </div>
      ),
    },
    {
      header: "Job Description",
      accessorKey: "jobDescription",
      cell: (row: any) => (
        <div
          className="max-w-xs truncate text-center"
          title={row.jobDescription}
        >
          {row.jobDescription}
        </div>
      ),
    },
    {
      header: "Profile",
      accessorKey: "profile",
      cell: (row: any) => (
        <div className="text-center">{row.profile?.fullName}</div>
      ),
    },
    // {
    //   header: "Status",
    //   accessorKey: "status",
    //   cell: (row: any) => <div className="text-center">{row.status}</div>,
    // },
    {
      header: "",
      accessorKey: "action",
      cell: (row: any) => (
        <div className="flex justify-center">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteClick(row._id)}
            className="cursor-pointer"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

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
    getJobs();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      getJobs();
    }, 5000); // every 10s
    return () => clearInterval(interval);
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

  const getJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jobs`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await res.json();
      if (data.success) {
        setJobs(data.data);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("An unexpected error occurred while getting jobs:", error);
    } finally {
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
        // setSelectedProfile(null);
        getJobs();
      } else {
        toast.error(data.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Error creating job. Please try again.");
    } finally {
    }
  };

  const handleDeleteClick = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/jobs/${jobId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (res.status === 204) {
        toast.success("Job deleted successfully!");
        // Remove job from state without reloading all
        setJobs((prev) => prev.filter((job) => job._id !== jobId));
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete job.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting job. Please try again.");
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
          <div className="flex flex-col gap-6 w-full h-[calc(100vh-8rem)] ">
            
            {/* Right: Jobs Table */}
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
                        setFormData((prev) => ({
                          ...prev,
                          companyName: e.target.value,
                        }))
                      }
                    />
                  </div>

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
                        setSelectedProfile(profile);
                      }}
                    >
                      <SelectTrigger className="w-full text-slate-200">
                        <SelectValue placeholder="Select a profile" />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles.length > 0 &&
                          profiles.map((profile: any) => (
                            <SelectItem key={profile._id} value={profile._id}>
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
                      className="cursor-pointer w-1/2"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Left: Add Job Form */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm w-full flex-1">
              <CardHeader className="border-b border-slate-700/50 pb-3">
                <CardTitle className="text-slate-100 flex items-center">
                  <Users className="mr-2 h-5 w-5 text-cyan-500" />
                  Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CustomTable columns={columns} data={jobs} rowsPerPage={20} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
