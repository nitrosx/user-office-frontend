import React, { FC } from 'react';

import { WizardStep } from 'models/QuestionarySubmissionState';

import QuestionaryStepView from './QuestionaryStepView';

export class DefaultStepDisplayElementFactory
  implements StepDisplayElementFactory {
  constructor(private reviewStep: FC<any>) {}

  getDisplayElement(wizardStep: WizardStep, isReadOnly: boolean) {
    switch (wizardStep.type) {
      case 'QuestionaryStep':
        return (
          <QuestionaryStepView
            readonly={isReadOnly}
            topicId={wizardStep.payload.topicId}
          />
        );
      case 'VisitReview':
      case 'ShipmentReview':
      case 'ProposalReview':
        return React.createElement(this.reviewStep);

      default:
        throw new Error(`Unknown step type ${wizardStep.type}`);
    }
  }
}

export interface StepDisplayElementFactory {
  getDisplayElement(
    wizardStep: WizardStep,
    isReadonly: boolean
  ): React.ReactNode;
}
