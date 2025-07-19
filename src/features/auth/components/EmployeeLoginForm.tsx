import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { generateEmployeeCode, validateEmployeeCode } from "@/services/auth.service";
import { emailSchema, otpSchema } from "@/lib/zod.schema";

type EmailForm = z.infer<typeof emailSchema>;
type OTPForm = z.infer<typeof otpSchema>;

export const EmployeeLoginForm = () => {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const otpForm = useForm<OTPForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      accessCode: "",
    },
  });

  // Mutation cho việc gửi mã OTP
  const sendCodeMutation = useMutation({
    mutationFn: (email: string) => generateEmployeeCode(email),
    onSuccess: () => {
      setStep("otp");
      otpForm.reset(); // Reset OTP form khi chuyển step
      toast.success("Mã xác thực đã được gửi đến email của bạn");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Mutation cho việc xác thực mã OTP
  const verifyCodeMutation = useMutation({
    mutationFn: ({
      email,
      accessCode,
    }: {
      email: string;
      accessCode: string;
    }) => validateEmployeeCode(email, accessCode),
    onSuccess: (response) => {
      if (response.user) {
        login(response.user);
        toast.success("Đăng nhập thành công!");
        navigate("/dashboard/employee");
      }
    },
    onError: (error) => {
      toast.error(error.message);
      otpForm.reset();
    },
  });

  const handleSendCode = (data: EmailForm) => {
    const emailValue = data.email?.trim();
    if (!emailValue) {
      toast.error("Vui lòng nhập email");
      return;
    }
    setEmail(emailValue);
    sendCodeMutation.mutate(emailValue);
  };

  const handleVerifyCode = (data: OTPForm) => {
    const accessCodeValue = data.accessCode?.trim();
    if (!accessCodeValue) {
      toast.error("Vui lòng nhập mã xác thực");
      return;
    }
    verifyCodeMutation.mutate({
      email,
      accessCode: accessCodeValue,
    });
  };

  const handleBackToEmail = () => {
    setStep("email");
    otpForm.reset(); // Reset OTP form khi quay lại
  };

  if (step === "email") {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Employee Login</CardTitle>
          <CardDescription>
            Nhập email của bạn để nhận mã xác thực
          </CardDescription>
        </CardHeader>
        <Form {...emailForm} key="email-form">
          <form
            className="flex flex-col gap-4"
            onSubmit={emailForm.handleSubmit(handleSendCode)}
          >
            <CardContent>
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="example@company.com"
                        type="email"
                        disabled={sendCodeMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={sendCodeMutation.isPending}
              >
                {sendCodeMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Gửi mã xác thực
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle>Nhập mã xác thực</CardTitle>
        <CardDescription>
          Nhập mã 6 số đã được gửi đến email {email}
        </CardDescription>
      </CardHeader>
      <Form {...otpForm} key="otp-form">
        <form className="flex flex-col gap-4" onSubmit={otpForm.handleSubmit(handleVerifyCode)}>
          <CardContent className="space-y-4">
            <FormField
              control={otpForm.control}
              name="accessCode"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center space-y-2">
                  <FormLabel>Mã xác thực</FormLabel>
                  <FormControl>
                    <InputOTP 
                      maxLength={6} 
                      disabled={verifyCodeMutation.isPending}
                      autoComplete="off"
                      {...field}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              type="submit"
              className="w-full"
              disabled={verifyCodeMutation.isPending}
            >
              {verifyCodeMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Xác thực
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleBackToEmail}
              disabled={verifyCodeMutation.isPending}
            >
              Quay lại
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}; 