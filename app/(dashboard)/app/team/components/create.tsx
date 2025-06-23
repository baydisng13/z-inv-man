"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, ShieldCheck, Shield, Eye } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const CreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "user"], {
    required_error: "Please select a role",
  }),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type CreateData = z.infer<typeof CreateSchema>;

interface CreateMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  afterCreate: () => void;
}

export function CreateMemberModal({
  open,
  onOpenChange,
  afterCreate,
}: CreateMemberModalProps) {
  const form = useForm<CreateData>({
    resolver: zodResolver(CreateSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      password: "",
    },
  });

  function generatePassword(length = 12) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let pwd = "";
    for (let i = 0; i < length; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  }

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    form.setValue("password", newPassword);
    navigator.clipboard.writeText(newPassword);
    toast.info("Password generated and saved to clipboard");
  };

  const handleSubmit = async (data: CreateData) => {
    await authClient.admin.createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    }, {
      onError: (error) => {
        toast(error.error.message || error.error.statusText);
      },
      onSuccess: () => {
        toast("User created successfully");
        onOpenChange(false);
        afterCreate();
      },
      onRequest: () => {
        toast.loading("Creating user...");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 ">
            <UserPlus className="h-5 w-5" />
            Create Team Member
          </DialogTitle>
          <DialogDescription>
            Create an account for a new team member to join your system
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@company.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password field and generate button */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Generate or enter password"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGeneratePassword}
                    >
                      Generate
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[
                        {
                          value: "admin",
                          label: "Admin - Full access",
                          icon: <ShieldCheck className="h-4 w-4" />,
                        },
                        {
                          value: "user",
                          label: "User - Standard access",
                          icon: <Shield className="h-4 w-4" />,
                        },
                      ].map((role) => (
                        <SelectItem value={role.value} className="font-medium">
                          <div className="flex items-center gap-2">
                            {role.icon}
                            {role.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
