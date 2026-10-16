'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import {
  addUniversityAction,
  type AddUniversityActionState,
} from '@/app/actions/university'
import {
  GraduationCap,
  Building2,
  Globe,
  MapPin,
  User,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  Loader2,
} from 'lucide-react'

const initialState: AddUniversityActionState = {}

export default function AddUniversityPage() {
  const [state, formAction, isPending] = useActionState(
    addUniversityAction,
    initialState
  )
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setLogoPreview(url)
    } else {
      setLogoPreview(null)
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background text-foreground dark:text-foreground flex flex-col selection:bg-indigo-500/20 selection:text-indigo-600">
      {/* Top Bar */}
      <header className="border-b border-border/80 dark:border-border/80 bg-card/80 dark:bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-foreground dark:text-foreground"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </span>
            <span>LocoUni</span>
          </Link>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground dark:text-muted-foreground hidden sm:inline">
              Already registered?
            </span>
            <Link
              href="/login"
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Page Heading */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-3">
            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Campus Onboarding</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground dark:text-foreground">
            Register your university
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground dark:text-muted-foreground max-w-2xl">
            Set up your institution on LocoUni to publish campus maps, faculty cabins,
            and live notices for your incoming students.
          </p>
        </div>

        {/* Global Error Banner */}
        {state?.error && (
          <div
            role="alert"
            className="mb-8 flex items-start gap-3 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-800 dark:text-red-200"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div>
              <p className="font-semibold">Unable to complete registration</p>
              <p className="mt-0.5 text-red-700 dark:text-red-300/90">{state.error}</p>
            </div>
          </div>
        )}

        <form action={formAction} className="space-y-8">
          {/* Section 1: University Details */}
          <div className="bg-card dark:bg-card rounded-2xl border border-border dark:border-border p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 pb-5 border-b border-border dark:border-border mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                <Building2 className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground dark:text-foreground">
                  University Details
                </h2>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                  Basic institution information visible to students
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* University Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-1.5"
                >
                  University Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Harvard University"
                  className={`w-full rounded-xl border bg-card dark:bg-background px-3.5 py-2.5 text-sm text-foreground dark:text-foreground placeholder-zinc-400 dark:placeholder-zinc-500 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    state?.fieldErrors?.name
                      ? 'border-red-400 dark:border-red-700'
                      : 'border-border dark:border-border focus:border-indigo-600 dark:focus:border-indigo-500'
                  }`}
                />
                {state?.fieldErrors?.name && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                    {state.fieldErrors.name[0]}
                  </p>
                )}
              </div>

              {/* City and Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-1.5"
                  >
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="e.g. Cambridge"
                    className="w-full rounded-xl border border-border dark:border-border bg-card dark:bg-background px-3.5 py-2.5 text-sm text-foreground dark:text-foreground placeholder-zinc-400 dark:placeholder-zinc-500 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500"
                  />
                  {state?.fieldErrors?.city && (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                      {state.fieldErrors.city[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-1.5"
                  >
                    Country
                  </label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    placeholder="e.g. United States"
                    className="w-full rounded-xl border border-border dark:border-border bg-card dark:bg-background px-3.5 py-2.5 text-sm text-foreground dark:text-foreground placeholder-zinc-400 dark:placeholder-zinc-500 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500"
                  />
                  {state?.fieldErrors?.country && (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                      {state.fieldErrors.country[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* Website */}
              <div>
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-1.5"
                >
                  Official Website
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    placeholder="https://www.harvard.edu"
                    className={`w-full rounded-xl border bg-card dark:bg-background pl-10 pr-3.5 py-2.5 text-sm text-foreground dark:text-foreground placeholder-zinc-400 dark:placeholder-zinc-500 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                      state?.fieldErrors?.website
                        ? 'border-red-400 dark:border-red-700'
                        : 'border-border dark:border-border focus:border-indigo-600 dark:focus:border-indigo-500'
                    }`}
                  />
                </div>
                {state?.fieldErrors?.website && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                    {state.fieldErrors.website[0]}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-1.5"
                >
                  Campus Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Tell students about your campus heritage, faculties, and environment..."
                  className="w-full rounded-xl border border-border dark:border-border bg-card dark:bg-background px-3.5 py-2.5 text-sm text-foreground dark:text-foreground placeholder-zinc-400 dark:placeholder-zinc-500 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 resize-y"
                />
                {state?.fieldErrors?.description && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                    {state.fieldErrors.description[0]}
                  </p>
                )}
              </div>

              {/* Coordinates */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                    Campus Map Coordinates (Optional)
                  </label>
                </div>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-2.5">
                  Center coordinates for your interactive campus map. You can update this anytime.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      id="lat"
                      name="lat"
                      type="number"
                      step="any"
                      placeholder="Latitude (e.g. 42.3770)"
                      className={`w-full rounded-xl border bg-card dark:bg-background px-3.5 py-2.5 text-sm text-foreground dark:text-foreground placeholder-zinc-400 dark:placeholder-zinc-500 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                        state?.fieldErrors?.lat
                          ? 'border-red-400 dark:border-red-700'
                          : 'border-border dark:border-border focus:border-indigo-600 dark:focus:border-indigo-500'
                      }`}
                    />
                    {state?.fieldErrors?.lat && (
                      <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                        {state.fieldErrors.lat[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      id="lng"
                      name="lng"
                      type="number"
                      step="any"
                      placeholder="Longitude (e.g. -71.1167)"
                      className={`w-full rounded-xl border bg-card dark:bg-background px-3.5 py-2.5 text-sm text-foreground dark:text-foreground placeholder-zinc-400 dark:placeholder-zinc-500 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                        state?.fieldErrors?.lng
                          ? 'border-red-400 dark:border-red-700'
                          : 'border-border dark:border-border focus:border-indigo-600 dark:focus:border-indigo-500'
                      }`}
                    />
                    {state?.fieldErrors?.lng && (
                      <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                        {state.fieldErrors.lng[0]}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label
                  htmlFor="logo"
                  className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-1.5"
                >
                  University Logo (Optional)
                </label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <div className="w-16 h-16 rounded-xl border border-border dark:border-border overflow-hidden bg-muted dark:bg-muted flex items-center justify-center flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      id="logo"
                      name="logo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleLogoChange}
                      className="block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950/80 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900 cursor-pointer"
                    />
                    <p className="mt-1 text-xs text-muted-foreground dark:text-muted-foreground">
                      Supported formats: JPG, PNG, or WebP. Maximum size: 2 MB.
                    </p>
                  </div>
                </div>
                {state?.fieldErrors?.logo && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                    {state.fieldErrors.logo[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Administrator Account */}
          <div className="bg-card dark:bg-card rounded-2xl border border-border dark:border-border p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 pb-5 border-b border-border dark:border-border mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                <User className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground dark:text-foreground">
                  Administrator Account
                </h2>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                  Login credentials to manage your university directory and notices
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Admin Full Name */}
              <div>
                <label
                  htmlFor="adminName"
                  className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-1.5"
                >
                  Admin Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="adminName"
                    name="adminName"
                    type="text"
                    required
                    placeholder="e.g. Dr. Arthur Pendelton"
                    className={`w-full rounded-xl border bg-card dark:bg-background pl-10 pr-3.5 py-2.5 text-sm text-foreground dark:text-foreground placeholder-zinc-400 dark:placeholder-zinc-500 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                      state?.fieldErrors?.adminName
                        ? 'border-red-400 dark:border-red-700'
                        : 'border-border dark:border-border focus:border-indigo-600 dark:focus:border-indigo-500'
                    }`}
                  />
                </div>
                {state?.fieldErrors?.adminName && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                    {state.fieldErrors.adminName[0]}
                  </p>
                )}
              </div>

              {/* Admin Email */}
              <div>
                <label
                  htmlFor="adminEmail"
                  className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-1.5"
                >
                  Admin Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="adminEmail"
                    name="adminEmail"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="admin@harvard.edu"
                    className={`w-full rounded-xl border bg-card dark:bg-background pl-10 pr-3.5 py-2.5 text-sm text-foreground dark:text-foreground placeholder-zinc-400 dark:placeholder-zinc-500 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                      state?.fieldErrors?.adminEmail
                        ? 'border-red-400 dark:border-red-700'
                        : 'border-border dark:border-border focus:border-indigo-600 dark:focus:border-indigo-500'
                    }`}
                  />
                </div>
                {state?.fieldErrors?.adminEmail && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                    {state.fieldErrors.adminEmail[0]}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-1.5"
                >
                  Password (min 8 characters) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={`w-full rounded-xl border bg-card dark:bg-background pl-10 pr-3.5 py-2.5 text-sm text-foreground dark:text-foreground placeholder-zinc-400 dark:placeholder-zinc-500 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                      state?.fieldErrors?.password
                        ? 'border-red-400 dark:border-red-700'
                        : 'border-border dark:border-border focus:border-indigo-600 dark:focus:border-indigo-500'
                    }`}
                  />
                </div>
                {state?.fieldErrors?.password && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                    {state.fieldErrors.password[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-foreground order-2 sm:order-1"
            >
              Cancel and return home
            </Link>

            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold py-3 px-7 text-sm shadow-md shadow-indigo-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer order-1 sm:order-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering University &amp; Setting up Account...</span>
                </>
              ) : (
                <>
                  <span>Create University &amp; Admin Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
