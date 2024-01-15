import { request } from 'api';

export async function getTransactionFee(): Promise<string> {
  const res: {
    code: number;
    data: {
      transactionFee: string;
    };
  } = await request.GET_TRANSACTION_FEE();
  return res?.data?.transactionFee;
}
