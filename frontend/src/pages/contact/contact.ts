import "bootstrap/dist/css/bootstrap.min.css";
import "../../scss/custom.scss";

import { MainHeader } from "../../components/mainheader.tsx";
import { MainFooter } from "../../components/mainfooter.tsx";
import { ContactForm } from "./ContactForm.tsx";

document.body.appendChild(MainHeader());
document.body.appendChild(ContactForm());
document.body.appendChild(MainFooter());
