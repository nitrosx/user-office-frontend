import React from "react";
import { Formik, Form, Field } from "formik";
import { TextField } from "formik-material-ui";
import { EventType } from "../model/QuestionaryEditorModel";
import { AdminComponentSignature } from "./QuestionaryFieldEditor";
import * as Yup from "yup";
import FormikUICustomSelect from "./FormikUICustomSelect";
import { AdminComponentShell } from "./AdminComponentShell";
import FormikUICustomDependencySelector from "./FormikUICustomDependencySelector";
import TitledContainer from "./TitledContainer";

export const AdminComponentFileUpload: AdminComponentSignature = props => {
  const field = props.field;

  return (
    <Formik
      initialValues={field}
      onSubmit={async vals => {
        props.dispatch({
          type: EventType.UPDATE_FIELD_REQUESTED,
          payload: {
            field: { ...field, ...vals }
          }
        });
        props.closeMe();
      }}
      validationSchema={Yup.object().shape({
        question: Yup.string().required("Question is required"),
        config: Yup.object({
          file_type: Yup.array(),
          small_label: Yup.string(),
          max_files: Yup.number()
        })
      })}
    >
      {() => (
        <Form style={{ flexGrow: 1 }}>
          <AdminComponentShell {...props} label="File upload">
            <Field
              name="question"
              label="Question"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="question"
            />
            <TitledContainer label="Options">
              <Field
                name="config.small_label"
                label="Helper text"
                placeholder="(e.g. only PDF accepted)"
                type="text"
                component={TextField}
                margin="normal"
                fullWidth
                data-cy="small_label"
              />
            </TitledContainer>

            <TitledContainer label="Constraints">
              <Field
                name="config.file_type"
                label="Accepted file types (leave empty for any)"
                id="fileType"
                component={FormikUICustomSelect}
                availableOptions={[
                  ".pdf",
                  ".doc",
                  ".docx",
                  "audio/*",
                  "video/*",
                  "image/*"
                ]}
                margin="normal"
                fullWidth
                data-cy="file_type"
              />
              <Field
                name="config.max_files"
                label="Max number of files"
                type="text"
                component={TextField}
                margin="normal"
                fullWidth
                data-cy="max_files"
              />
            </TitledContainer>

            <TitledContainer label="Dependencies">
              <Field
                name="dependencies"
                component={FormikUICustomDependencySelector}
                templateField={props.field}
                template={props.template}
                label="User must check it to continue"
                margin="normal"
                fullWidth
                data-cy="dependencies"
              />
            </TitledContainer>
          </AdminComponentShell>
        </Form>
      )}
    </Formik>
  );
};
