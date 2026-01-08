import { LoaderFunctionArgs, redirect } from "react-router";

import { Box } from "~/components/Box/Box";
import { Table } from "~/components/Table/Table";
import { prisma } from "~/db.server";
import { requireUser } from "~/session.server";
import { formatDate } from "~/utils/balanceUtils";

import { Route } from "./+types/route";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  if (user.role !== "admin") {
    return redirect("/", { status: 403 });
  }

  const messages = await prisma.contactFormSubmission.findMany();

  return {
    messages,
  };
};

export default function ContactMessageView({
  loaderData,
}: Route.ComponentProps) {
  return (
    <Box>
      <h1>Contact Form Submissions</h1>
      <Table caption="Contact Form Submissions">
        <Table.Head>
          <Table.ColumnHeader>Date</Table.ColumnHeader>
          <Table.ColumnHeader>Email</Table.ColumnHeader>
          <Table.ColumnHeader>Message</Table.ColumnHeader>
        </Table.Head>
        <Table.Body>
          {loaderData.messages.map((message) => (
            <Table.Row key={message.id}>
              <Table.Cell>{message.createdAt.toISOString()}</Table.Cell>
              <Table.Cell>{message.emailAddress}</Table.Cell>
              <Table.Cell>{message.message}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Box>
  );
}
