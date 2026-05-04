import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { UploadCloud, CheckCircle2, FileText, ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"], { required_error: "Gender is required" }),
  mobileNumber: z.string().min(10, "Valid mobile number required"),
  emailId: z.string().email("Valid email required"),
  address: z.string().optional(),
  
  college: z.string().optional(),
  degree: z.string().optional(),
  department: z.string().optional(),
  yearOfStudy: z.string().optional(),
  university: z.string().optional(),
  
  whyJoin: z.string().min(10, "Please explain why you want to join"),
  areasOfInterest: z.array(z.string()).optional(),
  interestedInBusiness: z.enum(["Yes", "No", "Maybe"]).optional(),
  
  currentSkills: z.string().optional(),
  businessKnowledge: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  
  canAttendAll: z.enum(["Yes", "No"], { required_error: "Please confirm your availability" }),
  preferredTimeSlot: z.enum(["Morning", "Afternoon", "Evening"]).optional(),
  
  agreeToProject: z.boolean().refine((val) => val === true, {
    message: "You must agree to participate in the final project",
  }),
  declarationConfirmed: z.boolean().refine((val) => val === true, {
    message: "You must confirm the details are correct",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      dateOfBirth: "",
      mobileNumber: "",
      emailId: "",
      address: "",
      college: "",
      degree: "",
      department: "",
      yearOfStudy: "",
      university: "",
      whyJoin: "",
      areasOfInterest: [],
      currentSkills: "",
      agreeToProject: false,
      declarationConfirmed: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!resumeFile) {
      toast({ title: "Resume required", description: "Please upload your resume", variant: "destructive" });
      return;
    }
    if (!photoFile) {
      toast({ title: "Photo required", description: "Please upload your passport size photo", variant: "destructive" });
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      
      // Append text fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, value.join(","));
          } else if (typeof value === "boolean") {
            formData.append(key, value ? "true" : "false");
          } else {
            formData.append(key, value as string);
          }
        }
      });

      // Append files
      formData.append("resume", resumeFile);
      formData.append("photo", photoFile);

      const response = await fetch("/api/registrations", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit registration");
      }

      toast({
        title: "Registration successful!",
        description: "Your application has been submitted successfully.",
      });
      
      setLocation("/register/success");
    } catch (error) {
      console.error(error);
      toast({
        title: "Registration failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "resume" | "photo") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Maximum file size is 5MB", variant: "destructive" });
      return;
    }

    if (type === "resume") {
      setResumeFile(file);
    } else {
      setPhotoFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-4">Bootcamp Registration</h1>
          <p className="text-lg text-muted-foreground">Complete the form below to apply for the Aimstorm 15 Days Business Bootcamp.</p>
        </div>

        <Card className="border-border shadow-lg">
          <CardContent className="p-6 sm:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                
                {/* 1. Personal Information */}
                <section>
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">1</div>
                    <h2 className="text-xl font-semibold">Personal Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="gender" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Gender <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-row gap-4">
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="Male" /></FormControl>
                              <FormLabel className="font-normal">Male</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="Female" /></FormControl>
                              <FormLabel className="font-normal">Female</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="Other" /></FormControl>
                              <FormLabel className="font-normal">Other</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Input placeholder="Enter 10 digit number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="emailId" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Full Address</FormLabel>
                        <FormControl><Textarea placeholder="Your residential address" className="resize-none" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </section>

                <Separator />

                {/* 2. Educational Background */}
                <section>
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">2</div>
                    <h2 className="text-xl font-semibold">Educational Background</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="college" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>College / Institution Name</FormLabel>
                        <FormControl><Input placeholder="Enter your college name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="degree" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Degree</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select degree" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="BBA">BBA</SelectItem>
                            <SelectItem value="B.Com">B.Com</SelectItem>
                            <SelectItem value="MBA">MBA</SelectItem>
                            <SelectItem value="B.Tech">B.Tech / B.E</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="yearOfStudy" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year of Study</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="1st">1st Year</SelectItem>
                            <SelectItem value="2nd">2nd Year</SelectItem>
                            <SelectItem value="3rd">3rd Year</SelectItem>
                            <SelectItem value="Final">Final Year</SelectItem>
                            <SelectItem value="Graduated">Graduated</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="department" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department / Specialization</FormLabel>
                        <FormControl><Input placeholder="e.g. Marketing, Computer Science" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="university" render={({ field }) => (
                      <FormItem>
                        <FormLabel>University</FormLabel>
                        <FormControl><Input placeholder="Enter university name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </section>

                <Separator />

                {/* 3. Internship Preferences */}
                <section>
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">3</div>
                    <h2 className="text-xl font-semibold">Internship Preferences</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <FormField control={form.control} name="whyJoin" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Why do you want to join this bootcamp? <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Textarea placeholder="Tell us what you hope to achieve..." className="h-24 resize-none" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="areasOfInterest" render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Areas of Interest</FormLabel>
                          <CardDescription>Select all that apply</CardDescription>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {["Entrepreneurship", "Marketing", "Finance", "Sales", "Business Strategy", "Operations"].map((item) => (
                            <FormField key={item} control={form.control} name="areasOfInterest" render={({ field }) => {
                              return (
                                <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item])
                                          : field.onChange((field.value || []).filter((value) => value !== item))
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{item}</FormLabel>
                                </FormItem>
                              )
                            }} />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="interestedInBusiness" render={({ field }) => (
                      <FormItem className="space-y-3 pt-4">
                        <FormLabel>Are you interested in starting your own business in the future?</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-row gap-6">
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="Yes" /></FormControl>
                              <FormLabel className="font-normal">Yes</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="No" /></FormControl>
                              <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="Maybe" /></FormControl>
                              <FormLabel className="font-normal">Maybe</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </section>

                <Separator />

                {/* 4. Skills & Knowledge */}
                <section>
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">4</div>
                    <h2 className="text-xl font-semibold">Skills & Knowledge</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <FormField control={form.control} name="currentSkills" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Skills</FormLabel>
                        <FormControl><Textarea placeholder="e.g. Communication, Data Analysis, Content Creation..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="businessKnowledge" render={({ field }) => (
                      <FormItem className="space-y-3 pt-2">
                        <FormLabel>Current level of business knowledge</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col sm:flex-row gap-4">
                            <FormItem className="flex items-center space-x-2 space-y-0 border p-4 rounded-lg flex-1 cursor-pointer hover:bg-slate-50">
                              <FormControl><RadioGroupItem value="Beginner" /></FormControl>
                              <FormLabel className="font-normal cursor-pointer w-full text-center">Beginner</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0 border p-4 rounded-lg flex-1 cursor-pointer hover:bg-slate-50">
                              <FormControl><RadioGroupItem value="Intermediate" /></FormControl>
                              <FormLabel className="font-normal cursor-pointer w-full text-center">Intermediate</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0 border p-4 rounded-lg flex-1 cursor-pointer hover:bg-slate-50">
                              <FormControl><RadioGroupItem value="Advanced" /></FormControl>
                              <FormLabel className="font-normal cursor-pointer w-full text-center">Advanced</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </section>

                <Separator />

                {/* 5. Availability */}
                <section>
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">5</div>
                    <h2 className="text-xl font-semibold">Availability</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <FormField control={form.control} name="canAttendAll" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Can you attend all 15 days of the bootcamp? <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-row gap-6">
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="Yes" /></FormControl>
                              <FormLabel className="font-normal">Yes</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="No" /></FormControl>
                              <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="preferredTimeSlot" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Preferred Time Slot</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col sm:flex-row gap-4">
                            <FormItem className="flex items-center space-x-2 space-y-0 border p-3 rounded-lg flex-1">
                              <FormControl><RadioGroupItem value="Morning" /></FormControl>
                              <FormLabel className="font-normal w-full">Morning</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0 border p-3 rounded-lg flex-1">
                              <FormControl><RadioGroupItem value="Afternoon" /></FormControl>
                              <FormLabel className="font-normal w-full">Afternoon</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0 border p-3 rounded-lg flex-1">
                              <FormControl><RadioGroupItem value="Evening" /></FormControl>
                              <FormLabel className="font-normal w-full">Evening</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </section>

                <Separator />

                {/* 6. Uploads */}
                <section>
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">6</div>
                    <h2 className="text-xl font-semibold">Documents</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <FormLabel>Resume / CV <span className="text-destructive">*</span></FormLabel>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
                        <input 
                          type="file" 
                          accept=".pdf,.doc,.docx" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => handleFileChange(e, "resume")}
                        />
                        {resumeFile ? (
                          <>
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                              <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                            <p className="text-sm font-medium text-foreground truncate max-w-full px-4">{resumeFile.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                              <FileText className="w-6 h-6 text-slate-500" />
                            </div>
                            <p className="text-sm font-medium text-foreground mb-1">Click or drag PDF/DOC</p>
                            <p className="text-xs text-muted-foreground">Max 5MB</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <FormLabel>Passport Size Photo <span className="text-destructive">*</span></FormLabel>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
                        <input 
                          type="file" 
                          accept=".jpg,.jpeg,.png" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => handleFileChange(e, "photo")}
                        />
                        {photoFile ? (
                          <>
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                              <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                            <p className="text-sm font-medium text-foreground truncate max-w-full px-4">{photoFile.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{(photoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                              <ImageIcon className="w-6 h-6 text-slate-500" />
                            </div>
                            <p className="text-sm font-medium text-foreground mb-1">Click or drag JPG/PNG</p>
                            <p className="text-xs text-muted-foreground">Max 5MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* 7 & 8. Declarations */}
                <section className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-lg border border-border">
                    <FormField control={form.control} name="agreeToProject" render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base font-medium">I agree to participate in the final project and presentation</FormLabel>
                          <CardDescription>This is a core requirement to receive the certification.</CardDescription>
                        </div>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="declarationConfirmed" render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base font-medium">I confirm that all details provided above are true and correct</FormLabel>
                        </div>
                      </FormItem>
                    )} />
                  </div>
                </section>

                <div className="pt-6">
                  <Button type="submit" size="lg" className="w-full text-lg h-14" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}