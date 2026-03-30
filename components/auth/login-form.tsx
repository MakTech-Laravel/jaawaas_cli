"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginInput } from "../../lib/types";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FcGoogle } from "react-icons/fc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useToast } from "../../hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import { login } from "../../lib/api/auth";
import { getDashboardPathByRole } from "../../lib/roles/dashboard-route";
import { getGoogleIdToken } from "../../lib/google-identity";

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { setToken, setUser, loginWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "buyer",
    },
  });

  async function onSubmit(data: LoginInput) {
    try {
      const response = await login(data);
      if (response.success && response.data?.access_token && response.data.user) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        setToken(response.data.access_token);
        setUser(response.data.user);
        router.push(getDashboardPathByRole(response.data.user.role));
      } else {
        toast({
          title: "Login Failed",
          description: response.message || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An error occurred while trying to log in.",
        variant: "destructive",
      });
    }
  }

  async function onGoogle() {
    setGoogleLoading(true);
    try {
      const credential = await getGoogleIdToken();
      const result = await loginWithGoogle(credential, "buyer");
      if (result.success) {
        toast({ title: "Login Successful", description: "Welcome back!" });
        router.push(result.redirectTo);
        return;
      }

      toast({
        title: "Google login failed",
        description: result.message || "Please try again.",
        variant: "destructive",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Google login failed. Please try again.";
      toast({ title: "Google login failed", description: message, variant: "destructive" });
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="m@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="manufacturer">Manufacturer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Login
        </Button>

        {form.watch("role") === "buyer" && (
          <>
            <div className="flex items-center gap-3">
              <span className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-muted-foreground">OR</span>
              <span className="flex-1 h-px bg-gray-200" />
            </div>

            <Button
              type="button"
              onClick={onGoogle}
              aria-label="Continue with Google"
              className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
              disabled={googleLoading}
            >
              <FcGoogle className="w-4 h-4" />
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </Button>
          </>
        )}
      </form>
    </Form>
  );
}
