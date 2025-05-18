import { ActionFunctionArgs, Form, redirect } from "react-router";

import { prisma } from "~/db.server";
import { requireUser } from "~/session.server";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await requireUser(request);

  const accountId = params.accountId;

  if (!accountId) {
    throw new Error("Sucks to suck");
  }

  const formData = await request.formData();

  const csvFile = formData.get("import_file");

  if (csvFile instanceof File) {
    const text = await csvFile.text();

    const [_headers, ...rest] = text.split("\r\n");

    const data = rest.map((row) => row.split(","));

    await prisma.balanceSnapshot.createMany({
      data: data.map(([dateStr, balanceStr]) => ({
        accountId,
        amount: parseFloat(balanceStr) * 100,
        dateTime: new Date(dateStr),
      })),
    });

    return redirect("./../..");
  }

  return Response.json({ ok: false }, { status: 400 });
};

export default function ImportRoute() {
  return (
    <div>
      <div>
        <p>Please upload a .csv file with the following structure.</p>
        <p>Dates do NOT need to be sorted, or sequential</p>
        <p>Be sure that your balances do not contain commas!</p>
        <div
          style={{ backgroundColor: "lightgray", padding: 20, marginBlock: 20 }}
        >
          <pre>
            Date,Balance
            <br />
            2025-05-15,100.00
            <br />
            2025-05-16,115.33
            <br />
            2025-05-17,93.44
            <br />
          </pre>
        </div>
      </div>
      <Form method="post" encType="multipart/form-data">
        <input type="file" accept=".csv" name="import_file" />
        <button type="submit">Submit that bad boy</button>
      </Form>
    </div>
  );
}
