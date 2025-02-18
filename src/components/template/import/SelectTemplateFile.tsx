import { Button, Typography } from '@material-ui/core';
import PublishIcon from '@material-ui/icons/Publish';
import React, { ChangeEvent } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';

import { getFileContents } from './ImportTemplatePage';

export function SelectTemplateFile(props: {
  onFileSelected: (json: string) => void;
}) {
  const onFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    if (file) {
      const json = await getFileContents(file);
      props.onFileSelected(json);
    }
  };

  return (
    <>
      <Typography variant="body2" component="div">
        Please select the template file you wish to import.
      </Typography>
      <label>
        <input
          accept="application/json"
          style={{ display: 'none' }}
          type="file"
          multiple={false}
          onChange={onFileSelected}
        />
        <ActionButtonContainer>
          <Button variant="contained" component="span">
            <PublishIcon /> Select file
          </Button>
        </ActionButtonContainer>
      </label>
    </>
  );
}
