/* eslint-disable @typescript-eslint/no-use-before-define */
import { default as React, useEffect } from 'react';

import Questionary from 'components/questionary/Questionary';
import {
  QuestionaryContext,
  QuestionaryContextType,
} from 'components/questionary/QuestionaryContext';
import { getQuestionaryDefinition } from 'components/questionary/QuestionaryRegistry';
import { QuestionaryStep, TemplateCategoryId } from 'generated/sdk';
import { usePrevious } from 'hooks/common/usePrevious';
import {
  Event,
  QuestionarySubmissionModel,
  QuestionarySubmissionState,
  WizardStep,
} from 'models/QuestionarySubmissionState';
import { SampleWithQuestionary } from 'models/Sample';
import { SampleSubmissionState } from 'models/SampleSubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

export interface SampleContextType extends QuestionaryContextType {
  state: SampleSubmissionState | null;
}

const samplesReducer = (
  state: SampleSubmissionState,
  draftState: SampleSubmissionState,
  action: Event
) => {
  switch (action.type) {
    case 'SAMPLE_CREATED':
    case 'SAMPLE_LOADED':
      draftState.isDirty = false;
      draftState.itemWithQuestionary = action.sample;
      break;
    case 'SAMPLE_MODIFIED':
      draftState.sample = {
        ...draftState.sample,
        ...action.sample,
      };
      draftState.isDirty = true;
      break;
    case 'STEP_ANSWERED':
      const updatedStep = action.step;
      const stepIndex = draftState.sample.questionary.steps.findIndex(
        (step) => step.topic.id === updatedStep.topic.id
      );
      draftState.sample.questionary.steps[stepIndex] = updatedStep;

      break;
  }

  return draftState;
};

const createQuestionaryWizardStep = (
  step: QuestionaryStep,
  index: number
): WizardStep => ({
  type: 'QuestionaryStep',
  payload: { topicId: step.topic.id, questionaryStepIndex: index },
  getMetadata: (state, payload) => {
    const questionaryStep =
      state.questionary.steps[payload.questionaryStepIndex];

    return {
      title: questionaryStep.topic.title,
      isCompleted: questionaryStep.isCompleted,
      isReadonly:
        index > 0 && state.questionary.steps[index - 1].isCompleted === false,
    };
  },
});

export function SampleDeclarationContainer(props: {
  sample: SampleWithQuestionary;
  sampleCreated?: (sample: SampleWithQuestionary) => void;
  sampleUpdated?: (sample: SampleWithQuestionary) => void;
  sampleEditDone?: () => void;
}) {
  const { api } = useDataApiWithFeedback();

  const def = getQuestionaryDefinition(TemplateCategoryId.SAMPLE_DECLARATION);

  const previousInitialSample = usePrevious(props.sample);

  const createSampleWizardSteps = (): WizardStep[] => {
    const wizardSteps: WizardStep[] = [];
    const questionarySteps = props.sample.questionary.steps;

    questionarySteps.forEach((step, index) =>
      wizardSteps.push(createQuestionaryWizardStep(step, index))
    );

    return wizardSteps;
  };

  /**
   * Returns true if reset was performed, false otherwise
   */
  const handleReset = async (): Promise<boolean> => {
    const sampleState = state as SampleSubmissionState;
    if (sampleState.sample.id === 0) {
      // if sample isn't created yet
      dispatch({
        type: 'SAMPLE_LOADED',
        sample: initialState.sample,
      });
    } else {
      await api()
        .getSample({ sampleId: sampleState.sample.id }) // or load blankQuestionarySteps if sample is null
        .then((data) => {
          if (data.sample && data.sample.questionary.steps) {
            dispatch({
              type: 'SAMPLE_LOADED',
              sample: data.sample,
            });
            dispatch({
              type: 'STEPS_LOADED',
              steps: data.sample.questionary.steps,
              stepIndex: state.stepIndex,
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
    return (next: FunctionType) => async (action: Event) => {
      next(action);
      const state = getState() as SampleSubmissionState;
      switch (action.type) {
        case 'SAMPLE_UPDATED':
          props.sampleUpdated?.({ ...state.sample, ...action.sample });
          break;
        case 'SAMPLE_CREATED':
          props.sampleCreated?.(action.sample);
          break;
        case 'SAMPLE_SUBMITTED':
          props.sampleEditDone?.();
          break;
        case 'BACK_CLICKED':
          if (!state.isDirty || (await handleReset())) {
            dispatch({ type: 'GO_STEP_BACK' });
          }
          break;
        case 'RESET_CLICKED':
          handleReset();
          break;
      }
    };
  };

  const initialState = new SampleSubmissionState(
    props.sample,
    0,
    false,
    createSampleWizardSteps()
  );

  const { state, dispatch } = QuestionarySubmissionModel<SampleSubmissionState>(
    initialState,
    [handleEvents],
    samplesReducer
  );

  useEffect(() => {
    const isComponentMountedForTheFirstTime =
      previousInitialSample === undefined;
    if (isComponentMountedForTheFirstTime) {
      dispatch({
        type: 'SAMPLE_LOADED',
        sample: props.sample,
      });
      dispatch({
        type: 'STEPS_LOADED',
        steps: props.sample.questionary.steps,
      });
    }
  }, [previousInitialSample, props.sample, dispatch]);

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <Questionary
        title={state.sample.title || 'New Sample'}
        handleReset={handleReset}
        displayElementFactory={def.displayElementFactory}
      />
    </QuestionaryContext.Provider>
  );
}
