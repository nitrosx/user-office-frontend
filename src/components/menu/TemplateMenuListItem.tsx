import Collapse from '@material-ui/core/Collapse';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';
import DescriptionIcon from '@material-ui/icons/Description';
import DynamicFeedIcon from '@material-ui/icons/DynamicFeed';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import FeedbackIcon from '@material-ui/icons/Feedback';
import FlightTakeoffIcon from '@material-ui/icons/FlightTakeoff';
import InboxIcon from '@material-ui/icons/Inbox';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import LocalShippingIcon from '@material-ui/icons/LocalShipping';
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router';
import { NavLink } from 'react-router-dom';

import EsiIcon from 'components/common/icons/EsiIcon';
import { FeatureContext } from 'context/FeatureContextProvider';
import { FeatureId } from 'generated/sdk';

function EsiTemplatesMenuListItem() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <>
      <Tooltip title="Experiment Safety Input (ESI)">
        <ListItem button onClick={() => setIsExpanded(!isExpanded)}>
          <ListItemIcon>
            <EsiIcon />
            {isExpanded ? (
              <ExpandLess fontSize="small" />
            ) : (
              <ExpandMore fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText primary="ESI" />
        </ListItem>
      </Tooltip>

      <Collapse
        in={isExpanded}
        timeout="auto"
        unmountOnExit
        style={{ marginLeft: '10px' }}
      >
        <Tooltip title="Experiment Safety Input (Proposal)">
          <ListItem component={NavLink} to="/EsiTemplates" button>
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText primary="Proposal ESI" title="Proposal ESI" />
          </ListItem>
        </Tooltip>
        <Tooltip title="Experiment Safety Input (Sample)">
          <ListItem component={NavLink} to="/SampleEsiTemplates" button>
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary="Sample ESI" title="Sample ESI" />
          </ListItem>
        </Tooltip>
      </Collapse>
    </>
  );
}

export function TemplateMenuListItem() {
  const history = useHistory();
  const shouldExpand =
    history.location.pathname === '/ProposalTemplates' ||
    history.location.pathname === '/SampleDeclarationTemplates';
  const [isExpanded, setIsExpanded] = useState(shouldExpand);
  const context = useContext(FeatureContext);
  const isShipmentFeatureEnabled = !!context.features.get(FeatureId.SHIPPING)
    ?.isEnabled;
  const isRiskAssessmentFeatureEnabled = !!context.features.get(
    FeatureId.RISK_ASSESSMENT
  )?.isEnabled;
  function toggleExpand() {
    setIsExpanded(!isExpanded);
  }

  return (
    <>
      <Tooltip title="Templates">
        <ListItem button onClick={toggleExpand}>
          <ListItemIcon>
            <LibraryBooksIcon />
            {isExpanded ? (
              <ExpandLess fontSize="small" />
            ) : (
              <ExpandMore fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText primary="Templates" />
        </ListItem>
      </Tooltip>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Tooltip title="Proposal">
          <ListItem component={NavLink} to="/ProposalTemplates" button>
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText primary="Proposal" />
          </ListItem>
        </Tooltip>

        <Tooltip title="Sample declaration">
          <ListItem component={NavLink} to="/SampleDeclarationTemplates" button>
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary="Sample declaration" />
          </ListItem>
        </Tooltip>

        <Tooltip title="Sub Template">
          <ListItem component={NavLink} to="/GenericTemplates" button>
            <ListItemIcon>
              <DynamicFeedIcon />
            </ListItemIcon>
            <ListItemText primary="Sub Template" />
          </ListItem>
        </Tooltip>

        {isShipmentFeatureEnabled && (
          <Tooltip title="Shipment declaration templates">
            <ListItem
              component={NavLink}
              to="/ShipmentDeclarationTemplates"
              button
            >
              <ListItemIcon>
                <LocalShippingIcon />
              </ListItemIcon>
              <ListItemText primary="Shipment declaration" />
            </ListItem>
          </Tooltip>
        )}
        <Tooltip title="Visit registration">
          <ListItem component={NavLink} to="/VisitTemplates" button>
            <ListItemIcon>
              <FlightTakeoffIcon />
            </ListItemIcon>
            <ListItemText primary="Visit registration" />
          </ListItem>
        </Tooltip>

        {isRiskAssessmentFeatureEnabled && <EsiTemplatesMenuListItem />}

        <Tooltip title="Feedback">
          <ListItem component={NavLink} to="/FeedbackTemplates" button>
            <ListItemIcon>
              <FeedbackIcon />
            </ListItemIcon>
            <ListItemText primary="Feedback" />
          </ListItem>
        </Tooltip>
      </Collapse>
    </>
  );
}
