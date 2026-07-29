import { z } from "zod";

const positiveId = z.coerce.number().int().positive();
const vietnamesePhone = /^(?:0|\+84)(?:3|5|7|8|9)\d{8}$/;

export const paginationQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    search: z.string().trim().max(100).default(""),
  })
  .strict();

export const restaurantParamsSchema = z
  .object({ restaurantId: positiveId })
  .strict();

export const foodListQuerySchema = paginationQuerySchema.extend({
  categoryId: positiveId.optional(),
  status: z.enum(["CON_BAN", "NGUNG_BAN"]).optional(),
});

export const createOrderSchema = z
  .object({
    restaurantId: positiveId,
    customer: z
      .object({
        fullName: z.string().trim().min(2).max(150),
        phone: z
          .string()
          .trim()
          .transform((value) => value.replace(/[\s.-]/g, ""))
          .refine((value) => vietnamesePhone.test(value), {
            message: "Số điện thoại Việt Nam không hợp lệ",
          }),
        deliveryAddress: z.string().trim().min(8).max(300),
      })
      .strict(),
    note: z.string().trim().max(500).optional(),
    paymentMethod: z.literal("COD"),
    items: z
      .array(
        z
          .object({
            foodId: positiveId,
            quantity: z.coerce.number().int().min(1).max(99),
          })
          .strict(),
      )
      .min(1)
      .max(50),
  })
  .strict();

export const orderLookupParamsSchema = z
  .object({ orderId: positiveId })
  .strict();

export const orderLookupQuerySchema = z
  .object({
    phone: z
      .string()
      .trim()
      .transform((value) => value.replace(/[\s.-]/g, ""))
      .refine((value) => vietnamesePhone.test(value), {
        message: "Số điện thoại Việt Nam không hợp lệ",
      }),
  })
  .strict();

export type RestaurantListQuery = z.infer<typeof paginationQuerySchema>;
export type RestaurantParams = z.infer<typeof restaurantParamsSchema>;
export type FoodListQuery = z.infer<typeof foodListQuerySchema>;
export type CreateOrderBody = z.infer<typeof createOrderSchema>;
export type OrderLookupParams = z.infer<typeof orderLookupParamsSchema>;
export type OrderLookupQuery = z.infer<typeof orderLookupQuerySchema>;
