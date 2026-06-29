import "bootstrap/dist/css/bootstrap.min.css";
import "../../scss/theme.scss";
import { CheckoutPage } from "../../components/checkout/CheckoutPage";
import { MainHeader } from "../../components/mainheader";
import { MainFooter } from "../../components/mainfooter";

document.body.appendChild(MainHeader());
document.body.appendChild(CheckoutPage());
document.body.appendChild(MainFooter());
