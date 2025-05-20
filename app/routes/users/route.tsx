import { LoaderFunctionArgs, redirect } from "react-router";

import { Box } from "~/components/Box/Box";
import { Table } from "~/components/Table/Table";
import { getUsers } from "~/models/user.server";
import { requireUser } from "~/session.server";

import type { Route } from "./+types/route";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  if (user.role !== "admin") {
    return redirect("/", { status: 403 });
  }

  const users = await getUsers();

  return {
    user,
    users,
  };
};

export default function Layout({ loaderData }: Route.ComponentProps) {
  return (
    <Box>
      <Table caption="Users">
        <Table.Head>
          <Table.ColumnHeader>ID</Table.ColumnHeader>
          <Table.ColumnHeader>First Name</Table.ColumnHeader>
          <Table.ColumnHeader>Last Name</Table.ColumnHeader>
          <Table.ColumnHeader>Full Name</Table.ColumnHeader>
          <Table.ColumnHeader>Email</Table.ColumnHeader>
          <Table.ColumnHeader>Subscription</Table.ColumnHeader>
          <Table.ColumnHeader>Role</Table.ColumnHeader>
        </Table.Head>
        <Table.Body>
          {loaderData.users.map((user) => (
            <Table.Row key={user.id}>
              <Table.Cell>{user.id}</Table.Cell>
              <Table.Cell>{user.firstName}</Table.Cell>
              <Table.Cell>{user.lastName}</Table.Cell>
              <Table.Cell>{user.fullName}</Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
              <Table.Cell>{user.subscription}</Table.Cell>
              <Table.Cell>{user.role}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Box>
  );
}
