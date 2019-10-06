import { useProposalQuestionTemplate } from "../hooks/useProposalQuestionTemplate";
import { Reducer, useEffect } from "react";
import { ProposalTemplate, ProposalTemplateField } from "../model/ProposalModel";
import produce from "immer";
import useReducerWithMiddleWares from "../utils/useReducerWithMiddleWares";

export enum ActionType {
  READY,
  MOVE_ITEM,
  MOVE_TOPIC,
  UPDATE_TOPIC_TITLE,
  UPDATE_ITEM
}

export interface IAction {
  type: ActionType;
  payload: any;
}

export default function QuestionaryEditorModel(middlewares?: Array<Function>) {
  const blankInitTemplate = new ProposalTemplate();
  const [state, dispatch] = useReducerWithMiddleWares<
    Reducer<ProposalTemplate, IAction>
  >(reducer, blankInitTemplate, middlewares || []);
  const { proposalTemplate } = useProposalQuestionTemplate();

  useEffect(() => {
    if (proposalTemplate) {
      dispatch({ type: ActionType.READY, payload: proposalTemplate });
    }
  }, [proposalTemplate, dispatch]);

  function reducer(state: ProposalTemplate, action: IAction): ProposalTemplate {
    return produce(state, draft => {
      switch (action.type) {
        case ActionType.READY:
          return action.payload;
        case ActionType.MOVE_ITEM:
          if (!action.payload.destination) {
            return draft;
          }

          var from: any = draft.topics.find(topic => {
            return (
              topic.topic_id.toString() === action.payload.source.droppableId
            );
          });

          var to: any = draft.topics.find(topic => {
            return (
              topic.topic_id.toString() ===
              action.payload.destination.droppableId
            );
          });

          to.fields.splice(
            action.payload.destination.index,
            0,
            ...from.fields.splice(action.payload.source.index, 1)
          );

          return draft;
        case ActionType.UPDATE_TOPIC_TITLE:
          draft.getTopicById(action.payload.topicId)!.topic_title =
            action.payload.title;
          return draft;
        case ActionType.UPDATE_ITEM:
          const field:ProposalTemplateField = action.payload.field;
          Object.assign(draft.getFieldById(field.proposal_question_id), field);
          return draft;
      }
    });
  }

  return { state, dispatch };
}
