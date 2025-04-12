import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icons";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  fullName: z.string().optional(),
  company: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { loginMutation, registerMutation, user } = useAuth();
  const [location, navigate] = useLocation();

  // If the user is already logged in, redirect to home page
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      company: "",
    },
  });

  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(values);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Login/Register Form */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-montserrat font-bold text-xl">RTA</span>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold font-montserrat text-gray-900">
                Welcome to RTA
              </CardTitle>
              <CardDescription className="text-center">
                Report Transfer Application for Ministerul Energiei al Republicii Moldova
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="login" value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="text-right">
                        <a href="#" className="text-sm text-primary hover:text-primary-dark font-medium">
                          Forgot password?
                        </a>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Logging in..." : "Log in"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Choose a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-500">
                {activeTab === "login" ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  className="text-primary hover:text-primary-dark font-medium"
                  onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
                >
                  {activeTab === "login" ? "Sign up" : "Log in"}
                </button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-primary to-primary-light text-white">
        <div className="max-w-lg px-8 text-center">
          <h1 className="text-4xl font-bold mb-6 font-montserrat">
            Report Transfer Application
          </h1>
          <p className="text-xl mb-8 text-white/80">
            A modern, secure platform for uploading, managing, and transferring critical documents for the energy sector.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="rounded-full bg-white/20 p-2">
                <Icon name="file-check" className="h-6 w-6 text-white" />
              </div>
              <p className="ml-4 text-left">
                Securely upload and manage Excel and Word documents
              </p>
            </div>
            
            <div className="flex items-center">
              <div className="rounded-full bg-white/20 p-2">
                <Icon name="users" className="h-6 w-6 text-white" />
              </div>
              <p className="ml-4 text-left">
                Access resident data from both internal and external registries
              </p>
            </div>
            
            <div className="flex items-center">
              <div className="rounded-full bg-white/20 p-2">
                <Icon name="shield" className="h-6 w-6 text-white" />
              </div>
              <p className="ml-4 text-left">
                Enterprise-grade security for sensitive energy sector data
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
