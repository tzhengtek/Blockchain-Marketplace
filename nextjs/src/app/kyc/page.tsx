"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card"
import { Button } from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { Label } from "@/components/atoms/label"
import { Checkbox } from "@/components/atoms/checkbox"
import { Badge } from "@/components/atoms/badge"

type KYCStatus = "not_started" | "in_progress" | "completed" | "rejected"

const VERIFICATION_STEPS = [
  {
    id: "identity",
    label: "Identity Verification",
    description: "Verify your identity with government-issued ID",
  },
  {
    id: "address",
    label: "Address Verification",
    description: "Confirm your residential address",
  },
  {
    id: "financial",
    label: "Financial Information",
    description: "Provide source of funds information",
  },
  {
    id: "documents",
    label: "Document Upload",
    description: "Upload required supporting documents",
  },
]

export default function KYCPage() {
  const [status, setStatus] = useState<KYCStatus>("not_started")
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  })
  const [acceptTerms, setAcceptTerms] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    )
  }

  const handleSubmit = () => {
    if (!acceptTerms) {
      alert("Please accept the terms and conditions")
      return
    }

    if (completedSteps.length < VERIFICATION_STEPS.length) {
      alert("Please complete all verification steps")
      return
    }

    setStatus("in_progress")
    // Simulate verification process
    setTimeout(() => {
      setStatus("completed")
    }, 3000)
  }

  const getStatusBadge = () => {
    const variants: Record<KYCStatus, any> = {
      not_started: { variant: "outline", label: "Not Started" },
      in_progress: { variant: "secondary", label: "In Progress" },
      completed: { variant: "default", label: "Verified" },
      rejected: { variant: "destructive", label: "Rejected" },
    }
    return variants[status]
  }

  const statusInfo = getStatusBadge()

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Know Your Customer (KYC)</h1>
              <p className="text-muted-foreground mt-2">
                Complete verification to unlock full platform access
              </p>
            </div>
            <Badge variant={statusInfo.variant as any}>
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Verification Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {VERIFICATION_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                >
                  <div className="flex-shrink-0">
                    <Checkbox
                      id={step.id}
                      checked={completedSteps.includes(step.id)}
                      onCheckedChange={() => handleStepComplete(step.id)}
                      disabled={status === "in_progress" || status === "completed"}
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor={step.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {step.label}
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {completedSteps.includes(step.id) && (
                      <span className="text-green-600 dark:text-green-400">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {completedSteps.length} of {VERIFICATION_STEPS.length}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${(completedSteps.length / VERIFICATION_STEPS.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Section */}
        {status !== "completed" && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Provide accurate information for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>

              {/* City, State, Zip */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="New York"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="NY"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    placeholder="10001"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  placeholder="United States"
                  value={formData.country}
                  onChange={handleInputChange}
                />
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3 rounded-lg border border-border bg-muted p-4">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I agree to the KYC verification terms and privacy policy
                </label>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={status === "in_progress"}
                className="w-full"
                size="lg"
              >
                {status === "in_progress" ? "Verifying..." : "Submit for Verification"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Completed State */}
        {status === "completed" && (
          <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CardContent className="pt-8">
              <div className="text-center space-y-4">
                <div className="text-6xl">✓</div>
                <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">
                  Verification Complete
                </h2>
                <p className="text-green-700 dark:text-green-200 max-w-md mx-auto">
                  Your KYC verification has been approved. You now have full access to all platform features.
                </p>
                <Button onClick={() => window.location.href = "/"} className="mt-6">
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
