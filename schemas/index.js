import { setLocale } from "yup";
import { es, id } from "yup-locales";
import { object, string, boolean } from "yup";

setLocale(es);

export const createTodoSchema = object({
   title: string().strict().required(),
  });

export const updateTodoSchema = object({
    id : string().strict().optional(),
    title: string().strict().optional(),
    completed: boolean().strict().optional(),
});

export const loginSchema = object({
  username: string().strict().required(),
  password: string().strict().required(),
});

