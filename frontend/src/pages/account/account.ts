/**
 * Bootstrap entry point for the account MPA page: shows the account
 * dashboard (header, `AccountPage`, footer) if the visitor is logged in,
 * otherwise shows the login/register `AuthPage` instead.
 */
import "bootstrap/dist/css/bootstrap.min.css";
import "../../scss/theme.scss";
import { isLoggedIn } from "../../auth/auth.ts";
import { AuthPage } from "../../components/auth/AuthPage.tsx";
import { AccountPage } from "../../components/account/AccountPage.tsx";
import { MainHeader } from "../../components/mainheader.tsx";
import { MainFooter } from "../../components/mainfooter.tsx";

if (isLoggedIn()) {
  document.body.appendChild(MainHeader());
  document.body.appendChild(AccountPage());
  document.body.appendChild(MainFooter());
} else {
  document.body.appendChild(AuthPage());
}
