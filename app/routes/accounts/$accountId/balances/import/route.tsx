import { parse } from "csv-parse/sync";
import type { ActionFunctionArgs} from "react-router";
import { Form, redirect } from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { FileUpload } from "~/components/FileUpload/FileUpload";
import { Heading } from "~/components/Heading/Heading";
import { Text } from "~/components/Text/Text";
import { prisma } from "~/db.server";
import { requireUser } from "~/session.server";

export const action = async ({ request, url, params }: ActionFunctionArgs) => {
  await requireUser(request, url);

  const accountId = params.accountId;

  if (!accountId) {
    throw new Response("Account ID is required", { status: 400 });
  }

  const formData = await request.formData();
  const csvFile = formData.get("import_file");

  if (csvFile instanceof File) {
    const text = await csvFile.text();

    const records = parse<{ Date: string; Amount: string }>(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    await prisma.balanceSnapshot.createMany({
      data: records.map((record) => ({
        accountId,
        amount: Math.round(parseFloat(record.Amount) * 100),
        dateTime: new Date(record.Date),
      })),
    });

    return redirect("./../..");
  }

  return Response.json({ ok: false }, { status: 400 });
};

export default function ImportRoute() {
  return (
    <Box>
      <Heading level={3}>Import figures</Heading>
      <Text variant="deck">
        Accepted format: a CSV file with two columns — date and amount.
      </Text>
      <Box border={{ color: "sand-7" }} xsP={20} xsMt={20} xsMb={20}>
        <pre>
          Date,Amount{"\n"}
          2025-05-15,100.00{"\n"}
          2025-05-16,115.33{"\n"}
          2025-05-17,93.44
        </pre>
      </Box>
      <Text variant="body">
        Dates need not be sequential. Amounts must not include commas.
      </Text>
      <Form method="post" encType="multipart/form-data">
        <Box xsMt={16}>
          <FileUpload label="CSV file" name="import_file" accept={["csv"]} />
        </Box>
        <Box xsMt={12}>
          <Button type="submit">Import figures</Button>
        </Box>
      </Form>
    </Box>
  );
}
