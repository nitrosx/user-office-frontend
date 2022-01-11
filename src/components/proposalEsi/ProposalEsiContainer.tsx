/* eslint-disable @typescript-eslint/no-use-before-define */
import { default as React, useEffect } from 'react';

import Questionary from 'components/questionary/Questionary';
import {
  QuestionaryContext,
  QuestionaryContextType,
} from 'components/questionary/QuestionaryContext';
import { getQuestionaryDefinition } from 'components/questionary/QuestionaryRegistry';
import { TemplateGroupId } from 'generated/sdk';
import { usePrevious } from 'hooks/common/usePrevious';
import { ProposalEsiSubmissionState } from 'models/questionary/proposalEsi/ProposalEsiSubmissionState';
import { ProposalEsiWithQuestionary } from 'models/questionary/proposalEsi/ProposalEsiWithQuestionary';
import {
  Event,
  QuestionarySubmissionModel,
} from 'models/questionary/QuestionarySubmissionState';
import useEventHandlers from 'models/questionary/useEventHandlers';

export interface ProposalEsiContextType extends QuestionaryContextType {
  state: ProposalEsiSubmissionState | null;
}

const proposalEsiReducer = (
  state: ProposalEsiSubmissionState,
  draftState: ProposalEsiSubmissionState,
  action: Event
) => {
  switch (action.type) {
    case 'ESI_SAMPLE_CREATED':
      if (!draftState.esi.proposal.samples) {
        draftState.esi.proposal.samples = [];
      }
      draftState.esi.proposal.samples.push(action.sample);
      break;
    case 'ESI_ITEM_WITH_QUESTIONARY_CREATED':
      draftState.esi.sampleEsis.push(action.sampleEsi);
      break;
    case 'ESI_SAMPLE_ESI_UPDATED':
      draftState.esi.sampleEsis = draftState.esi.sampleEsis.map((sampleEsi) =>
        sampleEsi.sampleId === action.sampleEsi.sampleId
          ? action.sampleEsi
          : sampleEsi
      );
      break;
    case 'ESI_SAMPLE_ESI_DELETED':
      draftState.esi.sampleEsis = draftState.esi.sampleEsis.filter(
        (esi) => esi.sampleId !== action.sampleId
      );
      break;
    case 'ESI_SAMPLE_DELETED':
      draftState.esi.proposal.samples = draftState.esi.proposal.samples!.filter(
        (sample) => sample.id !== action.sampleId
      );
      break;
  }

  return draftState;
};

export interface ProposalEsiContainerProps {
  esi: ProposalEsiWithQuestionary;
}
export default function ProposalEsiContainer(props: ProposalEsiContainerProps) {
  const { eventHandlers } = useEventHandlers(TemplateGroupId.PROPOSAL_ESI);
  const def = getQuestionaryDefinition(TemplateGroupId.PROPOSAL_ESI);

  const previousInitialEsi = usePrevious(props.esi);

  const initialState = new ProposalEsiSubmissionState(
    props.esi,
    0,
    false,
    def.wizardStepFactory.getWizardSteps(props.esi.questionary.steps)
  );

  const { state, dispatch } =
    QuestionarySubmissionModel<ProposalEsiSubmissionState>(
      initialState,
      [eventHandlers],
      proposalEsiReducer
    );

  useEffect(() => {
    const isComponentMountedForTheFirstTime = previousInitialEsi === undefined;
    if (isComponentMountedForTheFirstTime) {
      dispatch({
        type: 'ITEM_WITH_QUESTIONARY_LOADED',
        itemWithQuestionary: props.esi,
      });
      dispatch({
        type: 'STEPS_LOADED',
        steps: props.esi.questionary!.steps,
      });
    }
  }, [previousInitialEsi, props.esi, dispatch]);

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <Questionary
        title={'Input for Experiment Safety Form'}
        displayElementFactory={def.displayElementFactory}
      />
    </QuestionaryContext.Provider>
  );
}
