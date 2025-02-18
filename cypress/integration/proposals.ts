import faker from 'faker';

import {
  AllocationTimeUnits,
  DataType,
  TemplateCategoryId,
  TemplateGroupId,
} from '../../src/generated/sdk';
import initialDBData from '../support/initialDBData';

context('Proposal tests', () => {
  const title = faker.lorem.words(2);
  const abstract = faker.lorem.words(3);
  const newProposalTitle = faker.lorem.words(2);
  const newProposalAbstract = faker.lorem.words(3);
  const proposalTitleUpdated = faker.lorem.words(2);
  const clonedProposalTitle = `Copy of ${newProposalTitle}`;
  const proposer = initialDBData.users.user1;
  const proposalWorkflow = {
    name: faker.random.words(2),
    description: faker.random.words(5),
  };
  let createdWorkflowId: number;
  let createdProposalPk: number;
  const textQuestion = faker.random.words(2);

  const currentDayStart = new Date();
  currentDayStart.setHours(0, 0, 0, 0);
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
  const twoDaysAgo = new Date(new Date().setDate(new Date().getDate() - 2));

  const newCall = {
    shortCode: faker.random.alphaNumeric(15),
    startCall: faker.date.past().toISOString().slice(0, 10),
    endCall: faker.date.future().toISOString().slice(0, 10),
    startReview: currentDayStart,
    endReview: currentDayStart,
    startSEPReview: currentDayStart,
    endSEPReview: currentDayStart,
    startNotify: currentDayStart,
    endNotify: currentDayStart,
    startCycle: currentDayStart,
    endCycle: currentDayStart,
    templateName: initialDBData.template.name,
    templateId: initialDBData.template.id,
    allocationTimeUnit: AllocationTimeUnits.DAY,
    cycleComment: faker.lorem.word(),
    surveyComment: faker.lorem.word(),
  };

  const createTopicAndQuestionToExistingTemplate = () => {
    cy.createTopic({
      templateId: initialDBData.template.id,
      sortOrder: 1,
    }).then((topicResult) => {
      if (topicResult.createTopic.template) {
        const topicId =
          topicResult.createTopic.template.steps[
            topicResult.createTopic.template.steps.length - 1
          ].topic.id;
        cy.createQuestion({
          categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
          dataType: DataType.TEXT_INPUT,
        }).then((result) => {
          if (result.createQuestion.question) {
            cy.updateQuestion({
              id: result.createQuestion.question.id,
              question: textQuestion,
            });

            cy.createQuestionTemplateRelation({
              templateId: initialDBData.template.id,
              sortOrder: 0,
              topicId: topicId,
              questionId: result.createQuestion.question.id,
            });
          }
        });
      }
    });
  };

  beforeEach(() => {
    cy.resetDB();
    cy.createTemplate({
      name: 'default esi template',
      groupId: TemplateGroupId.PROPOSAL_ESI,
    });
    cy.createProposalWorkflow({
      name: proposalWorkflow.name,
      description: proposalWorkflow.description,
    }).then((result) => {
      if (result.createProposalWorkflow.proposalWorkflow) {
        createdWorkflowId = result.createProposalWorkflow.proposalWorkflow.id;
      }
    });
    cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
      if (result.createProposal.proposal) {
        createdProposalPk = result.createProposal.proposal.primaryKey;

        cy.updateProposal({
          proposalPk: result.createProposal.proposal.primaryKey,
          title: newProposalTitle,
          abstract: newProposalAbstract,
          proposerId: proposer.id,
        });
      }
    });
    cy.viewport(1920, 1080);
  });

  it('Should be able create proposal', () => {
    cy.login('user');
    cy.visit('/');

    cy.contains('New Proposal').click();

    cy.get('[data-cy=principal-investigator] input').should(
      'contain.value',
      'Carl'
    );

    cy.get('[data-cy=edit-proposer-button]').click();

    cy.finishedLoading();

    cy.get('[data-cy=email]').type('ben@inbox.com');

    cy.get('[data-cy=findUser]').click();

    cy.contains('Benjamin').parent().find("[title='Select user']").click();

    cy.contains('Save and continue').click();

    cy.contains('Title is required');
    cy.contains('Abstract is required');

    cy.contains('New Proposal').click();

    cy.get('[data-cy=title] input').type(title).should('have.value', title);

    cy.get('[data-cy=abstract] textarea')
      .first()
      .type(abstract)
      .should('have.value', abstract);

    cy.get('[data-cy=edit-proposer-button]').click();
    cy.get('[role="presentation"]').as('modal');

    cy.get('@modal')
      .contains(proposer.firstName)
      .parent()
      .find("[title='Select user']")
      .click();

    cy.contains('Save and continue').click();

    cy.finishedLoading();

    cy.notification({ variant: 'success', text: 'Saved' });

    cy.contains('Dashboard').click();

    cy.contains(title).parent().contains('draft');

    cy.contains(title)
      .parent()
      .find('[title="Edit proposal"]')
      .should('exist')
      .click();

    cy.contains('Submit').click();

    cy.contains('OK').click();

    cy.contains('Dashboard').click();
    cy.contains(title);
    cy.contains('submitted');

    cy.get('[title="View proposal"]').should('exist');
  });

  it('Officer should be able to edit proposal', () => {
    cy.login('officer');
    cy.visit('/');

    cy.contains('Proposals').click();

    cy.contains(newProposalTitle)
      .parent()
      .find('[title="View proposal"]')
      .click();

    cy.contains('Edit proposal').click();

    cy.contains('New proposal').click();

    cy.get('[data-cy=title] input')
      .clear()
      .type(proposalTitleUpdated)
      .should('have.value', proposalTitleUpdated);

    cy.get('[data-cy=save-and-continue-button]').click();

    cy.contains('Close').click();

    cy.contains(proposalTitleUpdated);
  });

  it('User officer should be able to save proposal column selection', () => {
    cy.login('officer');
    cy.visit('/');

    cy.contains('Proposals').click();

    cy.get("[title='Show Columns']").first().click();
    cy.get('.MuiPopover-paper').contains('Call').click();
    cy.get('.MuiPopover-paper').contains('SEP').click();

    cy.get('body').click();

    cy.contains('Calls').click();

    cy.finishedLoading();

    cy.contains('Proposals').click();

    cy.contains('Call');
    cy.contains('SEP');
  });

  it('Should be able to see proposal allocation time unit on the proposal', () => {
    cy.login('officer');
    cy.visit('/');

    cy.contains('Proposals').click();

    cy.get("[title='Show Columns']").first().click();
    cy.get('.MuiPopover-paper').contains('Technical time allocation').click();
    cy.get('.MuiPopover-paper').contains('Final time allocation').click();

    cy.get('body').click();

    cy.contains(newProposalTitle)
      .parent()
      .find('[title="View proposal"]')
      .click();

    cy.contains('Technical review').click();

    cy.get('[data-cy="timeAllocation"] input').clear().type('10');

    cy.get('[data-cy="technical-review-status"]').click();
    cy.contains('Feasible').click();

    cy.get('[data-cy="save-technical-review"]').click();

    cy.closeModal();

    cy.contains(newProposalTitle).parent().contains('10(Days)');

    cy.contains('Calls').click();

    cy.finishedLoading();

    cy.get('[title="Edit"]').first().click();

    cy.get('[data-cy="call-workflow"]').click();
    cy.get('[role="presentation"]').contains(proposalWorkflow.name).click();

    cy.get('[data-cy="allocation-time-unit"]').click();
    cy.contains('Hour').click();

    cy.get('[data-cy="call-esi-template"]').click();
    cy.get('[role="listbox"] [tabindex="0"]').click();

    cy.get('[data-cy="next-step"]').click();
    cy.get('[data-cy="next-step"]').click();
    cy.get('[data-cy="submit"]').click();

    cy.notification({ variant: 'success', text: 'successfully' });

    cy.contains('Proposals').click();
    cy.contains(newProposalTitle).parent().contains('10(Hours)');
  });

  it('Should be able clone proposal to another call', () => {
    cy.createCall({
      ...newCall,
      proposalWorkflowId: createdWorkflowId,
    });
    cy.submitProposal({ proposalPk: createdProposalPk });

    cy.login('user');
    cy.visit('/');

    cy.contains(newProposalTitle);
    cy.contains('submitted');

    cy.get('[title="View proposal"]').should('exist');

    cy.get('[title="Clone proposal"]').first().click();

    cy.get('#selectedCallId-input').click();
    cy.get('#menu-selectedCallId').contains(newCall.shortCode).click();

    cy.get('[data-cy="submit"]').click();

    cy.notification({
      variant: 'success',
      text: 'Proposal cloned successfully',
    });

    cy.contains(clonedProposalTitle)
      .parent()
      .should('contain.text', newCall.shortCode);
  });

  it('User officer should be able to change status to one or multiple proposals', () => {
    cy.cloneProposals({
      callId: initialDBData.call.id,
      proposalsToClonePk: [createdProposalPk],
    });
    cy.login('officer');
    cy.visit('/');

    cy.get('[type="checkbox"]').first().check();

    cy.get('[data-cy="change-proposal-status"]').click();

    cy.get('[role="presentation"] .MuiDialogContent-root').as('dialog');
    cy.get('@dialog').contains('Change proposal/s status');

    cy.get('@dialog')
      .find('#selectedStatusId-input')
      .should('not.have.class', 'Mui-disabled');

    cy.get('@dialog').find('#selectedStatusId-input').click();

    cy.get('[role="listbox"]').contains('DRAFT').click();

    cy.get('[role="alert"] .MuiAlert-message').contains(
      'Be aware that changing status to "DRAFT" will reopen proposal for changes and submission.'
    );

    cy.get('[data-cy="submit-proposal-status-change"]').click();

    cy.notification({
      variant: 'success',
      text: 'status changed successfully',
    });

    cy.get('[data-cy="change-proposal-status"]').click();

    cy.get('[role="presentation"] .MuiDialogContent-root').as('dialog');
    cy.get('@dialog').contains('Change proposal/s status');

    cy.get('@dialog')
      .find('#selectedStatusId-input')
      .should('not.have.class', 'Mui-disabled');

    cy.get('@dialog').find('#selectedStatusId-input').click();

    cy.get('[role="listbox"]').contains('SEP Meeting').click();

    cy.get('[data-cy="submit-proposal-status-change"]').click();

    cy.notification({
      variant: 'success',
      text: 'status changed successfully',
    });

    cy.contains(newProposalTitle)
      .parent()
      .should('contain.text', 'SEP Meeting');
    cy.contains(clonedProposalTitle)
      .parent()
      .should('contain.text', 'SEP Meeting');
  });

  it('User officer should be able to see proposal status when opening change status modal', () => {
    cy.cloneProposals({
      callId: initialDBData.call.id,
      proposalsToClonePk: [createdProposalPk],
    });
    cy.changeProposalsStatus({
      statusId: initialDBData.proposalStatuses.sepMeeting.id,
      proposals: [
        { primaryKey: createdProposalPk, callId: initialDBData.call.id },
      ],
    });
    cy.login('officer');
    cy.visit('/');

    cy.contains(clonedProposalTitle).parent().find('[type="checkbox"]').check();

    cy.get('[data-cy="change-proposal-status"]').click();

    cy.finishedLoading();

    cy.get('[role="presentation"]')
      .find('input[name="selectedStatusId"]')
      .should('have.value', `${initialDBData.proposalStatuses.draft.id}`);

    cy.get('#selectedStatusId-input').should('have.text', 'DRAFT');

    // Close the modal
    cy.get('body').trigger('keydown', { keyCode: 27 });

    cy.contains(clonedProposalTitle)
      .parent()
      .find('[type="checkbox"]')
      .uncheck();

    cy.contains('SEP Meeting').parent().find('[type="checkbox"]').check();

    cy.get('[data-cy="change-proposal-status"]').click();

    cy.finishedLoading();

    cy.get('[role="presentation"]')
      .find('input[name="selectedStatusId"]')
      .should('have.value', `${initialDBData.proposalStatuses.sepMeeting.id}`);

    cy.get('#selectedStatusId-input').should('have.text', 'SEP Meeting');

    // Close the modal
    cy.get('body').trigger('keydown', { keyCode: 27 });

    cy.changeProposalsStatus({
      statusId: initialDBData.proposalStatuses.sepReview.id,
      proposals: [
        { primaryKey: createdProposalPk, callId: initialDBData.call.id },
      ],
    });

    cy.contains(newProposalTitle).parent().find('[type="checkbox"]').check();

    cy.get('[data-cy="change-proposal-status"]').click();

    cy.get('[role="presentation"]')
      .find('input[name="selectedStatusId"]')
      .should('not.have.value');

    cy.get('[data-cy="proposal-different-statuses-change"]')
      .should('exist')
      .should(
        'have.text',
        'Be aware that selected proposals have different statuses and changing status will affect all of them.'
      );
  });

  it('Should be able to delete proposal', () => {
    cy.login('user');
    cy.visit('/');

    cy.contains(newProposalTitle)
      .parent()
      .find('[title="Delete proposal"]')
      .click();

    cy.contains('OK').click();

    cy.contains(newProposalTitle).should('not.exist');
  });

  it('User should not be able to edit and submit proposal with inactive call', () => {
    createTopicAndQuestionToExistingTemplate();
    cy.login('user');
    cy.visit('/');

    cy.contains(newProposalTitle)
      .parent()
      .find('[title="Edit proposal"]')
      .click();

    cy.contains('Save and continue').click();

    cy.contains('label', textQuestion).then(($elem) => {
      cy.get(`#${$elem.attr('for')}`).type(faker.random.word());
    });
    cy.contains('Save and continue').click();
    cy.notification({ text: 'Saved', variant: 'success' });

    cy.updateCall({
      id: initialDBData.call.id,
      ...newCall,
      startCall: twoDaysAgo,
      endCall: yesterday,
      proposalWorkflowId: createdWorkflowId,
    });

    cy.visit('/');

    cy.contains(newProposalTitle)
      .parent()
      .find('[title="View proposal"]')
      .click();

    cy.contains('Submit').should('be.disabled');

    cy.contains('New topic', { matchCase: false }).click();

    cy.contains('label', textQuestion).then(($elem) => {
      cy.get(`#${$elem.attr('for')}`).then(($inputElem) => {
        expect($inputElem.css('pointer-events')).to.be.eq('none');
      });
    });

    cy.contains('Save and continue').should('not.exist');

    cy.contains('New proposal').click();

    cy.get('[data-cy="title"]').then(($inputElem) => {
      expect($inputElem.css('pointer-events')).to.be.eq('none');
    });

    cy.contains('Save and continue').should('not.exist');
  });
});
