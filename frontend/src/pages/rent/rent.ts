/**
 * Bootstrap entry point for the rent MPA page: mounts the header, the
 * `RentPage` (camper search/filter/listing), and the footer.
 */
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "../../scss/theme.scss";
import { MainHeader } from "../../components/mainheader.tsx";
import { MainFooter } from "../../components/mainfooter.tsx";
import { RentPage } from "../../components/rent/RentPage.tsx";

document.body.appendChild(MainHeader());
document.body.appendChild(RentPage());
document.body.appendChild(MainFooter());
