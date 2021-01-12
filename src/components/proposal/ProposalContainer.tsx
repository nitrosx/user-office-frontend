/* eslint-disable @typescript-eslint/no-use-before-define */
import { Container } from '@material-ui/core';
import { default as React, useEffect } from 'react';

import { useCheckAccess } from 'components/common/Can';
import Questionary from 'components/questionary/Questionary';
import {
  QuestionaryContext,
  QuestionaryContextType,
} from 'components/questionary/QuestionaryContext';
import QuestionaryStepView from 'components/questionary/QuestionaryStepView';
import { Proposal, QuestionaryStep, UserRole } from 'generated/sdk';
import { usePrevious } from 'hooks/common/usePrevious';
import { usePersistProposalModel } from 'hooks/proposal/usePersistProposalModel';
import {
  ProposalSubmissionState,
  ProposalSubsetSumbission,
} from 'models/ProposalSubmissionState';
import {
  Event,
  EventType,
  QuestionarySubmissionModel,
  QuestionarySubmissionState,
  WizardStep,
} from 'models/QuestionarySubmissionState';
import { StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';

import ProposalSummary from './ProposalSummary';

export interface ProposalContextType extends QuestionaryContextType {
  state: ProposalSubmissionState | null;
}

const proposalReducer = (
  state: ProposalSubmissionState,
  draftState: ProposalSubmissionState,
  action: Event
) => {
  switch (action.type) {
    case EventType.PROPOSAL_CREATED:
    case EventType.PROPOSAL_LOADED:
      const proposal: Proposal = action.payload.proposal;
      draftState.isDirty = false;
      draftState.questionaryId = proposal.questionaryId;
      draftState.proposal = proposal;
      draftState.steps = proposal.questionary.steps;
      draftState.templateId = proposal.questionary.templateId;
      break;
    case EventType.PROPOSAL_MODIFIED:
      draftState.proposal = {
        ...draftState.proposal,
        ...action.payload.proposal,
      };
      draftState.isDirty = true;
      break;
    case EventType.QUESTIONARY_STEPS_LOADED: {
      draftState.proposal.questionary.steps = action.payload.questionarySteps;
      break;
    }
    case EventType.QUESTIONARY_STEP_ANSWERED:
      const updatedStep = action.payload.questionaryStep as QuestionaryStep;
      const stepIndex = draftState.proposal.questionary.steps.findIndex(
        step => step.topic.id === updatedStep.topic.id
      );
      draftState.proposal.questionary.steps[stepIndex] = updatedStep;

      break;
  }

  return draftState;
};

const isProposalSubmitted = (proposal: { submitted: boolean }) =>
  proposal.submitted;

const createQuestionaryWizardStep = (
  step: QuestionaryStep,
  index: number
): WizardStep => ({
  type: 'QuestionaryStep',
  payload: { topicId: step.topic.id, questionaryStepIndex: index },
  getMetadata: (state, payload) => {
    const proposalState = state as ProposalSubmissionState;
    const questionaryStep = state.steps[payload.questionaryStepIndex];

    return {
      title: questionaryStep.topic.title,
      isCompleted: questionaryStep.isCompleted,
      isReadonly:
        isProposalSubmitted(proposalState.proposal) ||
        (index > 0 && state.steps[index - 1].isCompleted === false),
    };
  },
});

const createReviewWizardStep = (): WizardStep => ({
  type: 'ProposalReview',
  getMetadata: state => {
    const proposalState = state as ProposalSubmissionState;
    const lastProposalStep = proposalState.steps[state.steps.length - 1];

    return {
      title: 'Review',
      isCompleted: isProposalSubmitted(proposalState.proposal),
      isReadonly:
        isProposalSubmitted(proposalState.proposal) ||
        lastProposalStep.isCompleted === false,
    };
  },
});

export default function ProposalContainer(props: {
  proposal: ProposalSubsetSumbission;
  proposalCreated?: (proposal: Proposal) => any;
  proposalUpdated?: (proposal: Proposal) => any;
}) {
  const isNonOfficer = !useCheckAccess([UserRole.USER_OFFICER]);

  const { api } = useDataApiWithFeedback();
  const { persistModel: persistProposalModel } = usePersistProposalModel();
  const previousInitialProposal = usePrevious(props.proposal);

  const createProposalWizardSteps = (): WizardStep[] => {
    const wizardSteps: WizardStep[] = [];
    const questionarySteps = props.proposal.questionary.steps;

    questionarySteps.forEach((step, index) =>
      wizardSteps.push(createQuestionaryWizardStep(step, index))
    );

    wizardSteps.push(createReviewWizardStep());

    return wizardSteps;
  };

  const displayElementFactory = (metadata: WizardStep, isReadonly: boolean) => {
    switch (metadata.type) {
      case 'QuestionaryStep':
        return (
          <QuestionaryStepView
            readonly={isReadonly}
            topicId={metadata.payload.topicId}
          />
        );
      case 'ProposalReview':
        return <ProposalSummary data={state} readonly={false} />;

      default:
        throw new Error(`Unknown step type ${metadata.type}`);
    }
  };

  /**
   * Returns true if reset was performed, false otherwise
   */
  const handleReset = async (): Promise<boolean> => {
    const proposalState = state as ProposalSubmissionState;
    if (proposalState.proposal.id === 0) {
      // if proposal is not created yet
      dispatch({
        type: EventType.PROPOSAL_LOADED,
        payload: { proposal: initialState.proposal },
      });
    } else {
      await api()
        .getProposal({ id: proposalState.proposal.id }) // or load blankQuestionarySteps if sample is null
        .then(data => {
          if (data.proposal && data.proposal.questionary.steps) {
            dispatch({
              type: EventType.PROPOSAL_LOADED,
              payload: { proposal: data.proposal },
            });
            dispatch({
              type: EventType.QUESTIONARY_STEPS_LOADED,
              payload: {
                questionarySteps: data.proposal.questionary.steps,
                stepIndex: state.stepIndex,
              },
            });
          }
        });
    }

    return true;
  };

  const handleEvents = ({
    getState,
    dispatch,
  }: MiddlewareInputParams<QuestionarySubmissionState, Event>) => {
    return (next: Function) => async (action: Event) => {
      next(action); // first update state/model
      const state = getState() as ProposalSubmissionState;
      switch (action.type) {
        case EventType.PROPOSAL_MODIFIED:
          props.proposalUpdated?.(action.payload.proposal);
          break;
        case EventType.PROPOSAL_CREATED:
          props.proposalCreated?.(action.payload.proposal);
          break;
        case EventType.BACK_CLICKED:
          if (!state.isDirty || (await handleReset())) {
            dispatch({ type: EventType.GO_STEP_BACK });
          }
          break;

        case EventType.RESET_CLICKED:
          handleReset();
          break;
      }
    };
  };
  const initialState: ProposalSubmissionState = {
    proposal: props.proposal,
    templateId: props.proposal.questionary.templateId,
    isDirty: false,
    questionaryId: props.proposal.questionary.questionaryId,
    stepIndex: 0,
    steps: props.proposal.questionary.steps,
    wizardSteps: createProposalWizardSteps(),
  };

  const { state, dispatch } = QuestionarySubmissionModel<
    ProposalSubmissionState
  >(initialState, [handleEvents, persistProposalModel], proposalReducer);

  useEffect(() => {
    const isComponentMountedForTheFirstTime =
      previousInitialProposal === undefined;
    if (isComponentMountedForTheFirstTime) {
      dispatch({
        type: EventType.PROPOSAL_LOADED,
        payload: { proposal: props.proposal },
      });
      dispatch({
        type: EventType.QUESTIONARY_STEPS_LOADED,
        payload: { questionarySteps: props.proposal.questionary.steps },
      });
    }
  }, [previousInitialProposal, props.proposal, dispatch]);

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <Container maxWidth="lg">
        <StyledPaper>
          <Questionary
            title={state.proposal.title || 'New Proposal'}
            info={
              state.proposal.shortCode
                ? `Proposal ID: ${state.proposal.shortCode}`
                : 'DRAFT'
            }
            handleReset={handleReset}
            displayElementFactory={displayElementFactory}
          />
        </StyledPaper>
      </Container>
    </QuestionaryContext.Provider>
  );
}
