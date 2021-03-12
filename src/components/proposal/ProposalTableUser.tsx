import React, { useCallback, useState } from 'react';

import { Call, Maybe, ProposalPublicStatus } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { getProposalStatus } from 'utils/helperFunctions';
import { timeAgo } from 'utils/Time';

import ProposalTable from './ProposalTable';

export type PartialProposalsDataType = {
  id: number;
  title: string;
  status: string | null;
  publicStatus: ProposalPublicStatus;
  finalStatus?: string;
  notified?: boolean;
  submitted: boolean;
  shortCode: string;
  created: string | null;
  call: Maybe<Pick<Call, 'shortCode' | 'id'>>;
  proposerId?: number;
};

export type UserProposalDataType = {
  page: number;
  totalCount: number | undefined;
  data: PartialProposalsDataType[] | undefined;
};

const ProposalTableUser: React.FC = () => {
  const api = useDataApi();
  const [loading, setLoading] = useState<boolean>(false);

  const sendUserProposalRequest = useCallback(async () => {
    setLoading(true);

    return api()
      .getUserProposals()
      .then((data) => {
        setLoading(false);

        return {
          page: 0,
          totalCount: data?.me?.proposals.length,
          data: data?.me?.proposals
            .sort((a, b) => {
              return (
                new Date(b.created).getTime() - new Date(a.created).getTime()
              );
            })
            .map((proposal) => {
              return {
                id: proposal.id,
                title: proposal.title,
                status: getProposalStatus(proposal),
                publicStatus: proposal.publicStatus,
                submitted: proposal.submitted,
                shortCode: proposal.shortCode,
                created: timeAgo(proposal.created),
                notified: proposal.notified,
                proposerId: proposal.proposer?.id,
                call: proposal.call,
              };
            }),
        };
      });
  }, [api]);

  return (
    <ProposalTable
      title="My proposals"
      search={false}
      searchQuery={sendUserProposalRequest}
      isLoading={loading}
    />
  );
};

export default ProposalTableUser;
