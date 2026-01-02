import { ActionFunctionArgs, Form, redirect } from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { TextInput } from "~/components/TextInput/TextInput";
import { prisma } from "~/db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const emailAddress = formData.get("email");
  const message = formData.get("message");

  if (!emailAddress || typeof emailAddress !== "string") {
    return {
      errors: {
        email: "Email is required",
      },
    };
  }

  if (!message || typeof message !== "string") {
    return {
      errors: {
        message: "Message is required",
      },
    };
  }

  const _submission = await prisma.contactFormSubmission.create({
    data: {
      emailAddress: emailAddress,
      message: message,
    },
  });

  return redirect("/");
};

export default function ContactForm() {
  return (
    <Box>
      <h1>Contact</h1>
      <p>
        Thank you for your interest in contacting us. Please submit your message
        below. We will get back to you soon.
      </p>
      <Form method="post">
        <TextInput type="email" required label="Email address" name="email" />
        <TextInput type="text" required label="Message" name="message" />
        <Button type="submit">Submit</Button>
      </Form>
    </Box>
  );
}
