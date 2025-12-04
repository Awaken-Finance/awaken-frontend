export default function getTransactionId(result: any) {
  return result.TransactionId || result.transactionId || (result.data && result.data.TransactionId);
}

export function getLogs(result: any) {
  if (result.Logs) return result.Logs;
  if (result.data && result.data.Logs) return result.data.Logs;
  return null;
}
