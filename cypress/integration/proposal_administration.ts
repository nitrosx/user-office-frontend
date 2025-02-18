import faker from 'faker';

import { DataType, TemplateCategoryId } from '../../src/generated/sdk';
import initialDBData from '../support/initialDBData';

context('Proposal administration tests', () => {
  const proposalName1 = faker.lorem.words(3);
  const proposalName2 = faker.lorem.words(3);
  const proposalFixedName = '0000. Alphabetically first title';

  const textUser = faker.lorem.words(5);
  const textManager = faker.lorem.words(5);

  const answerDate = '2030-01-01';
  const answerMultipleChoice = 'One';
  const answerText = faker.lorem.words(3);
  const answerNumberInput = 99.9;
  const answerIntervalMin = 1;
  const answerIntervalMax = 100;

  const textQuestion = faker.lorem.words(3);
  const dateQuestion = faker.lorem.words(3);
  const boolQuestion = faker.lorem.words(3);
  const multipleChoiceQuestion = faker.lorem.words(3);
  const numberInputQuestion = faker.lorem.words(3);
  const fileUploadQuestion = faker.lorem.words(3);
  const intervalQuestion = faker.lorem.words(3);
  const existingUserId = 1;
  const existingTopicId = 1;
  const existingQuestionaryId = 1;

  let textQuestionId: string;
  let dateQuestionId: string;
  let boolQuestionId: string;
  let multipleChoiceQuestionId: string;
  let fileUploadQuestionId: string;
  let numberInputQuestionId: string;
  let intervalQuestionId: string;
  const createdTemplateId = 1;

  const createTemplateAndAllQuestions = () => {
    cy.createTopic({
      templateId: createdTemplateId,
      sortOrder: 1,
    }).then((topicResult) => {
      if (!topicResult.createTopic.template) {
        throw new Error('Can not create topic');
      }

      const topicId =
        topicResult.createTopic.template.steps[
          topicResult.createTopic.template.steps.length - 1
        ].topic.id;
      cy.createQuestion({
        categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
        dataType: DataType.INTERVAL,
      }).then((questionResult) => {
        if (questionResult.createQuestion.question) {
          intervalQuestionId = questionResult.createQuestion.question.id;

          cy.updateQuestion({
            id: intervalQuestionId,
            question: intervalQuestion,
          });

          cy.createQuestionTemplateRelation({
            questionId: intervalQuestionId,
            templateId: createdTemplateId,
            sortOrder: 0,
            topicId: topicId,
          });
        }
      });
      cy.createQuestion({
        categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
        dataType: DataType.BOOLEAN,
      }).then((questionResult) => {
        if (questionResult.createQuestion.question) {
          boolQuestionId = questionResult.createQuestion.question.id;

          cy.updateQuestion({
            id: boolQuestionId,
            question: boolQuestion,
          });

          cy.createQuestionTemplateRelation({
            questionId: boolQuestionId,
            templateId: createdTemplateId,
            sortOrder: 1,
            topicId: topicId,
          });
        }
      });
      cy.createQuestion({
        categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
        dataType: DataType.DATE,
      }).then((questionResult) => {
        if (questionResult.createQuestion.question) {
          dateQuestionId = questionResult.createQuestion.question.id;

          cy.updateQuestion({
            id: dateQuestionId,
            question: dateQuestion,
            config: '{"required":true}',
          });

          cy.createQuestionTemplateRelation({
            questionId: dateQuestionId,
            templateId: createdTemplateId,
            sortOrder: 2,
            topicId: topicId,
          });
        }
      });
      cy.createQuestion({
        categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
        dataType: DataType.SELECTION_FROM_OPTIONS,
      }).then((questionResult) => {
        if (questionResult.createQuestion.question) {
          multipleChoiceQuestionId = questionResult.createQuestion.question.id;

          cy.updateQuestion({
            id: multipleChoiceQuestionId,
            question: multipleChoiceQuestion,
            config:
              '{"variant":"dropdown","options":["One","Two","Three"],"isMultipleSelect":true}',
          });

          cy.createQuestionTemplateRelation({
            questionId: multipleChoiceQuestionId,
            templateId: createdTemplateId,
            sortOrder: 3,
            topicId: topicId,
          });
        }
      });
      cy.createQuestion({
        categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
        dataType: DataType.TEXT_INPUT,
      }).then((questionResult) => {
        if (questionResult.createQuestion.question) {
          textQuestionId = questionResult.createQuestion.question.id;

          cy.updateQuestion({
            id: textQuestionId,
            question: textQuestion,
          });

          cy.createQuestionTemplateRelation({
            questionId: textQuestionId,
            templateId: createdTemplateId,
            sortOrder: 4,
            topicId: topicId,
          });
        }
      });
      cy.createQuestion({
        categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
        dataType: DataType.FILE_UPLOAD,
      }).then((questionResult) => {
        if (questionResult.createQuestion.question) {
          fileUploadQuestionId = questionResult.createQuestion.question.id;

          cy.updateQuestion({
            id: fileUploadQuestionId,
            question: fileUploadQuestion,
          });

          cy.createQuestionTemplateRelation({
            questionId: fileUploadQuestionId,
            templateId: createdTemplateId,
            sortOrder: 5,
            topicId: topicId,
          });
        }
      });
      cy.createQuestion({
        categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
        dataType: DataType.NUMBER_INPUT,
      }).then((questionResult) => {
        if (questionResult.createQuestion.question) {
          numberInputQuestionId = questionResult.createQuestion.question.id;

          cy.updateQuestion({
            id: numberInputQuestionId,
            question: numberInputQuestion,
          });

          cy.createQuestionTemplateRelation({
            questionId: numberInputQuestionId,
            templateId: createdTemplateId,
            sortOrder: 6,
            topicId: topicId,
          });
        }
      });
    });
  };

  beforeEach(() => {
    cy.resetDB();
    cy.viewport(1920, 1080);
  });

  describe('Proposal administration advanced search filter tests', () => {
    beforeEach(() => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal.proposal) {
          cy.updateProposal({
            proposalPk: result.createProposal.proposal.primaryKey,
            proposerId: existingUserId,
            title: proposalName1,
            abstract: proposalName1,
          });
          cy.answerTopic({
            answers: [],
            topicId: existingTopicId,
            questionaryId: existingQuestionaryId,
            isPartialSave: false,
          });
          cy.submitProposal({
            proposalPk: result.createProposal.proposal.primaryKey,
          });
        }
      });
      cy.login('officer');
      cy.visit('/');
    });

    it('Should be able to set comment for user/manager and final status', () => {
      cy.contains('Proposals').click();

      cy.get('[data-cy=view-proposal]').click();
      cy.finishedLoading();
      cy.get('[role="dialog"]').contains('Admin').click();
      cy.get('#finalStatus-input').should('exist');
      cy.get('[role="dialog"]').contains('Logs').click();
      cy.get('[role="dialog"]').contains('Admin').click();

      cy.get('#finalStatus-input').click();

      cy.contains('Accepted').click();

      cy.get('[data-cy="managementTimeAllocation"] input')
        .clear()
        .type('-123')
        .blur();
      cy.contains('Must be greater than or equal to');

      cy.get('[data-cy="managementTimeAllocation"] input')
        .clear()
        .type('987654321')
        .blur();
      cy.contains('Must be less than or equal to');

      cy.get('[data-cy="managementTimeAllocation"] input').clear().type('20');

      cy.setTinyMceContent('commentForUser', textUser);
      cy.setTinyMceContent('commentForManagement', textManager);

      cy.on('window:confirm', (str) => {
        expect(str).to.equal(
          'Changes you recently made in this tab will be lost! Are you sure?'
        );

        return false;
      });

      cy.contains('Proposal information').click();

      cy.get('[data-cy="is-management-decision-submitted"]').click();

      cy.get('[data-cy="save-admin-decision"]').click();

      cy.notification({ variant: 'success', text: 'Saved' });

      cy.reload();

      cy.getTinyMceContent('commentForUser').then((content) =>
        expect(content).to.have.string(textUser)
      );

      cy.getTinyMceContent('commentForManagement').then((content) =>
        expect(content).to.have.string(textManager)
      );

      cy.get('[data-cy="managementTimeAllocation"] input').should(
        'have.value',
        '20'
      );

      cy.get('[data-cy="is-management-decision-submitted"] input').should(
        'have.value',
        'true'
      );

      cy.closeModal();

      cy.contains('Accepted');
      cy.contains('DRAFT');
    });

    it('Should be able to re-open proposal for submission', () => {
      cy.contains('Proposals').click();

      if (proposalName1) {
        cy.contains(proposalName1).parent().find('[type="checkbox"]').check();
      } else {
        cy.get('[type="checkbox"]').first().check();
      }

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

      cy.contains(proposalName1).parent().contains('No');

      cy.logout();

      cy.login('user');
      cy.visit('/');

      cy.contains(proposalName1)
        .parent()
        .get('[title="Edit proposal"]')
        .click();

      cy.finishedLoading();
      cy.contains(proposalName1);

      cy.contains('Submit').parent().should('not.be.disabled');
    });

    it('If you select a tab in tabular view and reload the page it should stay on specific selected tab', () => {
      cy.contains('Proposals').click();

      cy.get('[data-cy=view-proposal]').click();
      cy.finishedLoading();

      cy.get('[role="dialog"]').contains('Admin').click();

      cy.reload();

      cy.get('#commentForUser').should('exist');

      cy.get('[role="dialog"]').contains('Technical review').click();

      cy.reload();

      cy.get('[data-cy="timeAllocation"]').should('exist');
    });

    it('Download proposal is working with dialog window showing up', () => {
      cy.get('[data-cy="download-proposal"]').first().click();

      cy.get('[data-cy="preparing-download-dialog"]').should('exist');
      cy.get('[data-cy="preparing-download-dialog-item"]').contains(
        proposalName1
      );
    });

    it('Should be able to download proposal pdf', () => {
      cy.contains('Proposals').click();

      cy.request({
        url: '/download/pdf/proposal/1',
        method: 'GET',
        headers: {
          authorization: `Bearer ${Cypress.env('SVC_ACC_TOKEN')}`,
        },
      }).then((response) => {
        expect(response.headers['content-type']).to.be.equal('application/pdf');
        expect(response.status).to.be.equal(200);
      });
    });

    it('Should be able to save table selection state in url', () => {
      cy.contains('Proposals').click();

      cy.finishedLoading();

      cy.get('[type="checkbox"]').eq(1).click();

      cy.url().should('contain', 'selection=');

      cy.reload();

      cy.contains('1 row(s) selected');
    });

    it('Should be able to save table search state in url', () => {
      cy.contains('Proposals').click();

      cy.get('[placeholder="Search"]').type('test');

      cy.url().should('contain', 'search=test');

      cy.reload();

      cy.get('[placeholder="Search"]').should('have.value', 'test');
    });

    it('Should be able to save table sort state in url', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal.proposal) {
          cy.updateProposal({
            proposalPk: result.createProposal.proposal.primaryKey,
            proposerId: existingUserId,
            title: proposalFixedName,
            abstract: proposalName2,
          });
        }
      });
      let officerProposalsTableAsTextBeforeSort = '';
      let officerProposalsTableAsTextAfterSort = '';

      cy.contains('Proposals').click();

      cy.finishedLoading();

      cy.get('[data-cy="officer-proposals-table"] table').then((element) => {
        officerProposalsTableAsTextBeforeSort = element.text();
      });

      cy.contains('Title')
        .find('[data-testid="mtableheader-sortlabel"]')
        .dblclick();

      cy.get('[data-cy="officer-proposals-table"] table').then((element) => {
        officerProposalsTableAsTextAfterSort = element.text();
      });

      cy.reload();

      cy.finishedLoading();

      cy.get('[data-cy="officer-proposals-table"] table').then((element) => {
        expect(element.text()).to.be.equal(
          officerProposalsTableAsTextAfterSort
        );
        expect(element.text()).not.equal(officerProposalsTableAsTextBeforeSort);
      });

      cy.contains('Title')
        .find('[data-testid="mtableheader-sortlabel"]')
        .should('have.attr', 'aria-sort', 'Descendant');

      cy.contains('Calls').click();

      cy.finishedLoading();

      cy.contains('Short Code')
        .find('[data-testid="mtableheader-sortlabel"]')
        .click();

      cy.reload();

      cy.finishedLoading();

      cy.contains('Short Code')
        .find('[data-testid="mtableheader-sortlabel"]')
        .should('have.attr', 'aria-sort', 'Ascendant');
    });

    it('Should preserve the ordering when row is selected', () => {
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal.proposal) {
          cy.updateProposal({
            proposalPk: result.createProposal.proposal.primaryKey,
            title: proposalFixedName,
            abstract: proposalName2,
            proposerId: existingUserId,
          });
        }
      });
      cy.contains('Proposals').click();

      cy.finishedLoading();

      cy.get('table tbody tr').eq(0).contains(proposalFixedName);
      cy.contains('Title').dblclick();
      cy.get('table tbody tr').eq(1).contains(proposalFixedName);

      cy.get('table tbody tr input[type="checkbox"]').first().click();

      cy.get('table tbody tr').eq(1).contains(proposalFixedName);
    });

    it('User officer should see Reviews tab before doing the Admin(management decision)', () => {
      cy.contains('Proposals').click();

      cy.finishedLoading();

      cy.get('[data-cy=view-proposal]').first().click();
      cy.finishedLoading();
      cy.get('[role="dialog"]').contains('Reviews').click();

      cy.get('[role="dialog"]').contains('External reviews');
      cy.get('[role="dialog"]').contains('SEP Meeting decision');
    });
  });

  describe('Proposal administration advanced search tests', () => {
    beforeEach(() => {
      createTemplateAndAllQuestions();
      cy.login('user');
      cy.visit('/');
    });

    it('Should be able to search by question', () => {
      // Create a test proposal
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        if (result.createProposal.proposal) {
          cy.updateProposal({
            proposalPk: result.createProposal.proposal.primaryKey,
            title: proposalName2,
            abstract: proposalName2,
            proposerId: existingUserId,
          });
        }
      });

      cy.contains(proposalName2)
        .parent()
        .find('[title="Edit proposal"]')
        .click();
      cy.finishedLoading();
      cy.contains('Save and continue').click();

      cy.get(`#${boolQuestionId}`).click();

      cy.get(`[data-cy='${dateQuestionId}.value'] input`)
        .clear()
        .type(answerDate);

      cy.get(`#${multipleChoiceQuestionId}`).click();

      cy.contains(answerMultipleChoice).click();

      cy.get('body').type('{esc}');

      cy.get(`#${textQuestionId}`).clear().type(answerText);

      cy.get(`[data-cy='${numberInputQuestionId}.value'] input`)
        .clear()
        .type(answerNumberInput.toString());

      cy.get(`[data-cy='${intervalQuestionId}.min'] input`)
        .clear()
        .type(answerIntervalMin.toString());

      cy.get(`[data-cy='${intervalQuestionId}.max'] input`)
        .clear()
        .type(answerIntervalMax.toString());

      cy.contains('Save and continue').click();

      cy.logout();

      // search proposals
      cy.login('officer');
      cy.visit('/');

      cy.get('[data-cy=call-filter]').click();

      cy.get('[role=listbox]').contains('call 1').first().click();

      cy.get('[data-cy=question-search-toggle]').click();

      // Boolean questions
      cy.get('[data-cy=question-list]').click();

      cy.contains(boolQuestion).click();

      cy.get('[data-cy=is-checked]').click();

      cy.get('[role=listbox]').contains('No').click();

      cy.contains('Search').click();

      cy.contains(proposalName2).should('not.exist');

      cy.get('[data-cy=is-checked]').click();

      cy.get('[role=listbox]').contains('Yes').click();

      cy.contains('Search').click();

      cy.contains(proposalName2);

      // Date questions
      cy.get('[data-cy=question-list]').click();

      cy.contains(dateQuestion).click();

      cy.get('[data-cy=value] input').clear().type('2020-01-01');

      cy.contains('Search').click();

      cy.contains(proposalName2).should('not.exist');

      cy.get('[data-cy=comparator]').click();

      cy.get('[role=listbox]').contains('After').click();

      cy.contains('Search').click();

      cy.contains(proposalName2);

      // Multiple choice questions
      cy.get('[data-cy=question-list]').click();

      cy.contains(multipleChoiceQuestion).click();

      cy.get('[data-cy=value]').click();

      cy.get('[role=listbox]').contains('Two').click();

      cy.contains('Search').click();

      cy.contains(proposalName2).should('not.exist');

      cy.get('[data-cy=value]').click();

      cy.get('[role=listbox]').contains('One').click();

      cy.contains('Search').click();

      cy.contains(proposalName2);

      // Text questions
      cy.get('[data-cy=question-list]').click();

      cy.contains(textQuestion).click();

      cy.get('[name=value]').clear().type(faker.lorem.words(3));

      cy.contains('Search').click();

      cy.contains(proposalName2).should('not.exist');

      cy.get('[name=value]').clear().type(answerText);

      cy.contains('Search').click();

      cy.contains(proposalName2);

      // File upload questions
      cy.get('[data-cy=question-list]').click();

      cy.contains(fileUploadQuestion).click();

      cy.get('[data-cy=has-attachments]').click();

      cy.get('[role=listbox]').contains('Yes').click();

      cy.contains('Search').click();

      cy.contains(proposalName2).should('not.exist');

      cy.get('[data-cy=has-attachments]').click();

      cy.get('[role=listbox]').contains('No').click();

      cy.contains('Search').click();

      cy.contains(proposalName2);

      // NumberInput questions
      cy.get('[data-cy=question-list]').click();

      cy.contains(numberInputQuestion).click();

      // NumberInput questions - Less than
      cy.get('[data-cy=comparator]').click();

      cy.get('[role=listbox]').contains('Less than').click();

      cy.get('[data-cy=value] input')
        .clear()
        .type((answerNumberInput - 1).toString());

      cy.contains('Search').click();

      cy.contains(proposalName2).should('not.exist');

      cy.get('[data-cy=value] input')
        .clear()
        .type((answerNumberInput + 1).toString());

      cy.contains('Search').click();

      cy.contains(proposalName2).should('exist');

      // NumberInput questions - Equals
      cy.get('[data-cy=comparator]').click();

      cy.get('[role=listbox]').contains('Equals').click();

      cy.get('[data-cy=value] input')
        .clear()
        .type((answerNumberInput + 1).toString());

      cy.contains('Search').click();

      cy.contains(proposalName2).should('not.exist');

      cy.get('[data-cy=value] input')
        .clear()
        .type(answerNumberInput.toString());

      cy.contains('Search').click();

      cy.contains(proposalName2).should('exist');

      // NumberInput questions - Less than
      cy.get('[data-cy=comparator]').click();

      cy.get('[role=listbox]').contains('Less than').click();

      cy.get('[data-cy=value] input')
        .clear()
        .type((answerNumberInput - 1).toString());

      cy.contains('Search').click();

      cy.contains(proposalName2).should('not.exist');

      cy.get('[data-cy=value] input')
        .clear()
        .type((answerNumberInput + 1).toString());

      cy.contains('Search').click();

      cy.contains(proposalName2).should('exist');

      // Interval question
      cy.get('[data-cy=question-list]').click();

      cy.contains(intervalQuestion).click();

      // Interval question - Less than
      cy.get('[data-cy=comparator]').click();

      cy.get('[role=listbox]').contains('Less than').click();

      cy.get('[data-cy=value] input')
        .clear()
        .type(answerIntervalMax.toString());

      cy.contains('Search').click();

      cy.contains(proposalName2).should('not.exist');

      cy.get('[data-cy=value] input')
        .clear()
        .type((answerIntervalMax + 1).toString());

      cy.contains('Search').click();

      cy.contains(proposalName2).should('exist');

      // Interval question -  Greater than
      cy.get('[data-cy=comparator]').click();

      cy.get('[role=listbox]').contains('Greater than').click();

      cy.get('[data-cy=value] input')
        .clear()
        .type(answerIntervalMin.toString());

      cy.contains('Search').click();

      cy.contains(proposalName2).should('not.exist');

      cy.get('[data-cy=value] input')
        .clear()
        .type((answerIntervalMin - 1).toString());

      cy.contains('Search').click();

      cy.contains(proposalName2).should('exist');
    });
  });
});
