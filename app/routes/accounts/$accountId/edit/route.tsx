import {
  ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  redirect,
} from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { Select } from "~/components/Select/Select";
import { TextInput } from "~/components/TextInput/TextInput";
import { prisma } from "~/db.server";
import {
  accountTypesList,
  isAccountType,
  toPrettyAccountType,
} from "~/models/accountType.server";
import { requireUserId } from "~/session.server";

import type { Route } from "./+types/route";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

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

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const accountId = params.accountId;
  if (!accountId) {
    throw new Response("Account ID not in URL", { status: 404 });
  }

  const formData = await request.formData();

  const customName = formData.get("customName");
  const type = formData.get("type");

  if (typeof customName !== "string" || customName === "") {
    return {
      errors: {
        customName: "This field is required",
      },
    };
  }

  if (typeof type !== "string" || type === "") {
    return {
      errors: {
        type: "This field is required",
      },
    };
  }

  // Validate that type is a valid AccountType
  if (!isAccountType(type)) {
    return {
      errors: {
        type: "Invalid account type",
      },
    };
  }

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

  // Update the account
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
      <h2>Edit Account</h2>
      <Form method="post">
        <TextInput
          label="Account Custom Name"
          type="text"
          name="customName"
          defaultValue={loaderData.account.customName ?? undefined}
          errorMessage={actionData?.errors.customName}
        />
        <Box my={16}>
          <Select
            label="Account Type"
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
