import type { Account } from "@prisma/client";
import {
  ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  redirect,
  useLoaderData,
} from "react-router";

import { Box } from "~/components/Box/Box";
import { Select } from "~/components/Select/Select";
import { TextInput } from "~/components/TextInput/TextInput";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

// Define valid account types based on the schema
const ACCOUNT_TYPES = [
  "checking",
  "credit_card",
  "investment",
  "line_of_credit",
  "mortgage",
  "other",
  "property",
  "savings",
];

type AccountType = Account["type"];

// Type predicate function to validate AccountType
function isAccountType(value: string): value is AccountType {
  return ACCOUNT_TYPES.includes(value);
}

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

  return { account };
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const accountId = params.accountId;
  if (!accountId) {
    throw new Response("Account ID not in URL", { status: 404 });
  }

  const formData = await request.formData();

  const nickName = formData.get("nickName");
  const type = formData.get("type");

  if (typeof nickName !== "string" || nickName === "") {
    return {
      errors: {
        nickName: "This field is required",
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
      nickName,
      type,
    },
  });

  return redirect("./..");
};

export default function EditAccountForm() {
  const { account } = useLoaderData<typeof loader>();

  // Create options for the account type select
  const accountTypeOptions = ACCOUNT_TYPES.map((type) => ({
    value: type,
    label: type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  }));

  return (
    <Box>
      <h2>Edit Account</h2>
      <Form method="post">
        <TextInput
          label="Official Account Name"
          type="text"
          name="officialName"
          defaultValue={account.officialName}
          disabled={true}
          hintText="The official name cannot be changed"
          errorMessage={undefined}
        />
        <TextInput
          label="Account Nickname"
          type="text"
          name="nickName"
          defaultValue={account.nickName}
          errorMessage={undefined}
        />
        <Box my={16}>
          <Select
            label="Account Type"
            name="type"
            options={accountTypeOptions}
            defaultValue={account.type}
            errorMessage={undefined}
          />
        </Box>
        <button type="submit">Save Changes</button>
      </Form>
    </Box>
  );
}