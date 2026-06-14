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
  user: {
    id: string;
    twoFactorEnabled: boolean;
    role: "admin" | "customer";
  } | null;
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
    <>
      {user?.role === "admin" && (
        <Box bg="amber-4" xsPx={56} xsPy={8}>
          <nav aria-label="Admin">
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text variant="byline">Admin</Text>
              <Box display="flex" alignItems="center" xsGap={24}>
                <NavLink to="/users">Users</NavLink>
                <NavLink to="/contact/messages">Contact messages</NavLink>
              </Box>
            </Box>
          </nav>
        </Box>
      )}
      <Box xsPx={56} xsPt={12}>
        <nav aria-label="Main">
          <Grid>
            <Grid.Item xs={12} m={2} alignSelf="center">
              <Text variant="byline">{getPublicationLabel(1234)}</Text>
            </Grid.Item>
            <Grid.Item xs={12} m={10} alignSelf="center">
              <Box
                display="flex"
                justifyContent="flex-end"
                xsGap={32}
                alignItems="center"
              >
                {user ? (
                  <>
                    {user.twoFactorEnabled ? (
                      <NavLink to="/plaid_items">Wire services</NavLink>
                    ) : null}
                    <NavLink to="/accounts">Sources</NavLink>
                    <NavLink to="/settings">Settings</NavLink>
                    <Box xsP={12}>
                      <Form method="post" action="logout">
                        <Button type="submit">Log Out</Button>
                      </Form>
                    </Box>
                  </>
                ) : (
                  <>
                    <NavLink to="/join">Apply for credentials</NavLink>
                    <NavLink to="/login">Present credentials</NavLink>
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
          xsPy={16}
          xsGap={12}
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
        <Box xsP={2} />
        <Divider />
        <Box display="flex" justifyContent="space-between" xsPy={8}>
          <Text variant="byline">Established 2024</Text>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Text variant="byline">{formatDate(new Date())}</Text>
          </Box>
          <Text variant="byline">theledger.dev</Text>
        </Box>
        <Divider variant="heavy" />
      </Box>
    </>
  );
};
