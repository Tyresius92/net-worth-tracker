import { Box } from "~/components/Box/Box";
import { Link } from "~/components/Link/Link";

export default function PrivacyPolicy() {
  return (
    <Box p={32} maxWidth={800} mx="auto">
      <h1>Privacy Policy</h1>

      <Box>
        <h2>About This Policy</h2>
        <p>
          This Privacy Policy explains how we collect, use, store, and protect
          your information when you use our service. We may update this policy
          from time to time to reflect changes in the law or our practices. Any
          updates will be posted on this page.
        </p>
        <p>
          Our guiding principle is simple:{" "}
          <strong>
            we aim to collect and retain the minimum amount of data necessary to
            provide the service.
          </strong>
        </p>
      </Box>

      <Box>
        <h2>Our Principles</h2>
        <ul>
          <li>
            We collect only the data required to make the service function
          </li>
          <li>Your data belongs to you</li>
          <li>You may request deletion of your data at any time</li>
          <li>We do not sell your data</li>
          <li>We do not use your data for advertising or profiling</li>
          <li>
            We do not access your data unless required to operate or support the
            service
          </li>
        </ul>
      </Box>

      <Box>
        <h2>Information We Collect</h2>

        <h3>Information You Provide Directly</h3>
        <p>
          We collect information you provide when you create an account, enter
          data into forms on our site, or connect financial accounts through
          Plaid.
        </p>
        <p>
          This may include basic account identifiers and financial account
          information necessary to calculate and display your net worth.
        </p>

        <h3>Information Collected via Plaid</h3>
        <p>
          We use Plaid Inc. (&ldquo;Plaid&rdquo;) to connect your financial
          accounts.
        </p>
        <p>
          When you choose to connect an account, Plaid collects your financial
          institution credentials directly. We do not receive or store your bank
          login credentials.
        </p>
        <p>
          Plaid provides us with financial data such as account balances,
          account types, institution names, and other financial information you
          authorize.
        </p>
        <p>
          We use data provided by Plaid solely to provide the features you
          request, and in accordance with Plaid&apos;s Data Use Policy.
        </p>
      </Box>

      <Box>
        <h2>How We Use Your Information</h2>
        <p>
          We use your information only to display your net worth and related
          financial summaries, provide requested features and functionality, and
          diagnose and fix issues when you request support.
        </p>
        <p>
          We do not build advertising profiles, sell your data, or use your data
          for marketing purposes.
        </p>
      </Box>

      <Box>
        <h2>Data Retention</h2>
        <p>
          We retain your data only for as long as your account is active or as
          necessary to provide the service.
        </p>
        <p>
          You may request deletion of your data at any time. Once deleted, your
          data is permanently removed from our primary systems.
        </p>
        <p>
          Infrastructure providers may retain encrypted backups for a limited
          period (typically up to 7 days). These backups are used solely for
          disaster recovery and are not accessed except in the event of system
          failure.
        </p>
      </Box>

      <Box>
        <h2>Data Storage and Security</h2>
        <p>
          Your data is stored in a database hosted by our infrastructure
          provider (Fly.io), which applies industry-standard security measures.
        </p>
        <p>
          Security practices include encryption at rest for most sensitive
          financial data, restricted access to production systems, and use of
          secure infrastructure and access controls.
        </p>
        <p>
          Certain non-sensitive derived values (such as account balances) may be
          stored unencrypted for operational or performance reasons.
        </p>
      </Box>

      <Box>
        <h2>Your Rights</h2>
        <p>
          Depending on your location, you may have rights under applicable
          privacy laws (such as the GDPR or CCPA), including the right to
          access, correct, delete, or obtain a copy of your data.
        </p>
        <p>
          We honor these rights whenever reasonably possible. You can exercise
          them by contacting us via our{" "}
          <Link to="contact">Contact Us Page</Link>.
        </p>
      </Box>

      <Box>
        <h2>Cookies</h2>
        <p>
          We use a single, required cookie to manage user authentication and
          login state. We do not use analytics, advertising, or tracking
          cookies.
        </p>
      </Box>

      <Box>
        <h2>Legal Disclosures</h2>
        <p>
          We may disclose information if required to do so by law or in response
          to a valid legal request. When possible, we limit disclosures to the
          minimum required by law.
        </p>
      </Box>

      <Box>
        <h2>Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy or would like to
          exercise your privacy rights, please contact us via our{" "}
          <Link to="contact">Contact Us Page</Link>.
        </p>
      </Box>
    </Box>
  );
}
