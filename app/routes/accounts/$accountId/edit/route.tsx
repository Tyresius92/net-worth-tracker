import type {
  ActionFunctionArgs,
  LoaderFunctionArgs} from "react-router";
import {
  Form,
  redirect,
} from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { Select } from "~/components/Select/Select";
import { TextInput } from "~/components/TextInput/TextInput";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import {
  accountTypesList,
  toPrettyAccountType,
  validateAccountForm,
} from "~/utils/accountUtils";

import type { Route } from "./+types/route";

export const loader = async ({ params, request, url }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request, url);

  const accountId = params.accountId;
  if (!accountId) {
    throw new Response("Account ID not in URL", { status: 404 });
  }

  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
  });

  if (!account) {
    return redirect("./../../..");
  }

  const accountTypeOptions = accountTypesList.map((type) => ({
    value: type,
    label: toPrettyAccountType(type),
  }));

  return { account, accountTypeOptions };
};

export const action = async ({ params, request, url }: ActionFunctionArgs) => {
  const userId = await requireUserId(request, url);

  const accountId = params.accountId;
  if (!accountId) {
    throw new Response("Account ID not in URL", { status: 404 });
  }

  const formData = await request.formData();

  const result = validateAccountForm(formData);
  if (!result.success) {
    return { errors: result.errors };
  }

  const { customName, type } = result.data;

  // Verify the account exists and belongs to the user
  const existingAccount = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
  });

  if (!existingAccount) {
    return redirect("./../../..");
  }

  await prisma.account.update({
    where: {
      id: accountId,
    },
    data: {
      customName,
      type,
    },
  });

  return redirect("./..");
};

export default function EditAccountForm({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <Box>
      <h2>Edit source</h2>
      <Form method="post">
        <TextInput
          label="Source name"
          type="text"
          name="customName"
          defaultValue={loaderData.account.customName ?? undefined}
          errorMessage={actionData?.errors.customName}
        />
        <Box xsMy={16}>
          <Select
            label="Source type"
            name="type"
            options={loaderData.accountTypeOptions}
            defaultValue={loaderData.account.type}
            errorMessage={actionData?.errors.type}
          />
        </Box>
        <Button type="submit">Save Changes</Button>
      </Form>
    </Box>
  );
}
