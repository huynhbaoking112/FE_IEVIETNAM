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
import { generateOwnerCode, validateOwnerCode } from "@/services/auth.service";
import { phoneSchema, otpSchema } from "@/lib/zod.schema";

type PhoneForm = z.infer<typeof phoneSchema>;
type OTPForm = z.infer<typeof otpSchema>;

export const OwnerLoginForm = () => {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: "",
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
    mutationFn: (phoneNumber: string) => generateOwnerCode(phoneNumber),
    onSuccess: () => {
      setStep("otp");
      otpForm.reset(); // Reset OTP form khi chuyển step
      toast.success("Mã xác thực đã được gửi đến số điện thoại của bạn");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Mutation cho việc xác thực mã OTP
  const verifyCodeMutation = useMutation({
    mutationFn: ({
      phoneNumber,
      accessCode,
    }: {
      phoneNumber: string;
      accessCode: string;
    }) => validateOwnerCode(phoneNumber, accessCode),
    onSuccess: (response) => {
      if (response.user) {
        login(response.user);
        toast.success("Đăng nhập thành công!");
        navigate("/dashboard/owner");
      }
    },
    onError: (error) => {
      toast.error(error.message);
      otpForm.reset();
    },
  });

  const handleSendCode = (data: PhoneForm) => {
    const phoneValue = data.phoneNumber?.trim();
    if (!phoneValue) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }
    setPhoneNumber(phoneValue);
    sendCodeMutation.mutate(phoneValue);
  };

  const handleVerifyCode = (data: OTPForm) => {
    const accessCodeValue = data.accessCode?.trim();
    if (!accessCodeValue) {
      toast.error("Vui lòng nhập mã xác thực");
      return;
    }
    verifyCodeMutation.mutate({
      phoneNumber,
      accessCode: accessCodeValue,
    });
  };

  const handleBackToPhone = () => {
    setStep("phone");
    otpForm.reset();
  };

  if (step === "phone") {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Welcome to Task Management</CardTitle>
          <CardDescription>
            Nhập số điện thoại của bạn để nhận mã xác thực
          </CardDescription>
        </CardHeader>
        <Form {...phoneForm} key="phone-form">
          <form
            className="flex flex-col gap-4"
            onSubmit={phoneForm.handleSubmit(handleSendCode)}
          >
            <CardContent>
              <FormField
                control={phoneForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0xxxxxxxxx"
                        type="tel"
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
          Nhập mã 6 số đã được gửi đến số {phoneNumber}
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
              onClick={handleBackToPhone}
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
