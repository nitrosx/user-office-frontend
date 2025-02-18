import faker from 'faker';

import {
  ProposalEndStatus,
  TechnicalReviewStatus,
  UserRole,
} from '../../src/generated/sdk';
import initialDBData from '../support/initialDBData';

const sepMembers = {
  chair: initialDBData.users.user2,
  secretary: initialDBData.users.user1,
  reviewer: initialDBData.users.reviewer,
  reviewer2: initialDBData.users.user3,
};

function readWriteReview() {
  cy.get('[role="dialog"]').as('dialog');

  cy.finishedLoading();

  cy.get('@dialog').contains('Proposal information', { matchCase: false });
  cy.get('@dialog').contains('Technical review');
  cy.get('@dialog').contains('Grade').click();

  cy.setTinyMceContent('comment', faker.lorem.words(3));

  cy.get('@dialog').get('[data-cy="grade-proposal"]').click();

  cy.get('[role="listbox"] > [role="option"]').first().click();

  cy.get('@dialog').contains('Save').click();

  cy.notification({ variant: 'success', text: 'Updated' });

  cy.closeModal();

  cy.get('@dialog').should('not.exist');
}

function editFinalRankingForm() {
  cy.get('[role="dialog"] > header + div').scrollTo('top');

  cy.setTinyMceContent('commentForUser', faker.lorem.words(3));
  cy.setTinyMceContent('commentForManagement', faker.lorem.words(3));

  cy.contains('External reviews').parent().find('table').as('reviewsTable');

  cy.get('@reviewsTable').contains(sepMembers.reviewer.lastName);

  cy.get('[data-cy="save"]').click();

  cy.notification({
    variant: 'success',
    text: 'successfully',
  });
}

const sep1 = {
  code: faker.random.words(3),
  description: faker.random.words(8),
};

const sep2 = {
  code: faker.random.words(3),
  description: faker.random.words(8),
};

const proposal1 = {
  proposalTitle: faker.random.words(3),
  proposalAbstract: faker.random.words(5),
};

const proposal2 = {
  proposalTitle: faker.random.words(3),
};

const scientist = initialDBData.users.user1;

const instrument = {
  name: faker.random.words(2),
  shortCode: faker.random.alphaNumeric(15),
  description: faker.random.words(8),
  managerUserId: scientist.id,
};

let createdSepId: number;
let createdProposalId: number;

context(
  'Scientific evaluation panel proposal reviews and meeting component tests',
  () => {
    beforeEach(() => {
      cy.resetDB();
      cy.updateUserRoles({
        id: sepMembers.chair.id,
        roles: [initialDBData.roles.sepReviewer],
      });
      cy.updateUserRoles({
        id: sepMembers.secretary.id,
        roles: [initialDBData.roles.sepReviewer],
      });
      cy.updateUserRoles({
        id: sepMembers.reviewer.id,
        roles: [initialDBData.roles.sepReviewer],
      });

      cy.createSep({
        code: sep1.code,
        description: sep1.description,
        numberRatingsRequired: 2,
        active: true,
      }).then((result) => {
        if (result.createSEP.sep) {
          createdSepId = result.createSEP.sep.id;
        }
      });
      cy.createProposal({ callId: initialDBData.call.id }).then((result) => {
        const createdProposal = result.createProposal.proposal;
        if (createdProposal) {
          createdProposalId = createdProposal.primaryKey;

          cy.updateProposal({
            proposalPk: createdProposal.primaryKey,
            title: proposal1.proposalTitle,
            abstract: proposal1.proposalAbstract,
            proposerId: initialDBData.users.user1.id,
          });

          // Manually changing the proposal status to be shown in the SEPs. -------->
          cy.changeProposalsStatus({
            statusId: initialDBData.proposalStatuses.sepReview.id,
            proposals: [
              { callId: initialDBData.call.id, primaryKey: createdProposalId },
            ],
          });
        }
      });
      cy.viewport(1920, 1080);
    });

    describe('SEP proposal review tests as User officer role', () => {
      it('Officer should be able to assign proposal to existing SEP', () => {
        cy.login('officer');
        cy.visit('/');

        cy.contains('SEPs').click();
        cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

        cy.contains('Proposals and Assignments').click();

        cy.get('[data-cy="sep-assignments-table"]').should(
          'not.contain.text',
          proposal1.proposalTitle
        );

        cy.contains('Proposals').click();

        cy.contains(proposal1.proposalTitle)
          .parent()
          .find('[type="checkbox"]')
          .check();

        cy.get("[title='Assign proposals to SEP']").first().click();

        cy.get('#selectedSEPId-input').should('not.have.class', 'Mui-disabled');
        cy.get('#selectedSEPId-input').first().click();

        cy.contains(sep1.code).click();

        cy.get('[data-cy="submit"]').click();

        cy.notification({
          text: 'Proposal/s assigned to the selected SEP successfully',
          variant: 'success',
        });

        cy.contains('SEPs').click();
        cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

        cy.contains('Proposals and Assignments').click();

        cy.finishedLoading();

        cy.get('[data-cy="sep-assignments-table"]').should(
          'contain.text',
          proposal1.proposalTitle
        );
      });

      it('Officer should be able to see proposal details in modal inside proposals and assignments', () => {
        cy.assignProposalsToSep({
          sepId: createdSepId,
          proposals: [
            { callId: initialDBData.call.id, primaryKey: createdProposalId },
          ],
        });
        cy.login('officer');
        cy.visit('/');

        cy.contains('SEPs').click();
        cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

        cy.contains('Proposals and Assignments').click();

        cy.finishedLoading();

        cy.contains(proposal1.proposalTitle)
          .parent()
          .get('[title="View Proposal"]')
          .click();

        cy.finishedLoading();

        cy.get('[role="dialog"]').contains('Proposal information');
        cy.get('[role="dialog"]').contains('Technical review');

        cy.get('[role="dialog"]').contains(proposal1.proposalTitle);
        cy.get('[role="dialog"]').contains('Download PDF');

        cy.closeModal();
      });

      it('Proposal should contain standard deviation field inside proposals and assignments', () => {
        cy.assignProposalsToSep({
          sepId: createdSepId,
          proposals: [
            { callId: initialDBData.call.id, primaryKey: createdProposalId },
          ],
        });
        cy.login('officer');
        cy.visit('/');

        cy.contains('SEPs').click();
        cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

        cy.contains('Proposals and Assignments').click();

        cy.finishedLoading();

        cy.get('[data-cy="sep-assignments-table"] thead').contains('Deviation');
      });

      it('Officer should be able to assign SEP member to proposal in existing SEP', () => {
        cy.assignProposalsToSep({
          sepId: createdSepId,
          proposals: [
            { callId: initialDBData.call.id, primaryKey: createdProposalId },
          ],
        });
        cy.assignReviewersToSep({
          sepId: createdSepId,
          memberIds: [sepMembers.reviewer.id],
        });
        cy.login('officer');
        cy.visit('/');

        cy.contains('SEPs').click();
        cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

        cy.contains('Proposals and Assignments').click();

        cy.finishedLoading();

        cy.get("[title='Assign SEP Member']").first().click();

        cy.finishedLoading();

        cy.get('[role="dialog"]')
          .contains(sepMembers.reviewer.lastName)
          .parent()
          .find('input[type="checkbox"]')
          .click();
        cy.contains('1 user(s) selected');
        cy.contains('Update').click();

        cy.notification({
          variant: 'success',
          text: 'Members assigned',
        });

        cy.get('[role="dialog"]').should('not.exist');
        cy.get("[title='Show Reviewers']").first().click();
        cy.contains(sepMembers.reviewer.lastName);

        cy.contains('Logs').click();

        cy.finishedLoading();

        cy.contains('SEP_MEMBER_ASSIGNED_TO_PROPOSAL');
      });

      it('Officer should be able to read/write reviews', () => {
        cy.assignProposalsToSep({
          sepId: createdSepId,
          proposals: [
            { callId: initialDBData.call.id, primaryKey: createdProposalId },
          ],
        });
        cy.assignReviewersToSep({
          sepId: createdSepId,
          memberIds: [sepMembers.reviewer.id],
        });
        cy.assignSepReviewersToProposal({
          sepId: createdSepId,
          memberIds: [sepMembers.reviewer.id],
          proposalPk: createdProposalId,
        });
        cy.login('officer');
        cy.visit('/');

        cy.contains('SEPs').click();
        cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

        cy.contains('Proposals and Assignments').click();
        cy.finishedLoading();

        cy.get('[title="Show Reviewers"]').click();

        cy.contains(sepMembers.reviewer.lastName)
          .parent()
          .find('[title="Review proposal"]')
          .click();
        readWriteReview();
      });

      it('Officer should get error when trying to delete proposal which has dependencies (like reviews)', () => {
        cy.assignProposalsToSep({
          sepId: createdSepId,
          proposals: [
            { callId: initialDBData.call.id, primaryKey: createdProposalId },
          ],
        });
        cy.assignReviewersToSep({
          sepId: createdSepId,
          memberIds: [sepMembers.reviewer.id],
        });
        cy.assignSepReviewersToProposal({
          sepId: createdSepId,
          memberIds: [sepMembers.reviewer.id],
          proposalPk: createdProposalId,
        });
        cy.login('officer');
        cy.visit('/');

        cy.contains('Proposals').click();

        cy.get('[type="checkbox"]').first().check();

        cy.get('[title="Delete proposals"]').click();
        cy.get('[data-cy="confirm-ok"]').click();

        cy.notification({
          variant: 'error',
          text: 'Failed to delete proposal because, it has dependencies which need to be deleted first',
        });
      });
    });

    describe('SEP proposal review tests as SEP Chair role', () => {
      beforeEach(() => {
        cy.assignChairOrSecretary({
          assignChairOrSecretaryToSEPInput: {
            sepId: createdSepId,
            userId: sepMembers.chair.id,
            roleId: UserRole.SEP_CHAIR,
          },
        });
        cy.assignProposalsToSep({
          sepId: createdSepId,
          proposals: [
            { callId: initialDBData.call.id, primaryKey: createdProposalId },
          ],
        });
        cy.assignReviewersToSep({
          sepId: createdSepId,
          memberIds: [sepMembers.reviewer.id],
        });

        cy.login(sepMembers.chair);
        cy.changeActiveRole(initialDBData.roles.sepChair);
        cy.visit('/');
      });

      it('SEP Chair should be able to assign SEP member to proposal in existing SEP', () => {
        cy.contains('SEPs').click();
        cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

        cy.contains('Proposals and Assignments').click();

        cy.finishedLoading();

        cy.get("[title='Assign SEP Member']").first().click();

        cy.finishedLoading();

        cy.get('[role="dialog"]')
          .contains(sepMembers.chair.lastName)
          .parent()
          .find('input[type="checkbox"]')
          .click();
        cy.contains('1 user(s) selected');
        cy.contains('Update').click();

        cy.notification({
          variant: 'success',
          text: 'Members assigned',
        });

        cy.get('[role="dialog"]').should('not.exist');
        cy.get("[title='Show Reviewers']").first().click();

        cy.contains(sepMembers.chair.lastName);
      });

      it('SEP Chair should be able to see proposal details in modal inside proposals and assignments', () => {
        cy.contains('SEPs').click();
        cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

        cy.contains('Proposals and Assignments').click();
        cy.finishedLoading();

        cy.contains(proposal1.proposalTitle)
          .parent()
          .get('[title="View Proposal"]')
          .click();

        cy.finishedLoading();

        cy.get('[role="dialog"]').contains('Proposal information');
        cy.get('[role="dialog"]').contains('Technical review');

        cy.get('[role="dialog"]').contains(proposal1.proposalTitle);
        cy.get('[role="dialog"]').contains('Download PDF');
      });

      it('SEP Chair should be able to read/write reviews', () => {
        cy.assignSepReviewersToProposal({
          sepId: createdSepId,
          memberIds: [sepMembers.reviewer.id],
          proposalPk: createdProposalId,
        });

        cy.contains('SEPs').click();
        cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

        cy.contains('Proposals and Assignments').click();
        cy.finishedLoading();

        cy.get('[title="Show Reviewers"]').click();

        cy.contains(sepMembers.reviewer.lastName)
          .parent()
          .find('[title="Review proposal"]')
          .click();
        readWriteReview();
      });
    });

    describe('SEP proposal review tests as SEP Secretary role', () => {
      beforeEach(() => {
        cy.assignChairOrSecretary({
          assignChairOrSecretaryToSEPInput: {
            sepId: createdSepId,
            userId: sepMembers.secretary.id,
            roleId: UserRole.SEP_SECRETARY,
          },
        });
        cy.assignProposalsToSep({
          sepId: createdSepId,
          proposals: [
            { callId: initialDBData.call.id, primaryKey: createdProposalId },
          ],
        });
        cy.assignReviewersToSep({
          sepId: createdSepId,
          memberIds: [sepMembers.reviewer.id],
        });
        cy.login(sepMembers.secretary);
        cy.changeActiveRole(initialDBData.roles.sepSecretary);
        cy.visit('/');
      });

      it('SEP Secretary should be able to assign SEP member to proposal in existing SEP', () => {
        cy.contains('SEPs').click();
        cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

        cy.contains('Proposals and Assignments').click();

        cy.finishedLoading();

        cy.get("[title='Assign SEP Member']").first().click();

        cy.finishedLoading();

        cy.get('[role="dialog"]')
          .contains(sepMembers.secretary.lastName)
          .parent()
          .find('input[type="checkbox"]')
          .click();
        cy.contains('1 user(s) selected');
        cy.contains('Update').click();

        cy.notification({
          variant: 'success',
          text: 'Members assigned',
        });

        cy.get('[role="dialog"]').should('not.exist');
        cy.get("[title='Show Reviewers']").first().click();

        cy.contains(sepMembers.secretary.lastName);
      });

      it('SEP Secretary should be able to read/write reviews', () => {
        cy.assignSepReviewersToProposal({
          sepId: createdSepId,
          memberIds: [sepMembers.reviewer.id],
          proposalPk: createdProposalId,
        });

        cy.contains('SEPs').click();
        cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

        cy.contains('Proposals and Assignments').click();
        cy.finishedLoading();

        cy.get('[title="Show Reviewers"]').click();

        cy.contains(sepMembers.reviewer.lastName)
          .parent()
          .find('[title="Review proposal"]')
          .click();
        readWriteReview();
      });

      it('SEP Secretary should be able to read/write reviews', () => {
        cy.assignSepReviewersToProposal({
          sepId: createdSepId,
          memberIds: [sepMembers.reviewer.id],
          proposalPk: createdProposalId,
        });

        cy.contains('SEPs').click();
        cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

        cy.contains('Proposals and Assignments').click();
        cy.finishedLoading();

        cy.get('[title="Show Reviewers"]').click();

        cy.contains(sepMembers.reviewer.lastName)
          .parent()
          .find('[title="Review proposal"]')
          .click();
        readWriteReview();
      });
    });

    describe('SEP proposal review tests as SEP Reviewer role', () => {
      beforeEach(() => {
        cy.assignProposalsToSep({
          sepId: createdSepId,
          proposals: [
            { callId: initialDBData.call.id, primaryKey: createdProposalId },
          ],
        });
        cy.assignReviewersToSep({
          sepId: createdSepId,
          memberIds: [sepMembers.reviewer.id],
        });
        cy.assignSepReviewersToProposal({
          sepId: createdSepId,
          memberIds: [sepMembers.reviewer.id],
          proposalPk: createdProposalId,
        });
        cy.login(sepMembers.reviewer);
        cy.visit('/');
      });

      it('SEP Reviewer should be able to filter their reviews by status and bulk submit them', () => {
        cy.get('[data-cy="review-status-filter"]').click();
        cy.get('[role="listbox"]').contains('Draft').click();

        cy.finishedLoading();

        cy.contains(proposal1.proposalTitle);

        cy.get('[data-cy="review-status-filter"]').click();
        cy.get('[role="listbox"]').contains('Submitted').click();

        cy.finishedLoading();

        cy.contains('No records to display');
        cy.contains(proposal1.proposalTitle).should('not.exist');

        cy.get('[data-cy="review-status-filter"]').click();
        cy.get('[role="listbox"]').contains('All').click();

        cy.finishedLoading();

        cy.contains(proposal1.proposalTitle).parent().contains('Draft');

        cy.contains(proposal1.proposalTitle)
          .parent()
          .find('input[type="checkbox"]')
          .check();

        cy.get('[data-cy="submit-proposal-reviews"]').click();

        cy.get('[data-cy="confirm-ok"]').click();

        cy.notification({
          variant: 'success',
          text: 'Proposal review submitted successfully!',
        });

        cy.contains(proposal1.proposalTitle).parent().contains('Submitted');
      });
    });

    describe('SEP meeting components tests', () => {
      let createdInstrumentId: number;

      beforeEach(() => {
        cy.assignProposalsToSep({
          sepId: createdSepId,
          proposals: [
            { callId: initialDBData.call.id, primaryKey: createdProposalId },
          ],
        });
        cy.assignReviewersToSep({
          sepId: createdSepId,
          memberIds: [sepMembers.reviewer.id],
        });
        cy.assignSepReviewersToProposal({
          sepId: createdSepId,
          memberIds: [sepMembers.reviewer.id],
          proposalPk: createdProposalId,
        });
        cy.updateUserRoles({
          id: scientist.id,
          roles: [initialDBData.roles.instrumentScientist],
        });
        cy.addProposalTechnicalReview({
          proposalPk: createdProposalId,
          status: TechnicalReviewStatus.FEASIBLE,
          timeAllocation: 25,
          submitted: true,
          reviewerId: 0,
        });
        cy.createInstrument(instrument).then((result) => {
          const createdInstrument = result.createInstrument.instrument;
          if (createdInstrument) {
            createdInstrumentId = createdInstrument.id;

            cy.assignInstrumentToCall({
              callId: initialDBData.call.id,
              instrumentIds: [createdInstrumentId],
            });
            cy.assignProposalsToInstrument({
              instrumentId: createdInstrumentId,
              proposals: [
                {
                  callId: initialDBData.call.id,
                  primaryKey: createdProposalId,
                },
              ],
            });

            cy.setInstrumentAvailabilityTime({
              callId: initialDBData.call.id,
              instrumentId: createdInstrumentId,
              availabilityTime: 20,
            });
          }
        });
      });

      describe('SEP meeting components tests as User Officer role', () => {
        it('Officer should be able to assign proposal to instrument and instrument to call to see it in meeting components', () => {
          cy.login('officer');
          cy.visit('/');

          cy.contains('SEPs').click();

          cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

          cy.contains('Meeting Components').click();

          cy.finishedLoading();

          cy.contains(instrument.name);

          cy.get("[title='Submit instrument']").should('exist');

          cy.get("[title='Show proposals']").first().click();

          cy.get('[data-cy="sep-instrument-proposals-table"] thead').contains(
            'Deviation'
          );

          cy.get(
            '[data-cy="sep-instrument-proposals-table"] [title="View proposal details"]'
          ).click();

          cy.finishedLoading();

          cy.contains('SEP Meeting form');
          cy.contains('Proposal details');
          cy.contains('External reviews');

          cy.closeModal();
        });

        it('Officer should not be able to submit an instrument if all proposals are not submitted in SEP meetings', () => {
          cy.login('officer');
          cy.visit('/');

          cy.contains('SEPs').click();
          cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

          cy.contains('Meeting Components').click();

          cy.finishedLoading();

          cy.get("[title='Submit instrument']").first().click();

          cy.get('[data-cy="confirm-ok"]').click();

          cy.notification({
            variant: 'error',
            text: 'All proposal SEP meetings should be submitted',
          });

          cy.contains('Proposals and Assignments').click();

          cy.finishedLoading();

          cy.contains('Meeting Components').click();

          cy.finishedLoading();

          cy.get('[title="Submit instrument"]').should('not.be.disabled');
        });

        it('Officer should be able to see proposals that are marked red if they do not fit in availability time', () => {
          cy.login('officer');
          cy.visit('/');

          cy.contains('SEPs').click();

          cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

          cy.contains('Meeting Components').click();

          cy.finishedLoading();

          cy.get('[title="Show proposals"]').first().click();
          cy.get(
            '[data-cy="sep-instrument-proposals-table"] tbody tr:last-child'
          ).should('have.css', 'background-color', 'rgb(246, 104, 94)');
        });

        it('Officer should be able to edit SEP Meeting form', () => {
          cy.login('officer');
          cy.visit('/');

          cy.contains('SEPs').click();
          cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

          cy.contains('Meeting Components').click();
          cy.finishedLoading();

          cy.get('[title="Show proposals"]').click();

          cy.finishedLoading();

          cy.get('[title="View proposal details"]').click();

          editFinalRankingForm();
        });

        it('Officer should be able to see calculated availability time on instrument per SEP inside meeting components', () => {
          cy.setInstrumentAvailabilityTime({
            callId: initialDBData.call.id,
            instrumentId: createdInstrumentId,
            availabilityTime: 50,
          });
          cy.createProposal({ callId: initialDBData.call.id }).then(
            (proposalResult) => {
              const createdProposal = proposalResult.createProposal.proposal;
              if (createdProposal) {
                cy.updateProposal({
                  proposalPk: createdProposal.primaryKey,
                  title: proposal2.proposalTitle,
                });
                cy.createSep({
                  code: sep2.code,
                  description: sep2.description,
                  active: true,
                  numberRatingsRequired: 2,
                }).then((sepResult) => {
                  if (sepResult.createSEP.sep) {
                    cy.assignProposalsToSep({
                      sepId: sepResult.createSEP.sep.id,
                      proposals: [
                        {
                          callId: initialDBData.call.id,
                          primaryKey: createdProposal.primaryKey,
                        },
                      ],
                    });
                  }
                });

                cy.assignProposalsToInstrument({
                  instrumentId: createdInstrumentId,
                  proposals: [
                    {
                      callId: initialDBData.call.id,
                      primaryKey: createdProposal.primaryKey,
                    },
                  ],
                });
              }
            }
          );

          cy.login('officer');
          cy.visit('/');

          cy.contains('SEPs').click();

          cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

          cy.contains('Meeting Components').click();

          cy.finishedLoading();

          cy.get(
            '[data-cy="SEP-meeting-components-table"] tbody tr:first-child td'
          )
            .eq(5)
            .should('have.text', '25');
        });

        it('Officer should be able to set SEP time allocation', () => {
          cy.login('officer');
          cy.visit('/');

          cy.contains('SEPs').click();

          cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

          cy.contains('Meeting Components').click();

          cy.finishedLoading();

          cy.get('[title="Show proposals"]').click();

          cy.get('[title="View proposal details"]').click();

          cy.get('[data-cy="edit-sep-time-allocation"]').scrollIntoView();
          cy.get('[data-cy="edit-sep-time-allocation"]').click();

          cy.get('[data-cy="sepTimeAllocation"] input').as('timeAllocation');

          cy.get('@timeAllocation').should('have.value', '');

          cy.get('@timeAllocation').type('-1').blur();
          cy.contains('Must be greater than or equal to');

          cy.get('@timeAllocation').clear().type('987654321').blur();
          cy.contains('Must be less than or equal to');

          cy.get('@timeAllocation').clear().type('9999');
          cy.get('[data-cy="save-time-allocation"]').click();

          cy.finishedLoading();

          cy.contains('9999 (Overwritten)');

          cy.closeModal();
          cy.contains('9999');

          cy.reload();
          cy.contains('Meeting Components').click();
          cy.get('[title="Show proposals"]').click();

          cy.get('[title="View proposal details"]').click();

          cy.get('[data-cy="edit-sep-time-allocation"]').click();
          cy.get('@timeAllocation').should('have.value', '9999');
          cy.get('@timeAllocation').clear();
          cy.get('[data-cy="save-time-allocation"]').click();

          cy.finishedLoading();

          cy.get('body').should('not.contain', '9999 (Overwritten)');

          cy.closeModal();
        });

        it('should use SEP time allocation (if set) when calculating if they fit in available time', () => {
          cy.login('officer');
          cy.visit('/');
          cy.contains('SEPs').click();

          cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

          cy.contains('Meeting Components').click();

          cy.finishedLoading();

          cy.get('[title="Show proposals"]').click();

          cy.get(
            '[data-cy="sep-instrument-proposals-table"] tbody tr:last-child'
          ).should('have.css', 'background-color', 'rgb(246, 104, 94)');

          cy.get('[title="View proposal details"]').click();

          cy.get('[data-cy="edit-sep-time-allocation"]').scrollIntoView();
          cy.get('[data-cy="edit-sep-time-allocation"]').click();

          cy.get('[data-cy="sepTimeAllocation"] input').as('timeAllocation');

          cy.get('@timeAllocation').should('be.empty');
          cy.get('@timeAllocation').type('15');
          cy.get('[data-cy="save-time-allocation"]').click();

          cy.finishedLoading();

          cy.contains('15 (Overwritten)');

          cy.closeModal();

          cy.get(
            '[data-cy="sep-instrument-proposals-table"] tbody tr:last-child'
          ).should('not.have.css', 'background-color', 'rgb(246, 104, 94)');
        });

        it('Officer should be able to submit an instrument if all proposals SEP meetings are submitted in existing SEP', () => {
          cy.login('officer');
          cy.visit('/');

          cy.contains('SEPs').click();
          cy.contains(sep1.code).parent().find('button[title="Edit"]').click(); // NOTE:

          cy.contains('Meeting Components').click();

          cy.finishedLoading();

          cy.get('[title="Show proposals"]').first().click();

          cy.get('[title="View proposal details"]').first().click();

          cy.get('[role="dialog"] > header + div').scrollTo('top');

          cy.setTinyMceContent('commentForUser', 'Test');
          cy.setTinyMceContent('commentForManagement', 'Test');

          cy.get('[data-cy="is-sep-meeting-submitted"]').click();
          cy.get('[data-cy="saveAndContinue"]').click();

          cy.notification({
            variant: 'success',
            text: 'SEP meeting decision submitted successfully',
          });

          cy.get("[title='Submit instrument']").first().click();

          cy.get('[data-cy="confirm-ok"]').click();

          cy.notification({
            variant: 'success',
            text: 'Instrument submitted',
          });

          cy.get('[data-cy="sep-instrument-proposals-table"] tbody tr')
            .first()
            .find('td')
            .eq(6)
            .should('not.contain.text', '-')
            .should('contain.text', '1');

          cy.contains('Proposals and Assignments').click();

          cy.finishedLoading();

          cy.contains('Meeting Components').click();

          cy.finishedLoading();

          cy.get('[title="Submit instrument"] button').should('be.disabled');
        });

        it('Officer should be able to edit SEP Meeting form after instrument is submitted', () => {
          cy.saveSepMeetingDecision({
            saveSepMeetingDecisionInput: {
              proposalPk: createdProposalId,
              submitted: true,
              recommendation: ProposalEndStatus.ACCEPTED,
            },
          });
          cy.submitInstrument({
            callId: initialDBData.call.id,
            instrumentId: createdInstrumentId,
            sepId: createdSepId,
          });
          cy.login('officer');
          cy.visit('/');

          cy.contains('SEPs').click();
          cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

          cy.contains('Meeting Components').click();
          cy.finishedLoading();

          cy.get('[title="Submit instrument"] button').should('be.disabled');

          cy.get('[title="Show proposals"]').click();

          cy.finishedLoading();

          cy.get('[title="View proposal details"]').click();

          editFinalRankingForm();
        });

        it('Download SEP is working with dialog window showing up', () => {
          cy.login('officer');
          cy.visit('/');

          cy.contains('SEPs').click();
          cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

          cy.contains('Meeting Components').click();

          cy.finishedLoading();

          cy.get('[data-cy="download-sep-xlsx"]').click();

          cy.get('[data-cy="preparing-download-dialog"]').should('exist');
          cy.get('[data-cy="preparing-download-dialog-item"]').contains(
            'call 1'
          );
        });

        it('Officer should be able to remove assigned SEP member from proposal in existing SEP', () => {
          cy.login('officer');
          cy.visit('/');

          cy.contains('SEPs').click();
          cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

          cy.contains('Proposals and Assignments').click();

          cy.finishedLoading();

          cy.get("[title='Show Reviewers']").first().click();

          cy.get(
            '[data-cy="sep-reviewer-assignments-table"] table tbody tr'
          ).as('rows');

          // we testing a bug here, where the list didn't update
          // properly after removing an assignment
          function assertAndRemoveAssignment(length: number) {
            cy.get('@rows').should('have.length', length);

            cy.get('[title="Remove assignment"]').first().click();
            cy.get('[title="Save"]').click();

            cy.notification({
              variant: 'success',
              text: 'Reviewer removed',
            });
          }

          assertAndRemoveAssignment(1);
          cy.finishedLoading();

          cy.get('@rows').should(
            'not.contain.text',
            sepMembers.reviewer.lastName
          );

          cy.contains('Logs').click();

          cy.finishedLoading();

          cy.contains('SEP_MEMBER_REMOVED_FROM_PROPOSAL');
        });

        it('Officer should be able to remove assigned proposal from existing SEP', () => {
          cy.login('officer');
          cy.visit('/');

          cy.contains('SEPs').click();
          cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

          cy.contains('Proposals and Assignments').click();

          cy.finishedLoading();
          cy.contains('Loading...').should('not.exist');

          cy.get('[title="Remove assigned proposal"]').click();
          cy.get('[title="Save"]').click();

          cy.notification({
            variant: 'success',
            text: 'Assignment removed',
          });

          cy.closeNotification();

          cy.contains('Logs').click();

          cy.finishedLoading();

          cy.contains('Assignments').click();

          cy.get('[data-cy="sep-assignments-table"]')
            .find('tbody td')
            .should('have.length', 1);

          cy.get('[data-cy="sep-assignments-table"]')
            .find('tbody td')
            .last()
            .then((element) => {
              expect(element.text()).to.be.equal('No records to display');
            });
        });
      });

      describe('SEP meeting components tests as SEP Chair role', () => {
        beforeEach(() => {
          cy.assignChairOrSecretary({
            assignChairOrSecretaryToSEPInput: {
              sepId: createdSepId,
              userId: sepMembers.chair.id,
              roleId: UserRole.SEP_CHAIR,
            },
          });

          cy.login(sepMembers.chair);
          cy.changeActiveRole(initialDBData.roles.sepChair);
          cy.visit('/');
        });
        it('SEP Chair should be able to edit SEP Meeting form', () => {
          cy.contains('SEPs').click();
          cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

          cy.contains('Meeting Components').click();
          cy.finishedLoading();

          cy.get('[title="Show proposals"]').click();

          cy.finishedLoading();

          cy.get('[title="View proposal details"]').click();

          editFinalRankingForm();
        });

        it('SEP Chair should not be able to edit SEP Meeting form after instrument is submitted', () => {
          cy.saveSepMeetingDecision({
            saveSepMeetingDecisionInput: {
              proposalPk: createdProposalId,
              submitted: true,
              recommendation: ProposalEndStatus.ACCEPTED,
            },
          });
          cy.submitInstrument({
            callId: initialDBData.call.id,
            instrumentId: createdInstrumentId,
            sepId: createdSepId,
          });
          cy.contains('SEPs').click();
          cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

          cy.contains('Meeting Components').click();
          cy.finishedLoading();
          cy.get('[title="Submit instrument"] button').should('be.disabled');

          cy.get('[title="Show proposals"]').click();

          cy.finishedLoading();

          cy.get('[title="View proposal details"]').click();

          cy.get('#commentForUser')
            .parent()
            .find('.tox-menubar button')
            .should('be.disabled');

          cy.get('#commentForManagement')
            .parent()
            .find('.tox-menubar button')
            .should('be.disabled');

          cy.get('[data-cy="save"]').should('not.exist');
          cy.get('[data-cy="saveAndContinue"]').should('not.exist');
        });

        it('SEP Chair should not be able to remove assigned proposal from existing SEP', () => {
          cy.contains('SEPs').click();
          cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

          cy.contains('Proposals and Assignments').click();

          cy.finishedLoading();

          cy.get('[title="Remove assigned proposal"]').should('not.exist');
        });
      });

      describe('SEP meeting components tests as SEP Secretary role', () => {
        beforeEach(() => {
          cy.updateUserRoles({
            id: sepMembers.secretary.id,
            roles: [initialDBData.roles.sepReviewer],
          });
          cy.assignChairOrSecretary({
            assignChairOrSecretaryToSEPInput: {
              sepId: createdSepId,
              userId: sepMembers.secretary.id,
              roleId: UserRole.SEP_SECRETARY,
            },
          });

          cy.login(sepMembers.secretary);
          cy.changeActiveRole(initialDBData.roles.sepSecretary);
          cy.visit('/');
        });

        it('SEP Secretary should be able to edit SEP Meeting form', () => {
          cy.contains('SEPs').click();
          cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

          cy.contains('Meeting Components').click();
          cy.finishedLoading();

          cy.get('[title="Show proposals"]').click();

          cy.finishedLoading();

          cy.get('[title="View proposal details"]').click();

          editFinalRankingForm();
        });

        it('SEP Secretary should not be able to edit SEP Meeting form after instrument is submitted', () => {
          cy.saveSepMeetingDecision({
            saveSepMeetingDecisionInput: {
              proposalPk: createdProposalId,
              submitted: true,
              recommendation: ProposalEndStatus.ACCEPTED,
            },
          });
          cy.submitInstrument({
            callId: initialDBData.call.id,
            instrumentId: createdInstrumentId,
            sepId: createdSepId,
          });
          cy.contains('SEPs').click();
          cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

          cy.contains('Meeting Components').click();
          cy.finishedLoading();
          cy.get('[title="Submit instrument"] button').should('be.disabled');

          cy.get('[title="Show proposals"]').click();

          cy.finishedLoading();

          cy.get('[title="View proposal details"]').click();

          cy.get('#commentForUser')
            .parent()
            .find('.tox-menubar button')
            .should('be.disabled');

          cy.get('#commentForManagement')
            .parent()
            .find('.tox-menubar button')
            .should('be.disabled');

          cy.get('[data-cy="save"]').should('not.exist');
          cy.get('[data-cy="saveAndContinue"]').should('not.exist');
        });

        it('SEP Secretary should not be able to remove assigned proposal from existing SEP', () => {
          cy.contains('SEPs').click();
          cy.contains(sep1.code).parent().find('button[title="Edit"]').click();

          cy.contains('Proposals and Assignments').click();

          cy.finishedLoading();

          cy.get('[title="Remove assigned proposal"]').should('not.exist');
        });
      });

      describe('SEP meeting components tests as SEP Reviewer role', () => {
        beforeEach(() => {
          cy.updateUserRoles({
            id: sepMembers.reviewer2.id,
            roles: [initialDBData.roles.sepReviewer],
          });
          cy.assignReviewersToSep({
            sepId: createdSepId,
            memberIds: [sepMembers.reviewer2.id],
          });
          cy.login(sepMembers.reviewer2);
          cy.visit('/');
        });

        it('SEP Reviewer should be able to see reviews even if he/she is not direct reviewer but only member of the SEP', () => {
          cy.get('main table tbody').contains('No records to display');

          cy.get('[data-cy="reviewer-filter"]').click();

          cy.get('[data-value="ALL"]').click();

          cy.finishedLoading();

          cy.contains(proposal1.proposalTitle)
            .parent()
            .find('[title="Review proposal"]')
            .click();

          cy.finishedLoading();

          cy.contains(proposal1.proposalTitle);
          cy.get('[role="dialog"]').contains('Grade').click();
          cy.get('textarea[id="comment"]').should('exist');
          cy.get('button[type="submit"]').should('exist');
        });
      });
    });
  }
);
