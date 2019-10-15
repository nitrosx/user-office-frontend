import { Droppable, Draggable } from "react-beautiful-dnd";
import React, { useState } from "react";

import QuestionaryEditorTopicItem from "./QuestionaryEditorTopicItem";
import { Topic, ProposalTemplateField, DataType } from "../model/ProposalModel";
import {
  makeStyles,
  Grid,
  useTheme,
  Menu,
  Fade,
  MenuItem,
  ListItemIcon,
  Typography,
  Divider
} from "@material-ui/core";
import { EventType, IEvent } from "./QuestionaryEditorModel";
import DeleteRoundedIcon from "@material-ui/icons/DeleteRounded";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import getTemplateFieldIcon from "./getTemplateFieldIcon";
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd";

export default function QuestionaryEditorTopic(props: {
  data: Topic;
  dispatch: React.Dispatch<IEvent>;
  index: number;
  onItemClick: { (data: ProposalTemplateField): void };
}) {
  const theme = useTheme();

  const classes = makeStyles(theme => ({
    container: {
      alignItems: "flex-start",
      alignContent: "flex-start",
      background: "#FFF",
      flexBasis: "100%"
    },
    inputHeading: {
      fontSize: "15px",
      color: theme.palette.grey[600],
      fontWeight: 600,
      width: "100%"
    },
    itemContainer: {
      minHeight: "180px"
    },
    topic: {
      fontSize: "15px",
      padding: "0 5px",
      marginBottom: "16px",
      color: theme.palette.grey[600],
      fontWeight: 600,
      background: "white",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    },
    addQuestionMenuItem: {
      minHeight: 0
    },
    showMoreButton: {
      cursor: "pointer"
    },
    addIcon: {
      textAlign: "right",
      paddingRight: "8px"
    }
  }))();

  const { data, dispatch, index } = props;
  const [title, setTitle] = useState<string>(data.topic_title);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<null | SVGSVGElement>(null);
  const open = Boolean(anchorEl);

  const onCreateNewFieldClicked = (dataType: DataType) => {
    let newField = new ProposalTemplateField({ data_type: dataType });
    dispatch({
      type: EventType.CREATE_NEW_FIELD_REQUESTED,
      payload: { newField, topicId: props.data.topic_id }
    });
    setAnchorEl(null);
  };

  const getListStyle = (isDraggingOver: any) => ({
    background: isDraggingOver
      ? theme.palette.primary.light
      : theme.palette.grey[100],
    transition: "all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)"
  });

  const getItemStyle = (isDragging: any, draggableStyle: any) => ({
    background: "#FFF",
    ...draggableStyle
  });

  const titleJsx = isEditMode ? (
    <input
      type="text"
      value={title}
      className={classes.inputHeading}
      onChange={event => setTitle(event.target.value)}
      onBlur={() => {
        setIsEditMode(false);
        dispatch({
          type: EventType.UPDATE_TOPIC_TITLE_REQUESTED,
          payload: { topicId: data.topic_id, title: title }
        });
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
    />
  ) : (
    <span
      onClick={() => {
        setIsEditMode(true);
      }}
    >
      {index + 2}. {props.data.topic_title}
    </span>
  );
  return (
    <Draggable
      key={data.topic_id.toString()}
      draggableId={data.topic_id.toString()}
      index={index}
    >
      {(provided, snapshotDraggable) => (
        <Grid
          container
          className={classes.container}
          {...provided.draggableProps}
          ref={provided.innerRef}
          style={getItemStyle(
            snapshotDraggable.isDragging,
            provided.draggableProps.style
          )}
        >
          <Grid
            item
            xs={10}
            className={classes.topic}
            {...provided.dragHandleProps}
          >
            {titleJsx}
          </Grid>
          <Grid item xs={2} className={classes.addIcon}>
            <MoreHorizIcon
              onClick={(event: React.MouseEvent<SVGSVGElement>) =>
                setAnchorEl(event.currentTarget)
              }
              className={classes.showMoreButton}
            />
            <Menu
              anchorEl={anchorEl}
              keepMounted
              open={open}
              onClose={() => setAnchorEl(null)}
              TransitionComponent={Fade}
            >
              <MenuItem
                className={classes.addQuestionMenuItem}
                onClick={() => onCreateNewFieldClicked(DataType.TEXT_INPUT)}
              >
                <ListItemIcon>
                  {getTemplateFieldIcon(DataType.TEXT_INPUT)!}
                </ListItemIcon>
                <Typography variant="inherit">Add Text input</Typography>
              </MenuItem>

              <MenuItem
                className={classes.addQuestionMenuItem}
                onClick={() => onCreateNewFieldClicked(DataType.EMBELLISHMENT)}
              >
                <ListItemIcon>
                  {getTemplateFieldIcon(DataType.EMBELLISHMENT)!}
                </ListItemIcon>
                <Typography variant="inherit">Add Embellishment</Typography>
              </MenuItem>

              <MenuItem
                className={classes.addQuestionMenuItem}
                onClick={() => onCreateNewFieldClicked(DataType.DATE)}
              >
                <ListItemIcon>
                  {getTemplateFieldIcon(DataType.DATE)!}
                </ListItemIcon>
                <Typography variant="inherit">Add Date</Typography>
              </MenuItem>

              <MenuItem
                className={classes.addQuestionMenuItem}
                onClick={() => onCreateNewFieldClicked(DataType.FILE_UPLOAD)}
              >
                <ListItemIcon>
                  {getTemplateFieldIcon(DataType.FILE_UPLOAD)!}
                </ListItemIcon>
                <Typography variant="inherit">Add File upload</Typography>
              </MenuItem>

              <MenuItem
                className={classes.addQuestionMenuItem}
                onClick={() =>
                  onCreateNewFieldClicked(DataType.SELECTION_FROM_OPTIONS)
                }
              >
                <ListItemIcon>
                  {getTemplateFieldIcon(DataType.SELECTION_FROM_OPTIONS)!}
                </ListItemIcon>
                <Typography variant="inherit">Add Multiple choice</Typography>
              </MenuItem>

              <MenuItem
                className={classes.addQuestionMenuItem}
                onClick={() => onCreateNewFieldClicked(DataType.BOOLEAN)}
              >
                <ListItemIcon>
                  {getTemplateFieldIcon(DataType.BOOLEAN)!}
                </ListItemIcon>
                <Typography variant="inherit">Add Boolean</Typography>
              </MenuItem>
              <Divider />
              <MenuItem
                className={classes.addQuestionMenuItem}
                onClick={(event: any) =>
                  dispatch({
                    type: EventType.DELETE_TOPIC_REQUESTED,
                    payload: data.topic_id
                  })
                }
              >
                <ListItemIcon>
                  <DeleteRoundedIcon />
                </ListItemIcon>
                <Typography variant="inherit">Delete topic</Typography>
              </MenuItem>

              <MenuItem
                className={classes.addQuestionMenuItem}
                onClick={(event: any) =>
                  dispatch({
                    type: EventType.CREATE_TOPIC_REQUESTED,
                    payload: { sortOrder: index + 1 }
                    // +1 means - add immediately after this topic
                  })
                }
              >
                <ListItemIcon>
                  <PlaylistAddIcon />
                </ListItemIcon>
                <Typography variant="inherit">Add topic</Typography>
              </MenuItem>
            </Menu>
          </Grid>

          <Droppable droppableId={data.topic_id.toString()} type="field">
            {(provided, snapshot) => (
              <Grid
                item
                xs={12}
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
                className={classes.itemContainer}
              >
                {data.fields.map((item, index) => (
                  <QuestionaryEditorTopicItem
                    index={index}
                    data={item}
                    dispatch={dispatch}
                    onClick={props.onItemClick}
                    key={item.proposal_question_id.toString()}
                  />
                ))}
                {provided.placeholder}
              </Grid>
            )}
          </Droppable>
        </Grid>
      )}
    </Draggable>
  );
}
