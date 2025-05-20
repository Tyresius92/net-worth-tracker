import {
  ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  redirect,
} from "react-router";

import { Box } from "~/components/Box/Box";
import { TextInput } from "~/components/TextInput/TextInput";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

import type { Route } from "./+types/route";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);

  return {};
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const officialName = formData.get("officialName");
  const nickName = formData.get("nickName");

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

  const account = await prisma.account.create({
    data: {
      userId,
      officialName,
      nickName,
    },
  });

  return redirect(`./../${account.id}`);
};

export default function NewAccountForm(_props: Route.ComponentProps) {
  return (
    <Box>
      <Form method="post">
        <TextInput
          label="Official Account Name"
          hintText="The canonical name for an account. Cannot be changed later"
          type="text"
          name="officialName"
          errorMessage={undefined}
        />
        <TextInput
          label="Account Nickname"
          type="text"
          name="nickName"
          errorMessage={undefined}
        />
        <button type="submit">Submit</button>
      </Form>
    </Box>
  );
}
