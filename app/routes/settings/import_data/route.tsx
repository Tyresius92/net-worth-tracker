import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, Form, useActionData } from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { Heading } from "~/components/Heading/Heading";
import { Text } from "~/components/Text/Text";
import { requireUser } from "~/session.server";
import { parseImportCSV, runBulkImport } from "~/utils/importUtils.server";
import type { ImportResult } from "~/utils/importUtils.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUser(request);
  return {};
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);
  const formData = await request.formData();
  const csvFile = formData.get("import_file");

  if (!(csvFile instanceof File) || csvFile.size === 0) {
    return data({ status: "error" as const, message: "Please select a CSV file." }, { status: 400 });
  }

  try {
    const text = await csvFile.text();
    const parsed = parseImportCSV(text);
    const result = await runBulkImport(parsed, user.id);
    return data({ status: "success" as const, result });
  } catch {
    return data(
      { status: "error" as const, message: "The import failed. No figures were saved." },
      { status: 500 },
    );
  }
};

export default function ImportDataRoute() {
  const actionData = useActionData<typeof action>();

  return (
    <Box xsP={24}>
      <Box xsMb={24}>
        <Heading level={1}>Import figures</Heading>
      </Box>

      <Box xsMb={24}>
        <Text variant="body">
          Upload the CSV exported from this application to import figures for
          one or more sources in bulk. New sources will be created automatically
          for any columns not matched to an existing source.
        </Text>
      </Box>

      <Form method="post" encType="multipart/form-data">
        <Box xsMb={16}>
          <input type="file" accept=".csv" name="import_file" />
        </Box>
        <Button type="submit">Import</Button>
      </Form>

      {actionData?.status === "success" ? (
        <ImportSummary result={actionData.result} />
      ) : null}

      {actionData?.status === "error" ? (
        <Box xsMt={24}>
          <Text variant="body">{actionData.message}</Text>
        </Box>
      ) : null}
    </Box>
  );
}

const ImportSummary = ({ result }: { result: ImportResult }) => (
  <Box xsMt={24}>
    <Box xsMb={8}>
      <Heading level={2}>Import complete</Heading>
    </Box>
    <Text variant="body">Sources created: {result.sourcesCreated}</Text>
    <Text variant="body">Figures added: {result.figuresAdded}</Text>
    <Text variant="body">Figures skipped (exact duplicates): {result.figuresSkipped}</Text>
  </Box>
);
