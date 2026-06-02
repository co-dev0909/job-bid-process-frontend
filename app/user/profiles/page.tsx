"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit, RefreshCw, Trash, Users, Plus } from "lucide-react";

import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CustomTable from "@/components/custom-table";
import SystemInitializingOverlay from "@/components/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Profiles() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const columns = [
    {
      header: "NO",
      accessorKey: "no",
      cell: (_row: any, index: number) => index + 1,
    },
    { header: "Full Name", accessorKey: "fullName" },
    { header: "Email", accessorKey: "email" },
    {
      header: "Action",
      accessorKey: "action",
      cell: (row: any) => (
        <div>
          <Button
            variant="outline"
            size="sm"
            className="mr-2"
            onClick={() => handleEditClick(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteClick(row._id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    getProfiles();
  }, []);

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
        console.log("Success", data);
      } else {
        const errorDetails = await res.json();
        console.error("Failed to get profiles:", errorDetails);
      }
    } catch (error) {
      console.error(
        "An unexpected error occurred while getting profile:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (row: any) => {
    setSelectedRow(row);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false); // Close the dialog
    setSelectedRow(null); // Reset the selected row
    getProfiles();
  };

  const handleDeleteClick = async (profileId: string) => {
    if (!window.confirm("Are you sure you want to delete this profile?"))
      return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/${profileId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (res.ok) {
        setProfiles((prev) =>
          prev.filter((profile: any) => profile._id !== profileId)
        );
        console.log("Profile deleted successfully");
      } else {
        const err = await res.json();
        console.error("Failed to delete:", err);
      }
    } catch (error) {
      console.error("Error while deleting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExperience = () => {
    const newExperience = {
      jobPosition: "",
      jobType: "",
      companyName: "",
      companyLocation: "",
      enterDate: "",
      endDate: "",
    };

    if (!selectedRow) return;

    setSelectedRow((prev: any) => ({
      ...prev,
      experiences: [...(prev?.experiences || []), newExperience],
    }));
  };

  const handleAddEducation = () => {
    const newEducation = {
      universityName: "",
      universityDegree: "",
      universityLocation: "",
      enterDate: "",
      endDate: ""
    };

    if (!selectedRow) return;

    setSelectedRow((prev: any) => ({
      ...prev,
      educations: [...(prev?.educations || []), newEducation]
    }))
  }

  const handleRemoveExperience = (indexToRemove: number) => {
    if (!selectedRow) return;

    const updatedExperiences = selectedRow.experiences.filter(
      (_: any, idx: number) => idx !== indexToRemove
    );

    setSelectedRow((prev: any) => ({
      ...prev,
      experiences: updatedExperiences,
    }));
  };

  const handleRemoveEducation = (indexToRemove: number) => {
    if (!selectedRow) return;

    const updatedEducations = selectedRow.educations.filter(
      (_: any, idx: number) => idx !== indexToRemove
    );

    setSelectedRow((prev: any) => ({
      ...prev,
      educations: updatedEducations,
    }));
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Get token from localStorage
    const token = localStorage.getItem("token");

    // Simulate API call
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/${selectedRow._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(selectedRow),
        }
      );

      if (res.status === 200) {
        const updatedProfile = await res.json();
        console.log(updatedProfile);
        setProfiles((prev: any) =>
          prev.map((profile: any) =>
            profile._id === updatedProfile._id ? updatedProfile : profile
          )
        );

        // Close dialog & clear selected row
        setOpenDialog(false);
        setSelectedRow(null);
      }
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setIsLoading(false);
    }

    setIsLoading(false);
  };
  return (
    <div className="dark h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 relative overflow-hidden">
      {isLoading && <SystemInitializingOverlay />}
      <div className="flex flex-col h-full mx-auto p-4 relative z-10 overflow-hidden">
        <Navbar />
        <div className="flex flex-row gap-6 flex-grow">
          <Sidebar />
          <div className="w-full h-[calc(100vh-8rem)]">
            <div className="flex h-[calc(100vh-8rem)]">
              <Card className="w-full bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-slate-700/50 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-100 flex items-center">
                      <Users className="mr-2 h-5 w-5 text-cyan-500" />
                      Profiles
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400"
                        onClick={getProfiles}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div>
                    <CustomTable
                      columns={columns}
                      data={profiles}
                      rowsPerPage={20}
                    />
                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                      <DialogContent className="h-[90%] min-w-[70%] bg-slate-900 grid-cols-1 text-slate-100 border-slate-900">
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                          <DialogDescription>
                            Make changes to your profile here. Click save when you&apos;re done.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="overflow-y-auto">
                          <div className="grid grid-cols-24 gap-6">
                            {/* Full Name */}
                            <div className="space-y-2 col-span-4">
                              <Label
                                htmlFor="fullName"
                                className="text-slate-200"
                              >
                                Full Name *
                              </Label>
                              <Input
                                id="fullName"
                                className="bg-slate-800/50 border-slate-700 text-slate-100"
                                value={selectedRow?.fullName || ""}
                                onChange={(e) =>
                                  setSelectedRow((prev: any) => ({
                                    ...prev,
                                    fullName: e.target.value,
                                  }))
                                }
                                placeholder="Full Name"
                              />
                            </div>

                            {/* Email */}
                            <div className="space-y-2 col-span-5">
                              <Label htmlFor="email" className="text-slate-200">
                                Email *
                              </Label>
                              <Input
                                id="email"
                                className="bg-slate-800/50 border-slate-700 text-slate-100"
                                value={selectedRow?.email || ""}
                                onChange={(e) =>
                                  setSelectedRow((prev: any) => ({
                                    ...prev,
                                    email: e.target.value,
                                  }))
                                }
                                placeholder="Email"
                              />
                            </div>

                            {/* Phone */}
                            <div className="space-y-2 col-span-3">
                              <Label htmlFor="phone" className="text-slate-200">
                                Phone *
                              </Label>
                              <Input
                                id="phone"
                                className="bg-slate-800/50 border-slate-700 text-slate-100"
                                value={selectedRow?.phone || ""}
                                onChange={(e) =>
                                  setSelectedRow((prev: any) => ({
                                    ...prev,
                                    phone: e.target.value,
                                  }))
                                }
                                placeholder="(123) 456-7890"
                              />
                            </div>

                            {/* Location */}
                            <div className="space-y-2 col-span-4">
                              <Label
                                htmlFor="location"
                                className="text-slate-200"
                              >
                                Location *
                              </Label>
                              <Input
                                id="location"
                                className="bg-slate-800/50 border-slate-700 text-slate-100"
                                value={selectedRow?.location || ""}
                                onChange={(e) =>
                                  setSelectedRow((prev: any) => ({
                                    ...prev,
                                    location: e.target.value,
                                  }))
                                }
                                placeholder="City, State, Zipcode"
                              />
                            </div>

                            {/* LinkedIn */}
                            <div className="space-y-2 col-span-8">
                              <Label
                                htmlFor="linkedin"
                                className="text-slate-200"
                              >
                                LinkedIn *
                              </Label>
                              <Input
                                id="linkedin"
                                className="bg-slate-800/50 border-slate-700 text-slate-100"
                                value={selectedRow?.linkedin || ""}
                                onChange={(e) =>
                                  setSelectedRow((prev: any) => ({
                                    ...prev,
                                    linkedin: e.target.value,
                                  }))
                                }
                                placeholder="LinkedIn URL"
                              />
                            </div>

                            {/* Template */}
                            <div className="space-y-4 col-span-12">
                              <Label htmlFor="resume" className="text-slate-200">
                                Profile
                              </Label>
                              <Select value={selectedRow?.template} onValueChange={(value: string) => setSelectedRow((prev:any) => ({ ...prev, template: value }))}>
                                <SelectTrigger className="w-full bg-slate-800/50 border-slate-700 text-slate-100">
                                  <SelectValue placeholder="Select a template" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem key="1" value="1">template1</SelectItem>
                                  <SelectItem key="2" value="2">template2</SelectItem>
                                  <SelectItem key="3" value="3">template3</SelectItem>
                                  <SelectItem key="4" value="4">template4</SelectItem>
                                  <SelectItem key="5" value="5">template5</SelectItem>
                                  <SelectItem key="6" value="6">template6</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Dynamic Education */}
                            <div className="space-y-4 col-span-24">
                              <div className="flex flex-row justify-between">
                                <Label htmlFor="experience">
                                  Education *
                                </Label>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={handleAddEducation}
                                >
                                  + Add Education
                                </Button>

                              </div>
                              {selectedRow && selectedRow.educations.map((education: any, index: any) => (
                                <div className="space-y-4 mb-8" key={index}>
                                  <Input
                                    id="universityName"
                                    className="bg-slate-800/50 border-slate-700 text-slate-100 w-full"
                                    value={education.universityName || ""}
                                    onChange={(e) => {
                                      const updated = [...selectedRow.educations];
                                      updated[index].universityName = e.target.value;
                                      setSelectedRow((prev: any) => ({
                                        ...prev,
                                        educations: updated,
                                      }));
                                    }}
                                    placeholder="University Name"
                                  />

                                  <Input
                                    id="universityDegree"
                                    className="bg-slate-800/50 border-slate-700 text-slate-100 w-full"
                                    value={education.universityDegree || ""}
                                    onChange={(e) => {
                                      const updated = [...selectedRow.educations];
                                      updated[index].universityDegree = e.target.value;
                                      setSelectedRow((prev: any) => ({
                                        ...prev,
                                        educations: updated,
                                      }));
                                    }}
                                    placeholder="Degree"
                                  />

                                  <Input
                                    id="universityLocation"
                                    className="bg-slate-800/50 border-slate-700 text-slate-100 w-full"
                                    value={education.universityLocation || ""}
                                    onChange={(e) => {
                                      const updated = [...selectedRow.educations];
                                      updated[index].universityLocation = e.target.value;
                                      setSelectedRow((prev: any) => ({
                                        ...prev,
                                        educations: updated,
                                      }));
                                    }}
                                    placeholder="University Location"
                                  />

                                  <div className="grid grid-cols-12 gap-6">
                                    <div className="col-span-12 md:col-span-5 lg:col-span-5">
                                      <Input
                                        id="enterDate"
                                        className="bg-slate-800/50 border-slate-700 text-slate-100 w-full"
                                        value={education.enterDate || ""}
                                        onChange={(e) => {
                                          const updated = [...selectedRow.educations];
                                          updated[index].enterDate = e.target.value;
                                          setSelectedRow((prev: any) => ({
                                            ...prev,
                                            educations: updated,
                                          }));
                                        }}
                                        placeholder="Start Date"
                                      />
                                    </div>
                                    <div className="col-span-12 md:col-span-5 lg:col-span-5">
                                      <Input
                                        id="endDate"
                                        className="bg-slate-800/50 border-slate-700 text-slate-100 w-full"
                                        value={education.endDate || ""}
                                        onChange={(e) => {
                                          const updated = [...selectedRow.educations];
                                          updated[index].endDate = e.target.value;
                                          setSelectedRow((prev: any) => ({
                                            ...prev,
                                            educations: updated,
                                          }));
                                        }}
                                        placeholder="Graduation Date"
                                      />
                                    </div>
                                    <div className="col-span-12 md:col-span-2 lg:col-span-2 text-right">
                                      <Button variant="destructive" size="sm" onClick={() => handleRemoveEducation(index)} >
                                        <Trash />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}                            </div>

                            {/* Work Experience */}
                            <div className="space-y-4 col-span-24">
                              <div className="flex flex-row justify-between">
                                <Label
                                  htmlFor="experience"
                                  className="text-slate-200"
                                >
                                  Work Experience *
                                </Label>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={handleAddExperience}
                                >
                                  + Add Work Experience
                                </Button>
                              </div>

                              <div className="space-y-2">
                                {selectedRow &&
                                  selectedRow.experiences.map(
                                    (experience: any, index: any) => (
                                      <div
                                        className="space-y-4 mb-8"
                                        key={index}
                                      >
                                        <div className="grid grid-cols-24 gap-4">
                                          <Input
                                            value={experience.jobTitle}
                                            onChange={(e) => {
                                              const updated = [
                                                ...selectedRow.experiences,
                                              ];
                                              updated[index].jobTitle =
                                                e.target.value;
                                              setSelectedRow((prev: any) => ({
                                                ...prev,
                                                experiences: updated,
                                              }));
                                            }}
                                            className="bg-slate-800/50 border-slate-700 text-slate-100 col-span-5"
                                            placeholder="Job Title"
                                          />
                                          <Input
                                            value={experience.workSetting}
                                            onChange={(e) => {
                                              const updated = [
                                                ...selectedRow.experiences,
                                              ];
                                              updated[index].workSetting =
                                                e.target.value;
                                              setSelectedRow((prev: any) => ({
                                                ...prev,
                                                experiences: updated,
                                              }));
                                            }}
                                            className="bg-slate-800/50 border-slate-700 text-slate-100 col-span-3"
                                            placeholder="Work Setting"
                                          />
                                          <Input
                                            value={experience.companyName}
                                            onChange={(e) => {
                                              const updated = [
                                                ...selectedRow.experiences,
                                              ];
                                              updated[index].companyName =
                                                e.target.value;
                                              setSelectedRow((prev: any) => ({
                                                ...prev,
                                                experiences: updated,
                                              }));
                                            }}
                                            className="bg-slate-800/50 border-slate-700 text-slate-100 col-span-5"
                                            placeholder="Company Name"
                                          />
                                          <Input
                                            value={experience.companyLocation}
                                            onChange={(e) => {
                                              const updated = [
                                                ...selectedRow.experiences,
                                              ];
                                              updated[index].companyLocation =
                                                e.target.value;
                                              setSelectedRow((prev: any) => ({
                                                ...prev,
                                                experiences: updated,
                                              }));
                                            }}
                                            className="bg-slate-800/50 border-slate-700 text-slate-100 col-span-4"
                                            placeholder="Company Location"
                                          />
                                          <Input
                                            value={experience.enterDate}
                                            onChange={(e) => {
                                              const updated = [
                                                ...selectedRow.experiences,
                                              ];
                                              updated[index].enterDate =
                                                e.target.value;
                                              setSelectedRow((prev: any) => ({
                                                ...prev,
                                                experiences: updated,
                                              }));
                                            }}
                                            className="bg-slate-800/50 border-slate-700 text-slate-100 col-span-3"
                                            placeholder="Begin Date"
                                          />
                                          <Input
                                            value={experience.endDate}
                                            onChange={(e) => {
                                              const updated = [
                                                ...selectedRow.experiences,
                                              ];
                                              updated[index].endDate =
                                                e.target.value;
                                              setSelectedRow((prev: any) => ({
                                                ...prev,
                                                experiences: updated,
                                              }));
                                            }}
                                            className="bg-slate-800/50 border-slate-700 text-slate-100 col-span-3"
                                            placeholder="End Date"
                                          />
                                          <Textarea
                                            value={
                                              experience.companyInformation
                                            }
                                            onChange={(e) => {
                                              const updated = [
                                                ...selectedRow.experiences,
                                              ];
                                              updated[
                                                index
                                              ].companyInformation =
                                                e.target.value;
                                              setSelectedRow((prev: any) => ({
                                                ...prev,
                                                experiences: updated,
                                              }));
                                            }}
                                            className="bg-slate-800/50 h-[120px] resize-none border-slate-700 text-slate-100 col-span-23"
                                            placeholder="Company Information"
                                          />
                                          <div className="flex items-end justify-start">
                                            <Button
                                              variant="destructive"
                                              size="sm"
                                              onClick={() =>
                                                handleRemoveExperience(index)
                                              }
                                            >
                                              <Trash />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <DialogFooter className="flex justify-end items-end">
                          <Button type="button" variant="destructive" onClick={handleDialogClose}>
                            Cancel
                          </Button>
                          <Button type="button" variant="secondary" onClick={handleUpdateProfile}>
                            Save
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-6 right-6 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/user/profile-create">
                <Button
                  size="lg"
                  className="h-14 w-14 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg shadow-cyan-500/25"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Add New Profile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
