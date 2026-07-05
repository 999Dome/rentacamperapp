/**
 * Bootstrap entry point for the contact MPA page: mounts the header, the
 * `ContactForm`, and the footer.
 */
import "bootstrap/dist/css/bootstrap.min.css";
import "../../scss/theme.scss";

import { MainHeader } from "../../components/mainheader.tsx";
import { MainFooter } from "../../components/mainfooter.tsx";
import { ContactForm } from "./ContactForm.tsx";

document.body.appendChild(MainHeader());
document.body.appendChild(ContactForm());
document.body.appendChild(MainFooter());
