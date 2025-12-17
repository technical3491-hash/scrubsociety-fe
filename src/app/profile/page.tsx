'use client';

import Navbar from "@/components/layout/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Award, FileText, Users, GraduationCap, Edit, Heart } from "lucide-react";
import CaseCard from "@/components/CaseCard";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserTotalLikes, useCases } from "@/hooks/use-cases";
import { Case } from "@/lib/api/cases";
import CaseDetailsDialog from "@/components/CaseDetailsDialog";
import CaseFormDialog from "@/components/CaseFormDialog";
import { useCreateCase, useUpdateCase, useDeleteCase } from "@/hooks/use-cases";
import { CaseFormData } from "@/lib/api/cases";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

export default function Profile() {
  const { user, isLoadingUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { data: totalLikes = 0, isLoading: isLoadingLikes } = useUserTotalLikes(user?.id);
  
  // Fetch user's cases
  const { data: casesData, isLoading: isLoadingCases } = useCases({
    userId: user?.id,
    page: 1,
    limit: 100, // Fetch all user cases for profile
  });
  
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showCommentsOnOpen, setShowCommentsOnOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [deleteCaseId, setDeleteCaseId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const createCaseMutation = useCreateCase();
  const updateCaseMutation = useUpdateCase();
  const deleteCaseMutation = useDeleteCase();
  
  const userCases: Case[] = (casesData?.cases ?? []) as Case[];
  const casesCount = casesData?.total ?? userCases.length;

  useEffect(() => {
    if (!isLoadingUser && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoadingUser, isAuthenticated, router]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (user.name) return user.name;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };

  // Get user specialty/specialization
  const getUserSpecialty = () => {
    if (user.specialization) return user.specialization;
    if (user.userType) {
      const typeLabels: Record<string, string> = {
        student: 'Student',
        doctor: 'Doctor',
        pharmacist: 'Pharmacist',
        nurse: 'Nurse',
        therapist: 'Therapist',
        researcher: 'Researcher',
        other: 'Medical Professional',
      };
      return typeLabels[user.userType] || 'Medical Professional';
    }
    return 'Medical Professional';
  };

  // Get initials for avatar
  const getInitials = () => {
    if (user.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const doctorData = {
    name: getUserDisplayName(),
    specialty: getUserSpecialty(),
    degree: user.degree || 'Not specified',
    licenseNo: user.licenseNo || 'Not provided',
    email: user.email || 'Not provided',
    location: user.mobileNumber ? `Phone: ${user.mobileNumber}` : 'Location not set',
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    bio: user.userType === 'student' 
      ? `Medical student pursuing ${user.degree || 'medical education'}. ${user.institution ? `Currently studying at ${user.institution}.` : ''}`
      : user.experience 
        ? `${getUserSpecialty()} with ${user.experience} of experience. ${user.degree ? `Qualified with ${user.degree}.` : ''}`
        : `${getUserSpecialty()}${user.degree ? ` with ${user.degree}` : ''}.`,
  };

  const handleEditCase = (id: string) => {
    const caseToEdit = userCases.find((c) => c.id === id);
    if (caseToEdit) {
      setEditingCase(caseToEdit);
      setFormDialogOpen(true);
    }
  };

  const handleDeleteCase = (id: string) => {
    setDeleteCaseId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteCaseId) {
      try {
        await deleteCaseMutation.mutateAsync(deleteCaseId);
        setDeleteDialogOpen(false);
        setDeleteCaseId(null);
        toast({
          title: "Success",
          description: "Case deleted successfully.",
        });
      } catch (error) {
        console.error("Failed to delete case:", error);
        toast({
          title: "Error",
          description: "Failed to delete case. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFormSubmit = async (data: CaseFormData) => {
    try {
      if (editingCase) {
        await updateCaseMutation.mutateAsync({ id: editingCase.id, data });
        toast({
          title: "Success",
          description: "Case updated successfully.",
        });
      } else {
        await createCaseMutation.mutateAsync(data);
        toast({
          title: "Success",
          description: "Case created successfully.",
        });
      }
      setFormDialogOpen(false);
      setEditingCase(null);
    } catch (error: unknown) {
      console.error("Failed to save case:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save case. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const stats = [
    { label: "Cases Posted", value: isLoadingCases ? "..." : casesCount.toString(), icon: FileText },
    { label: "Total Likes", value: isLoadingLikes ? "..." : totalLikes.toString(), icon: Heart },
    { label: "Connections", value: "234", icon: Users },
    { label: "CME Credits", value: "24", icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 px-4 pb-12 max-w-5xl mx-auto">
        <Card className="p-6 sm:p-8 rounded-2xl mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar className="w-32 h-32">
              <AvatarImage src="" alt={doctorData.name} />
              <AvatarFallback className="text-3xl">{getInitials()}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2" data-testid="text-doctor-name">{doctorData.name}</h1>
                  <p className="text-lg text-muted-foreground mb-3">{doctorData.specialty}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className="gap-1">
                      <Award className="w-3 h-3" />
                      Verified
                    </Badge>
                    <Badge variant="outline">{doctorData.degree}</Badge>
                  </div>
                </div>
                <Button variant="outline" className="gap-2" data-testid="button-edit-profile">
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{doctorData.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {doctorData.joinedDate}</span>
                </div>
              </div>

              <p className="text-base leading-relaxed" data-testid="text-bio">{doctorData.bio}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <p className="text-2xl font-bold" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>{stat.value}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </Card>

        <Tabs defaultValue="cases" className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="cases" data-testid="tab-cases">Cases</TabsTrigger>
            <TabsTrigger value="about" data-testid="tab-about">About</TabsTrigger>
            <TabsTrigger value="connections" data-testid="tab-connections">Connections</TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="mt-6">
            {isLoadingCases ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading cases...</span>
              </div>
            ) : userCases.length > 0 ? (
              <div className="space-y-4">
                {userCases.map((caseItem) => (
                  <CaseCard
                    key={caseItem.id}
                    id={caseItem.id}
                    doctorName={caseItem.doctorName}
                    doctorSpecialty={caseItem.doctorSpecialty}
                    doctorAvatar={caseItem.doctorAvatar}
                    timeAgo={caseItem.timeAgo}
                    title={caseItem.title}
                    content={caseItem.content}
                    tags={caseItem.tags}
                    likes={caseItem.likes}
                    comments={caseItem.comments}
                    image={caseItem.image}
                    isLoggedIn={isAuthenticated}
                    onEdit={handleEditCase}
                    onDelete={handleDeleteCase}
                    onClick={() => {
                      setSelectedCase(caseItem);
                      setShowCommentsOnOpen(false);
                      setDialogOpen(true);
                    }}
                    onCommentClick={() => {
                      setSelectedCase(caseItem);
                      setShowCommentsOnOpen(true);
                      setDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No cases posted yet.</p>
                <Button onClick={() => setFormDialogOpen(true)}>
                  Create Your First Case
                </Button>
              </div>
            )}
            
            <CaseDetailsDialog
              caseData={selectedCase}
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) {
                  setShowCommentsOnOpen(false);
                }
              }}
              showCommentsOnOpen={showCommentsOnOpen}
            />
            
            <CaseFormDialog
              open={formDialogOpen}
              onOpenChange={setFormDialogOpen}
              caseData={editingCase}
              onSubmit={handleFormSubmit}
              isLoading={createCaseMutation.isPending || updateCaseMutation.isPending}
            />
            
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Case</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this case? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleteCaseMutation.isPending}
                  >
                    {deleteCaseMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card className="p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">Professional Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Specialization</p>
                  <p className="font-medium">{doctorData.specialty}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Qualifications</p>
                  <p className="font-medium">{doctorData.degree}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">License Number</p>
                  <p className="font-medium">{doctorData.licenseNo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium">{doctorData.email}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="connections" className="mt-6">
            <Card className="p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">Connections</h2>
              <p className="text-muted-foreground">
                You have 234 professional connections across various specialties.
              </p>
              <Button className="mt-4" variant="outline" data-testid="button-view-all">
                View All Connections
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

