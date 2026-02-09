import { Box } from "../Box/Box";

export const Navbar = () => {
  return (
    <nav className="nav">
      <Box>Will probably delete later</Box>
      {/* <Box>
        <h1>
          <NavLink to="/">Net Worth Tracker</NavLink>
        </h1>
      </Box>
      <Box>
        <ul className="nav-links">
          {loaderData.user ? (
            <>
              {loaderData.user.role === "admin" ? (
                <>
                  <li>
                    <NavLink to="/users">Users</NavLink>
                  </li>
                  <li>
                    <NavLink to="/contact/messages">
                      Contact Form Submissions
                    </NavLink>
                  </li>
                </>
              ) : null}
              <li>
                <NavLink to="/profile">My Profile</NavLink>
              </li>
              <li>
                <NavLink to="/accounts">Accounts</NavLink>
              </li>
              <li>
                <NavLink to="/plaid_items">Plaid Items</NavLink>
              </li>
              <li>
                <Form method="post" action="logout">
                  <Button type="submit">Log Out</Button>
                </Form>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/join">Join</NavLink>
              </li>
              <li>
                <NavLink to="/login">Login</NavLink>
              </li>
            </>
          )}
          <li>
            <fetcher.Form method="post">
              <Button
                name="colorMode"
                value={colorMode === "dark" ? "light" : "dark"}
              >
                {colorMode === "dark" ? "Light Mode" : "Dark Mode"}
              </Button>
            </fetcher.Form>
          </li>
        </ul>
      </Box> */}
    </nav>
  );
};
