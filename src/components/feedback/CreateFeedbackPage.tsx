import Grid from '@material-ui/core/Grid';
import React from 'react';
import { useParams } from 'react-router';

import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

import CreateFeedback from './CreateFeedback';

function CreateFeedbackPage() {
  const { scheduledEventId } = useParams<{ scheduledEventId: string }>();

  if (!scheduledEventId) {
    return <span>Missing query params</span>;
  }

  return (
    <ContentContainer maxWidth="md">
      <Grid container>
        <Grid item xs={12}>
          <StyledPaper>
            <CreateFeedback scheduledEventId={+scheduledEventId} />
          </StyledPaper>
        </Grid>
      </Grid>
    </ContentContainer>
  );
}

export default CreateFeedbackPage;
