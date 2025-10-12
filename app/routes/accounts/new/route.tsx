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
  toPrettyAccountType,
  accountTypesList,
  isAccountType,
} from "~/models/accountType.server";
import { requireUserId } from "~/session.server";

import type { Route } from "./+types/route";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);

  const accountTypeOptions = accountTypesList.map((type) => ({
    value: type,
    label: toPrettyAccountType(type),
  }));

  return {
    accountTypeOptions,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const officialName = formData.get("officialName");
  const nickName = formData.get("nickName");
  const type = formData.get("type");

  if (typeof officialName !== "string" || officialName === "") {
    return {
      errors: {
        officialName: "This field is required",
      },
    };
  }

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

  const account = await prisma.account.create({
    data: {
      userId,
      officialName,
      nickName,
      type, // type is now validated as AccountType
    },
  });

  return redirect(`./../${account.id}`);
};

export default function NewAccountForm({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <Box>
      <Form method="post">
        <TextInput
          label="Official Account Name"
          hintText="The canonical name for an account. Cannot be changed later"
          type="text"
          name="officialName"
          errorMessage={actionData?.errors.officialName}
        />
        <TextInput
          label="Account Nickname"
          type="text"
          name="nickName"
          errorMessage={actionData?.errors.nickName}
        />
        <Box my={16}>
          <Select
            label="Account Type"
            name="type"
            options={loaderData.accountTypeOptions}
            errorMessage={actionData?.errors.type}
          />
        </Box>
        <Button type="submit">Submit</Button>
      </Form>
    </Box>
  );
}
