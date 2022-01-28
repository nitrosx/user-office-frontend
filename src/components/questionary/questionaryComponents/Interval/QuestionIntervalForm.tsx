import makeStyles from '@material-ui/core/styles/makeStyles';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { FC } from 'react';
import * as Yup from 'yup';

import FormikUICustomCheckbox from 'components/common/FormikUICustomCheckbox';
import FormikUICustomSelect from 'components/common/FormikUICustomSelect';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionFormShell } from 'components/questionary/questionaryComponents/QuestionFormShell';
import { useUnitsData } from 'hooks/settings/useUnitData';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

const useStyles = makeStyles(() => ({
  units: {
    minWidth: '100%',
  },
}));

export const QuestionIntervalForm: FC<QuestionFormProps> = (props) => {
  const field = props.question;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);
  const { units } = useUnitsData();

  const classes = useStyles();

  return (
    <QuestionFormShell
      {...props}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required'),
        config: Yup.object({
          required: Yup.bool(),
          units: Yup.array().of(Yup.string()),
        }),
      })}
    >
      {() => (
        <>
          <Field
            name="naturalKey"
            label="Key"
            id="Key-input"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            inputProps={{ 'data-cy': 'natural_key' }}
          />
          <Field
            name="question"
            label="Question"
            id="Question-input"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            inputProps={{ 'data-cy': 'question' }}
          />

          <Field
            name="config.small_label"
            label="Small label"
            id="Small-label-input"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            inputProps={{ 'data-cy': 'small-label' }}
          />

          <TitledContainer label="Constraints">
            <Field
              name="config.required"
              component={FormikUICustomCheckbox}
              label="Check to make this field mandatory"
              margin="normal"
              fullWidth
              InputProps={{ 'data-cy': 'required' }}
            />

            <Field
              name="config.units"
              component={FormikUICustomSelect}
              multiple
              label="Units"
              availableOptions={units.map(({ unit }) => unit)}
              className={classes.units}
              data-cy="units"
            />
          </TitledContainer>
        </>
      )}
    </QuestionFormShell>
  );
};
