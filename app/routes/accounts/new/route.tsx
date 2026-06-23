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
import { requireUserId } from "~/session.server";
import {
  toPrettyAccountType,
  accountTypesList,
  validateAccountForm,
} from "~/utils/accountUtils";

import type { Route } from "./+types/route";

export const loader = async ({ request, url }: LoaderFunctionArgs) => {
  await requireUserId(request, url);

  const accountTypeOptions = accountTypesList.map((type) => ({
    value: type,
    label: toPrettyAccountType(type),
  }));

  return {
    accountTypeOptions,
  };
};

export const action = async ({ request, url }: ActionFunctionArgs) => {
  const userId = await requireUserId(request, url);

  const formData = await request.formData();

  const result = validateAccountForm(formData);
  if (!result.success) {
    return { errors: result.errors };
  }

  const { customName, type } = result.data;

  const account = await prisma.account.create({
    data: {
      userId,
      customName,
      type,
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
          label="Source name"
          type="text"
          name="customName"
          errorMessage={actionData?.errors.customName}
        />
        <Box xsMy={16}>
          <Select
            label="Source type"
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
