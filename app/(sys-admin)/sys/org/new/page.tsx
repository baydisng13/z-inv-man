"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Building2, User, Mail, Lock, Hash, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  organizationSlug: z
    .string()
    .min(2, "Organization slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
})

type FormData = z.infer<typeof formSchema>

interface CreateUserFormProps {
  onBack: () => void
}

export function CreateUserForm({ onBack }: CreateUserFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      organizationName: "",
      organizationSlug: "",
    },
  })

  const onSubmit = (data: FormData) => {
    console.log("Creating user and organization:", data)
    toast.success("User and organization created successfully!")
    form.reset()
    onBack()
  }

  const generateSlug = () => {
    const orgName = form.getValues("organizationName")
    if (orgName) {
      const slug = orgName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
      form.setValue("organizationSlug", slug)
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-gray-100 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create User & Organization</h1>
          <p className="mt-2 text-gray-600 font-medium">Set up a new user account with their organization</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card className="border-0 shadow-sm ring-1 ring-gray-200/50 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-200/60 bg-gray-50/50 pb-8">
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5" />
              User & Organization Details
            </CardTitle>
            <CardDescription className="font-medium">
              Enter the user information and organization details below
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* User Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <User className="h-4 w-4" />
                    User Information
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                              <Input
                                placeholder="John Doe"
                                className="pl-10 border-gray-200 focus:border-gray-900 focus:ring-gray-900/10 bg-white"
                                {...field}
                              />
                            </div>
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
                          <FormLabel className="text-sm font-semibold text-gray-700">Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                              <Input
                                type="email"
                                placeholder="john@company.com"
                                className="pl-10 border-gray-200 focus:border-gray-900 focus:ring-gray-900/10 bg-white"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="pl-10 border-gray-200 focus:border-gray-900 focus:ring-gray-900/10 bg-white"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs text-gray-500 font-medium">
                          Must be at least 8 characters long
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="bg-gray-200" />

                {/* Organization Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <Building2 className="h-4 w-4" />
                    Organization Information
                  </div>

                  <FormField
                    control={form.control}
                    name="organizationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">Organization Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              placeholder="Acme Corporation"
                              className="pl-10 border-gray-200 focus:border-gray-900 focus:ring-gray-900/10 bg-white"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                if (!form.getValues("organizationSlug")) {
                                  setTimeout(generateSlug, 100)
                                }
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="organizationSlug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">Organization Slug</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              placeholder="acme-corporation"
                              className="pl-10 border-gray-200 focus:border-gray-900 focus:ring-gray-900/10 bg-white font-mono text-sm"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 text-xs hover:bg-gray-100"
                              onClick={generateSlug}
                            >
                              Generate
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs text-gray-500 font-medium">
                          Used in URLs. Only lowercase letters, numbers, and hyphens allowed.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="px-6 py-2.5 font-semibold border-gray-200 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-2.5 font-semibold shadow-sm"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Creating..." : "Create User & Organization"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
