import { z } from "zod";

export const phoneSchema = z.object({
  phoneNumber: z.string().min(1, 'Số điện thoại không được để trống')
    .regex(/^0[3,5,7,8,9]\d{8}$/, 'Số điện thoại không hợp lệ (định dạng: 0xxxxxxxxx)')
})

export const emailSchema = z.object({
  email: z.string().min(1, 'Email không được để trống')
    .email('Email không hợp lệ')
})

export const otpSchema = z.object({
  accessCode: z.string().min(6, 'Mã xác thực phải có 6 số')
    .max(6, 'Mã xác thực phải có 6 số')
    .regex(/^\d{6}$/, 'Mã xác thực chỉ chứa số')
})