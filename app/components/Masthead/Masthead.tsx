import { Form, Link } from "react-router";

import { getPublicationLabel } from "~/utils/publicationUtils";

import { Box } from "../Box/Box";
import { Button } from "../Button/Button";
import { Divider } from "../Divider/Divider";
import { Grid } from "../Grid/Grid";
import { NavLink } from "../NavLink/NavLink";
import { Text } from "../Text/Text";

import styles from "./Masthead.module.css";

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
    <Box px={56} pt={12}>
      <nav aria-label="Main">
        <Grid>
          <Grid.Item xs={12} m={4} alignSelf="center">
            <Text variant="byline">{getPublicationLabel(1234)}</Text>
          </Grid.Item>
          <Grid.Item xs={12} m={4} alignSelf="center">
            <Box display="flex" justifyContent="center" alignItems="center">
              <Text variant="byline">{formatDate(new Date())}</Text>
            </Box>
          </Grid.Item>
          <Grid.Item xs={12} m={4} alignSelf="center">
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
          </Grid.Item>
        </Grid>
      </nav>
      <Divider variant="heavy" />
      <Box
        display="flex"
        alignItems="center"
        py={16}
        gap={12}
        flexDirection="column"
      >
        <Link to="/" className={styles["site-title-link"]}>
          <h1 className={styles["site-title"]}>The Ledger</h1>
        </Link>
        <Text variant="deck">
          <em>Just the numbers · None of the noise</em>
        </Text>
      </Box>
      <Divider variant="heavy" />
      <Box p={2} />
      <Divider />
      <Box display="flex" justifyContent="center" gap={12} py={8}>
        <Text variant="byline">Established 2024</Text>
        <Text variant="byline">theledger.dev</Text>
      </Box>
      <Divider variant="heavy" />
    </Box>
  );
};
