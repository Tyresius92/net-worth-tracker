import { Form, Link } from "react-router";

import { Box } from "../Box/Box";
import { Button } from "../Button/Button";
import { Divider } from "../Divider/Divider";
import { NavLink } from "../NavLink/NavLink";

export interface MastheadProps {
  user: { id: string; twoFactorEnabled: boolean } | null;
  children: React.ReactNode;
}

export const Masthead = ({ user, children }: MastheadProps) => {
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
      <Box display="flex" justifyContent="center">
        <Link to="/" className="site-title-link">
          <h1 className="site-title">The Ledger</h1>
        </Link>
      </Box>
      <Divider />
      <Box display="flex" justifyContent="center">
        {formatDate(new Date())}
      </Box>
      <Divider />
      <nav aria-label="Main">
        <Box
          display="flex"
          justifyContent="flex-end"
          gap={32}
          alignItems="center"
        >
          {user ? (
            <>
              {user.twoFactorEnabled ? (
                <NavLink to="/plaid_items">Plaid Items</NavLink>
              ) : null}
              <NavLink to="/accounts">Accounts</NavLink>
              <NavLink to="/settings">Settings</NavLink>
              <Box p={12}>
                <Form method="post" action="logout">
                  <Button type="submit">Log Out</Button>
                </Form>
              </Box>
            </>
          ) : (
            <>
              <NavLink to="/join">Sign Up</NavLink>
              <NavLink to="/login">Login</NavLink>
            </>
          )}
          {children}
        </Box>
      </nav>
    </Box>
  );
};
