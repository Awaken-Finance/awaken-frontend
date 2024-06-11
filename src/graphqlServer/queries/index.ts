import { gql } from '@apollo/client';

export const PAIR_SYNC_RECORDS_QUERY = gql`
  query pairSyncRecords($dto: GetPairSyncRecordsDto) {
    pairSyncRecords(dto: $dto) {
      chainId
      pairAddress
      symbolA
      symbolB
      reserveA
      reserveB
      timestamp
      blockHeight
      transactionHash
    }
  }
`;
