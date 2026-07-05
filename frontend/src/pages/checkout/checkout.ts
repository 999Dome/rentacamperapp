/**
 * Bootstrap entry point for the checkout MPA page: mounts the header, the
 * `CheckoutPage` (which itself checks for a pending booking in
 * `sessionStorage` and redirects away if none is found), and the footer.
 */
import "bootstrap/dist/css/bootstrap.min.css";
import "../../scss/theme.scss";
import { CheckoutPage } from "../../components/checkout/CheckoutPage";
import { MainHeader } from "../../components/mainheader";
import { MainFooter } from "../../components/mainfooter";

document.body.appendChild(MainHeader());
document.body.appendChild(CheckoutPage());
document.body.appendChild(MainFooter());
