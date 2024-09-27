import { z } from 'zod';
import { KycIdEnum } from '../enums';

export const kycSchema = z.object({
  idType: z.nativeEnum(KycIdEnum, {
    errorMap: () => ({ message: 'Invalid ID type. Please choose a valid option.' }),
  }),
  idNumber: z.string().min(1, 'ID number is required.'),
  idExpiration: z.string().date('Invalid date format. Expected YYYY-MM-DD'),
});
