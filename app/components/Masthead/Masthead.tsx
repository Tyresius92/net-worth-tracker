import { Form, Link } from "react-router";

import { Box } from "../Box/Box";
import { Button } from "../Button/Button";
import { Divider } from "../Divider/Divider";
import { Flex } from "../Flex/Flex";
import { NavLink } from "../NavLink/NavLink";

export interface MastheadProps {
  user: { id: string } | null;
}

export const Masthead = ({ user }: MastheadProps) => {
  const formatDate = (date: Date) => {
    const foo = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return foo.format(date).toLocaleUpperCase();
  };

  return (
    <Box>
      <Divider />
      <Flex justifyContent="center">
        <Link to="/" className="site-title-link">
          <h1 className="site-title">The Ledger</h1>
        </Link>
      </Flex>
      <Divider />
      <Flex justifyContent="center">{formatDate(new Date())}</Flex>
      <Divider />
      <nav>
        <Flex justifyContent="flex-end" gap={32}>
          <NavLink to="/accounts">Accounts</NavLink>
          <NavLink to="/settings">Settings</NavLink>
          {user ? (
            <Box p={12}>
              <Form method="post" action="logout">
                <Button type="submit">Log Out</Button>
              </Form>
            </Box>
          ) : (
            <>
              <NavLink to="/join">Join</NavLink>
              <NavLink to="/login">Login</NavLink>
            </>
          )}
        </Flex>
      </nav>
    </Box>
  );
};
