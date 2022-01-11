import { immerable } from 'immer';

import { Questionary } from 'generated/sdk';

import {
  QuestionarySubmissionState,
  WizardStep,
} from '../QuestionarySubmissionState';
import { ProposalWithQuestionary } from './ProposalWithQuestionary';

export class ProposalSubmissionState extends QuestionarySubmissionState {
  [immerable] = true;
  constructor(
    public proposal: ProposalWithQuestionary,
    stepIndex: number,
    isDirty: boolean,
    wizardSteps: WizardStep[]
  ) {
    super(proposal, stepIndex, isDirty, wizardSteps);
  }

  getItemId(): number {
    return this.proposal.primaryKey;
  }

  get itemWithQuestionary() {
    return this.proposal;
  }

  set itemWithQuestionary(item: { questionary: Questionary }) {
    this.proposal = { ...this.proposal, ...item };
  }
}
